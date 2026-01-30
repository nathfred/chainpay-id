const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChainPay ID contracts...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  console.log(
    "💰 Account balance:",
    hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
    "ETH",
  );

  // Deploy MockIDRX
  console.log("\n📝 Deploying MockIDRX...");
  const MockIDRX = await hre.ethers.getContractFactory("MockIDRX");
  const mockIDRX = await MockIDRX.deploy();
  await mockIDRX.waitForDeployment();
  const idrxAddress = await mockIDRX.getAddress();
  console.log("✅ MockIDRX deployed to:", idrxAddress);

  // Deploy MerchantRegistry
  console.log("\n📝 Deploying MerchantRegistry...");
  const MerchantRegistry = await hre.ethers.getContractFactory("MerchantRegistry");
  const merchantRegistry = await MerchantRegistry.deploy();
  await merchantRegistry.waitForDeployment();
  const registryAddress = await merchantRegistry.getAddress();
  console.log("✅ MerchantRegistry deployed to:", registryAddress);

  // Deploy PaymentProcessor
  console.log("\n📝 Deploying PaymentProcessor...");
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(
    idrxAddress,
    registryAddress,
    deployer.address, // Fee collector
  );
  await paymentProcessor.waitForDeployment();
  const processorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", processorAddress);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Summary:");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│  Contract Name        │  Address                        │");
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log("│  MockIDRX             │", idrxAddress, "│");
  console.log("│  MerchantRegistry     │", registryAddress, "│");
  console.log("│  PaymentProcessor     │", processorAddress, "│");
  console.log("└─────────────────────────────────────────────────────────┘");

  console.log("\n💡 Next steps:");
  console.log("  1. Copy addresses above");
  console.log("  2. Update packages/nextjs/.env.local:");
  console.log("     NEXT_PUBLIC_IDRX_TOKEN_ADDRESS=" + idrxAddress);
  console.log("     NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS=" + registryAddress);
  console.log("     NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS=" + processorAddress);
  console.log("\n  3. Verify contracts on BaseScan:");
  console.log("     yarn hardhat verify --network baseSepolia " + idrxAddress);
  console.log("     yarn hardhat verify --network baseSepolia " + registryAddress);
  console.log(
    "     yarn hardhat verify --network baseSepolia " +
      processorAddress +
      ' "' +
      idrxAddress +
      '" "' +
      registryAddress +
      '" "' +
      deployer.address +
      '"',
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
