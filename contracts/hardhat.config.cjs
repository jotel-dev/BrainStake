require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    celoMainnet: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220,
    },
    celoAlfajores: {
      url: process.env.ALFAJORES_RPC_URL || "https://1rpc.io/celo/alfajores",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
  },
};
