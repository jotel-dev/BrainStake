require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    celo: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220,
    },
    alfajores: {
      url: process.env.ALFAJORES_RPC_URL || "https://1rpc.io/celo/alfajores",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
    celoSepolia: {
      url: process.env.CELO_SEPOLIA_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44780,
    },
  },
};