require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

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
};