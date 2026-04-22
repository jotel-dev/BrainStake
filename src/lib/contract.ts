import { bytesToHex, padBytes } from "viem";

export const TRIVIA_STAKE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xF34d1C20e62DE0d72E7a4828A70F17b3AFDCfA8E";

// Mainnet addresses
export const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
export const USDC_ADDRESS = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

// Testnet addresses
export const ALFAJORES_CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export const getCUSDAddress = (chainId?: number) => {
  if (chainId === 44787) return ALFAJORES_CUSD_ADDRESS;
  if (chainId === 42220) return CUSD_ADDRESS;
  return CUSD_ADDRESS;
};

export function stringToBytes32(value: string | null | undefined): `0x${string}` {
  if (!value) return "0x0000000000000000000000000000000000000000000000000000000000000000";
  const bytes = new TextEncoder().encode(value);
  const padded = padBytes(bytes, { size: 32 });
  return bytesToHex(padded);
}

export const TRIVIA_STAKE_ABI = [
  // Create a new match; creator is auto-joined as first player
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" }
    ],
    "name": "createMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Join an existing match
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" }
    ],
    "name": "joinMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Refund stake if match not resolved and caller is a player
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Claim reward from a resolved match (token-specific)
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Fund house pool from own rewards
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "fundHousePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Resolve a match and distribute rewards to winners
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
      { "internalType": "address[]", "name": "winners", "type": "address[]" }
    ],
    "name": "resolveMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View: house pool balance for a token
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "housePool",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View: get match info (creator, token, stake, player count, resolved status, players list)
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" }
    ],
    "name": "getMatchInfo",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "playerCount", "type": "uint256" },
      { "internalType": "bool", "name": "resolved", "type": "bool" },
      { "internalType": "address[]", "name": "players", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View: get a player's stake in a match
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
      { "internalType": "address", "name": "player", "type": "address" }
    ],
    "name": "getPlayerStake",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View: check if a player has refunded in a match
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
      { "internalType": "address", "name": "player", "type": "address" }
    ],
    "name": "hasPlayerRefunded",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // View: per-player per-token reward balance
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "playerRewards",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Events (kept for reference; add to your event listeners if needed)
// event MatchCreated(bytes32 indexed matchId, address creator, address token, uint256 stakeAmount);
// event PlayerJoined(bytes32 indexed matchId, address player, uint256 stakeAmount);
// event MatchRefunded(bytes32 indexed matchId, address player, uint256 amount);
// event RewardClaimed(address indexed player, address token, uint256 amount);
// event MatchResolved(bytes32 indexed matchId, uint256 totalPot, uint256 houseCut, address[] winners, address token);
// event HouseFunded(address indexed funder, address token, uint256 amount);


export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
