const hre = require("hardhat");

async function main() {
  const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const USDC_MAINNET = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

  const TriviaStakeMulti = await hre.ethers.getContractFactory("TriviaStakeMulti");
  const contract = await TriviaStakeMulti.deploy(CUSD_MAINNET, USDC_MAINNET);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("TriviaStakeMulti deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});