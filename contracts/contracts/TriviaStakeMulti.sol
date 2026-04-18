// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TriviaStakeMulti is Ownable, ReentrancyGuard {
    mapping(bytes32 => Match) public matches;
    mapping(address => uint256) public housePool;
    mapping(address => uint256) public playerRewards;

    IERC20 public cusd;
    IERC20 public usdc;

    struct Match {
        address creator;
        address token;
        uint256 stakeAmount;
        uint256 playerCount;
        bool resolved;
        address[] players;
    }

    event MatchCreated(bytes32 indexed matchId, address creator, address token, uint256 stakeAmount);
    event PlayerJoined(bytes32 indexed matchId, address player);
    event RewardClaimed(address indexed player, uint256 amount);
    event HouseFunded(address indexed funder, uint256 amount);
    event MatchRefunded(bytes32 indexed matchId, address player);

    constructor(address _cusd, address _usdc) {
        cusd = IERC20(_cusd);
        usdc = IERC20(_usdc);
    }

    function createMatch(bytes32 matchId, address token) external nonReentrant {
        require(matches[matchId].creator == address(0), "Match exists");
        
        uint256 stakeAmount = 1000000000000000000; // 1 cUSD (6 decimals)
        
        matches[matchId] = Match({
            creator: msg.sender,
            token: token,
            stakeAmount: stakeAmount,
            playerCount: 0,
            resolved: false,
            players: new address[](0)
        });

        emit MatchCreated(matchId, msg.sender, token, stakeAmount);
    }

    function joinMatch(bytes32 matchId) external nonReentrant {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        require(!match_.resolved, "Match resolved");

        IERC20 token = IERC20(match_.token);
        require(token.transferFrom(msg.sender, address(this), match_.stakeAmount), "Transfer failed");

        match_.players.push(msg.sender);
        match_.playerCount++;

        emit PlayerJoined(matchId, msg.sender);
    }

    function refund(bytes32 matchId) external nonReentrant {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match not found");
        require(!match_.resolved, "Match resolved");

        IERC20 token = IERC20(match_.token);
        require(token.transfer(msg.sender, match_.stakeAmount), "Refund failed");

        emit MatchRefunded(matchId, msg.sender);
    }

    function claimReward(address token) external nonReentrant {
        uint256 reward = playerRewards[msg.sender];
        require(reward > 0, "No reward");

        playerRewards[msg.sender] = 0;
        IERC20(token).transfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function fundHousePool(address token) external nonReentrant {
        uint256 amount = playerRewards[msg.sender];
        require(amount > 0, "No funds");

        housePool[token] += amount;
        playerRewards[msg.sender] = 0;

        emit HouseFunded(msg.sender, amount);
    }
}