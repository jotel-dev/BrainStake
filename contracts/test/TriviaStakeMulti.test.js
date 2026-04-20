const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TriviaStakeMulti", function () {
  let TriviaStakeMulti;
  let contract;
  let owner;
  let player1;
  let player2;
  let cUSD;
  const matchId = ethers.keccak256(ethers.toUtf8Bytes("test-match-1"));

  // Helper to mint cUSD (assuming a mock ERC20 with mint)
  async function mintCUSD(to, amount) {
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    await cUSD.mint(to, amountWei);
    await cUSD.connect(to).approve(contract.target, amountWei);
  }

  before(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy mock CUSD (6 decimals)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cUSD = await MockERC20.deploy("cUSD", "cUSD", 6);
    await cUSD.waitForDeployment();

    // Deploy TriviaStakeMulti
    TriviaStakeMulti = await ethers.getContractFactory("TriviaStakeMulti");
    contract = await TriviaStakeMulti.deploy(await cUSD.getAddress(), await cUSD.getAddress());
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct cUSD address", async function () {
      expect(await contract.cusd()).to.equal(await cUSD.getAddress());
    });

    it("Should have zero housePool initially", async function () {
      const balance = await contract.housePool(await cUSD.getAddress());
      expect(balance).to.equal(0);
    });
  });

  describe("createMatch", function () {
    it("Should create a match with creator auto-joined", async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(matchId, await cUSD.getAddress(), stakeWei);

      const match = await contract.getMatchInfo(matchId);
      expect(match.creator).to.equal(owner.address);
      expect(match.token).to.equal(await cUSD.getAddress());
      expect(match.stakeAmount).to.equal(stakeWei);
      expect(match.playerCount).to.equal(1);
      expect(match.resolved).to.equal(false);
      expect(match.players[0]).to.equal(owner.address);
    });

    it("Should emit MatchCreated and PlayerJoined events", async function () {
      const stakeWei = ethers.parseUnits("0.01", 6);
      const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-events"));

      await expect(contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei))
        .to.emit(contract, "MatchCreated")
        .withArgs(testMatchId, owner.address, await cUSD.getAddress(), stakeWei)
        .and.to.emit(contract, "PlayerJoined")
        .withArgs(testMatchId, owner.address, stakeWei);
    });

    it("Should revert if match already exists", async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await expect(contract.createMatch(matchId, await cUSD.getAddress(), stakeWei))
        .to.be.revertedWith("Match exists");
    });
  });

  describe("joinMatch", function () {
    const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-match-2"));

    before(async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei);
    });

    it("Should allow another player to join", async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await mintCUSD(player1, "0.05");
      await contract.connect(player1).joinMatch(testMatchId);

      const match = await contract.getMatchInfo(testMatchId);
      expect(match.playerCount).to.equal(2);
      expect(match.players[1]).to.equal(player1.address);
    });

    it("Should emit PlayerJoined event", async function () {
      const testMatchId3 = ethers.keccak256(ethers.toUtf8Bytes("test-match-3"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId3, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.05");

      await expect(contract.connect(player1).joinMatch(testMatchId3))
        .to.emit(contract, "PlayerJoined")
        .withArgs(testMatchId3, player1.address, stakeWei);
    });

    it("Should revert if already joined", async function () {
      await expect(contract.connect(player1).joinMatch(testMatchId))
        .to.be.revertedWith("Already joined");
    });

    it("Should revert if match not found", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake-match"));
      await expect(contract.connect(player1).joinMatch(fakeId))
        .to.be.revertedWith("Match not found");
    });

    it("Should revert if match resolved", async function () {
      const testMatchId4 = ethers.keccak256(ethers.toUtf8Bytes("test-match-4"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId4, await cUSD.getAddress(), stakeWei);
      await contract.resolveMatch(testMatchId4, []); // resolve with no winners

      await expect(contract.connect(player1).joinMatch(testMatchId4))
        .to.be.revertedWith("Match resolved");
    });
  });

  describe("refund", function () {
    const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-refund-match"));

    before(async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.05");
      await contract.connect(player1).joinMatch(testMatchId);
    });

    it("Should allow player to refund before match resolved", async function () {
      const initialBalance = await cUSD.balanceOf(player1.address);
      await contract.connect(player1).refund(testMatchId);

      expect(await contract.hasPlayerRefunded(testMatchId, player1.address)).to.equal(true);
      const newBalance = await cUSD.balanceOf(player1.address);
      expect(newBalance).to.be.gt(initialBalance);
    });

    it("Should revert if not a player", async function () {
      await expect(contract.connect(player2).refund(testMatchId))
        .to.be.revertedWith("Not a player");
    });

    it("Should revert if already refunded", async function () {
      await expect(contract.connect(player1).refund(testMatchId))
        .to.be.revertedWith("Already refunded");
    });

    it("Should revert if match resolved", async function () {
      const resolvedMatchId = ethers.keccak256(ethers.toUtf8Bytes("resolved-match"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(resolvedMatchId, await cUSD.getAddress(), stakeWei);
      await contract.resolveMatch(resolvedMatchId, []);

      await expect(contract.connect(owner).refund(resolvedMatchId))
        .to.be.revertedWith("Match resolved");
    });
  });

  describe("resolveMatch", function () {
    const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-resolve-match"));

    before(async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.05");
      await contract.connect(player1).joinMatch(testMatchId);
    });

    it("Should allow creator to resolve with winner", async function () {
      const winners = [owner.address]; // creator wins
      await contract.resolveMatch(testMatchId, winners);

      const match = await contract.getMatchInfo(testMatchId);
      expect(match.resolved).to.equal(true);

      // Creator should have reward pending
      const reward = await contract.playerRewards(owner.address, await cUSD.getAddress());
      expect(reward).to.be.gt(0);
    });

    it("Should allow creator to resolve with multiple winners", async function () {
      const multiWinnerMatch = ethers.keccak256(ethers.toUtf8Bytes("multi-winner"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(multiWinnerMatch, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.05");
      await contract.connect(player1).joinMatch(multiWinnerMatch);
      // creator auto-joined, so total 2 players, 2 winners = everyone wins

      await contract.resolveMatch(multiWinnerMatch, [owner.address, player1.address]);
      const match = await contract.getMatchInfo(multiWinnerMatch);
      expect(match.resolved).to.equal(true);
    });

    it("Should revert if not creator", async function () {
      const otherMatch = ethers.keccak256(ethers.toUtf8Bytes("other-creator-match"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(otherMatch, await cUSD.getAddress(), stakeWei);

      await expect(contract.connect(player1).resolveMatch(otherMatch, []))
        .to.be.revertedWith("Only creator can resolve");
    });

    it("Should revert if already resolved", async function () {
      await expect(contract.resolveMatch(testMatchId, []))
        .to.be.revertedWith("Match already resolved");
    });

    it("Should take 10% house cut and distribute remainder", async function () {
      const testMatchId2 = ethers.keccak256(ethers.toUtf8Bytes("test-house-cut"));
      const stakeWei = ethers.parseUnits("0.06", 6); // 0.06 total (creator auto-joins with 0.06)
      await contract.createMatch(testMatchId2, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.06");
      await contract.connect(player1).joinMatch(testMatchId2);
      // total pot = 0.12

      await contract.resolveMatch(testMatchId2, [owner.address]); // only creator wins

      const houseBalance = await contract.housePool(await cUSD.getAddress());
      // 10% of 0.12 = 0.012
      expect(houseBalance).to.equal(ethers.parseUnits("0.012", 6));

      const creatorReward = await contract.playerRewards(owner.address, await cUSD.getAddress());
      // 90% of 0.12 = 0.108
      expect(creatorReward).to.equal(ethers.parseUnits("0.108", 6));
    });

    it("Should allow zero winners (house takes all)", async function () {
      const testMatchId3 = ethers.keccak256(ethers.toUtf8Bytes("test-house-takes-all"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId3, await cUSD.getAddress(), stakeWei);

      await contract.resolveMatch(testMatchId3, []);

      const houseBalance = await contract.housePool(await cUSD.getAddress());
      expect(houseBalance).to.equal(stakeWei);
    });
  });

  describe("claimReward", function () {
    const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-claim-match"));

    before(async function () {
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei);
      await mintCUSD(player1, "0.05");
      await contract.connect(player1).joinMatch(testMatchId);
      // Resolve with player1 as winner
      await contract.resolveMatch(testMatchId, [player1.address]);
    });

    it("Should allow winner to claim reward", async function () {
      const initialBalance = await cUSD.balanceOf(player1.address);
      await contract.connect(player1).claimReward(await cUSD.getAddress());

      const newBalance = await cUSD.balanceOf(player1.address);
      expect(newBalance).to.be.gt(initialBalance);

      // Reward balance should be zeroed
      expect(await contract.playerRewards(player1.address, await cUSD.getAddress())).to.equal(0);
    });

    it("Should emit RewardClaimed event", async function () {
      const testMatchId2 = ethers.keccak256(ethers.toUtf8Bytes("test-claim-2"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId2, await cUSD.getAddress(), stakeWei);
      await mintCUSD(owner, "0.05");
      await contract.resolveMatch(testMatchId2, [owner.address]);

      await expect(contract.connect(owner).claimReward(await cUSD.getAddress()))
        .to.emit(contract, "RewardClaimed")
        .withArgs(owner.address, await cUSD.getAddress(), stakeWei); // creator's stake + full pot (since only winner)
    });

    it("Should revert if no reward", async function () {
      await expect(contract.connect(player2).claimReward(await cUSD.getAddress()))
        .to.be.revertedWith("No reward");
    });
  });

  describe("fundHousePool", function () {
    it("Should allow user to fund house pool from their own reward balance", async function () {
      const testMatchId = ethers.keccak256(ethers.toUtf8Bytes("test-fund"));
      const stakeWei = ethers.parseUnits("0.05", 6);
      await contract.createMatch(testMatchId, await cUSD.getAddress(), stakeWei);
      await contract.resolveMatch(testMatchId, []); // house takes all, no reward

      // But we need a reward to fund. Let's create a match where owner wins and then fund.
      const testMatchId2 = ethers.keccak256(ethers.toUtf8Bytes("test-fund2"));
      await contract.createMatch(testMatchId2, await cUSD.getAddress(), stakeWei);
      await contract.resolveMatch(testMatchId2, [owner.address]);

      const rewardBefore = await contract.playerRewards(owner.address, await cUSD.getAddress());
      const houseBefore = await contract.housePool(await cUSD.getAddress());

      await contract.fundHousePool(await cUSD.getAddress());

      expect(await contract.playerRewards(owner.address, await cUSD.getAddress())).to.equal(0);
      expect(await contract.housePool(await cUSD.getAddress())).to.equal(houseBefore + rewardBefore);
    });
  });
});
