// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TriviaStakeMulti is Ownable, ReentrancyGuard {
    mapping(bytes32 => Match) private matches;
    mapping(address => uint256) public housePool;
    mapping(address => mapping(address => uint256)) public playerRewards;

    IERC20 public cusd;
    IERC20 public usdc;

    struct Match {
        address creator;
        address token;
        uint256 stakeAmount;
        uint256 playerCount;
        bool resolved;
        address[] players;
        mapping(address => uint256) playerStakes;
        mapping(address => bool) hasRefunded;
    }

    event MatchCreated(bytes32 indexed matchId, address creator, address token, uint256 stakeAmount);
    event PlayerJoined(bytes32 indexed matchId, address player, uint256 stakeAmount);
    event RewardClaimed(address indexed player, address token, uint256 amount);
    event HouseFunded(address indexed funder, address token, uint256 amount);
    event MatchRefunded(bytes32 indexed matchId, address player, uint256 amount);
    event MatchResolved(bytes32 indexed matchId, uint256 totalPot, uint256 houseCut, address[] winners, address token);

    constructor(address _cusd, address _usdc) Ownable(msg.sender) {
        cusd = IERC20(_cusd);
        usdc = IERC20(_usdc);
    }

    function createMatch(bytes32 matchId, address token, uint256 stakeAmount) external nonReentrant {
        require(matches[matchId].creator == address(0), "Match exists");
        require(stakeAmount > 0, "Invalid stake amount");

        // Initialize match struct in storage
        Match storage match_ = matches[matchId];
        match_.creator = msg.sender;
        match_.token = token;
        match_.stakeAmount = stakeAmount;
        match_.playerCount = 0;
        match_.resolved = false;
        delete match_.players; // Ensure empty dynamic array

        // Creator automatically joins as first player
        IERC20 tok = IERC20(token);
        require(tok.transferFrom(msg.sender, address(this), stakeAmount), "Transfer failed");
        match_.players.push(msg.sender);
        match_.playerStakes[msg.sender] = stakeAmount;
        match_.playerCount++;

        emit MatchCreated(matchId, msg.sender, token, stakeAmount);
        emit PlayerJoined(matchId, msg.sender, stakeAmount);
    }

    function joinMatch(bytes32 matchId) external nonReentrant {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        require(!match_.resolved, "Match resolved");
        require(!isPlayer(matchId, msg.sender), "Already joined");
        require(match_.playerStakes[msg.sender] == 0, "Already staked");

        IERC20 token = IERC20(match_.token);
        require(token.transferFrom(msg.sender, address(this), match_.stakeAmount), "Transfer failed");

        match_.players.push(msg.sender);
        match_.playerStakes[msg.sender] = match_.stakeAmount;
        match_.playerCount++;

        emit PlayerJoined(matchId, msg.sender, match_.stakeAmount);
    }

    function isPlayer(bytes32 matchId, address player) internal view returns (bool) {
        Match storage match_ = matches[matchId];
        for (uint256 i = 0; i < match_.players.length; i++) {
            if (match_.players[i] == player) return true;
        }
        return false;
    }

    function refund(bytes32 matchId) external nonReentrant {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        require(!match_.resolved, "Match resolved");
        require(isPlayer(matchId, msg.sender), "Not a player");
        require(!match_.hasRefunded[msg.sender], "Already refunded");

        uint256 amount = match_.playerStakes[msg.sender];
        require(amount > 0, "No stake to refund");

        match_.hasRefunded[msg.sender] = true;
        match_.playerStakes[msg.sender] = 0;

        IERC20 token = IERC20(match_.token);
        require(token.transfer(msg.sender, amount), "Refund failed");

        emit MatchRefunded(matchId, msg.sender, amount);
    }

    function claimReward(address token) external nonReentrant {
        uint256 reward = playerRewards[msg.sender][token];
        require(reward > 0, "No reward");

        playerRewards[msg.sender][token] = 0;
        IERC20(token).transfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, token, reward);
    }

    function fundHousePool(address token) external nonReentrant {
        uint256 amount = playerRewards[msg.sender][token];
        require(amount > 0, "No funds");

        housePool[token] += amount;
        playerRewards[msg.sender][token] = 0;

        emit HouseFunded(msg.sender, token, amount);
    }

    function getMatchInfo(bytes32 matchId) external view returns (
        address creator,
        address token,
        uint256 stakeAmount,
        uint256 playerCount,
        bool resolved,
        address[] memory players
    ) {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        return (
            match_.creator,
            match_.token,
            match_.stakeAmount,
            match_.playerCount,
            match_.resolved,
            match_.players
        );
    }

    function getPlayerStake(bytes32 matchId, address player) external view returns (uint256) {
        Match storage match_ = matches[matchId];
        return match_.playerStakes[player];
    }

    function hasPlayerRefunded(bytes32 matchId, address player) external view returns (bool) {
        Match storage match_ = matches[matchId];
        return match_.hasRefunded[player];
    }

    function resolveMatch(bytes32 matchId, address[] memory winners) external nonReentrant {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        require(!match_.resolved, "Match already resolved");
        require(match_.playerCount > 0, "No players in match");
        require(msg.sender == match_.creator, "Only creator can resolve");

        uint256 totalPot;
        for (uint256 i = 0; i < match_.players.length; i++) {
            totalPot += match_.playerStakes[match_.players[i]];
        }
        require(totalPot > 0, "Pot is empty");

        address token = match_.token;
        uint256 houseCut;
        uint256 winnerPot;

        if (winners.length == 0) {
            houseCut = totalPot;
            winnerPot = 0;
        } else {
            // Verify all winners are active players (with positive stake)
            for (uint256 i = 0; i < winners.length; i++) {
                require(isPlayer(matchId, winners[i]), "Invalid winner address");
                require(match_.playerStakes[winners[i]] > 0, "Winner has no stake");
            }

            uint256 houseCutPercentage = 10;
            houseCut = (totalPot * houseCutPercentage) / 100;
            winnerPot = totalPot - houseCut;

            if (winnerPot > 0) {
                uint256 share = winnerPot / winners.length;
                for (uint256 i = 0; i < winners.length; i++) {
                    playerRewards[winners[i]][token] += share;
                }
            }
        }

        match_.resolved = true;
        housePool[token] += houseCut;
        emit MatchResolved(matchId, totalPot, houseCut, winners, token);
    }
}