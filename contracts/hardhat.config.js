require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/types').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    celoMainnet: {
      url: "https://forno.celo.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 42220,
    },
    celoAlfajores: {
      url: "https://1rpc.io/celo/alfajores",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 44787,
    },
  },
};