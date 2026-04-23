require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 44787,
    },
    celo: {
      url: "https://1rpc.io/celo",
      accounts: [process.env.PRIVATE_KEY],
    },
    alfajores: {
      url: "https://1rpc.io/celo/alfajores",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY || "YOUR_CELOSCAN_API_KEY",
      celo: process.env.CELOSCAN_API_KEY || "YOUR_CELOSCAN_API_KEY",
    },
    customChains: [
      {
        network: "alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io/",
        },
      },
    ],
  },
};