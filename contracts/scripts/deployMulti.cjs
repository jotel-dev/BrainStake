const { ethers } = require("hardhat");

async function main() {
  // Alfajores testnet token addresses
  const CUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const USDC_ALFAJORES = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

  const TriviaStakeMulti = await ethers.getContractFactory("TriviaStakeMulti");
  const contract = await TriviaStakeMulti.deploy(CUSD_ALFAJORES, USDC_ALFAJORES);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ TriviaStakeMulti deployed to Alfajores:", address);
  console.log("📝 CUSD:", CUSD_ALFAJORES);
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend/.env with NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
  console.log("2. Test on Alfajores before mainnet");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
