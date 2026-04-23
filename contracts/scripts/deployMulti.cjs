const { ethers, network } = require("hardhat");

async function main() {
  const isMainnet = network.name === "celo";

  // Mainnet token addresses
  const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const USDC_MAINNET = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

  // Alfajores testnet token addresses
  const CUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  const USDC_ALFAJORES = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

  const cusdAddress = isMainnet ? CUSD_MAINNET : CUSD_ALFAJORES;
  const usdcAddress = isMainnet ? USDC_MAINNET : USDC_ALFAJORES;

  console.log(`Deploying TriviaStakeMulti to ${network.name}...`);
  console.log(`Using CUSD Address: ${cusdAddress}`);
  console.log(`Using USDC Address: ${usdcAddress}`);

  const TriviaStakeMulti = await ethers.getContractFactory("TriviaStakeMulti");
  const contract = await TriviaStakeMulti.deploy(cusdAddress, usdcAddress);

  await contract.deployed();
  const address = contract.address;

  console.log(`✅ TriviaStakeMulti deployed to ${network.name}:`, address);
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend/.env with NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
  console.log(`2. Verify the contract with: npx hardhat verify --network ${network.name} ${address} ${cusdAddress} ${usdcAddress}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
