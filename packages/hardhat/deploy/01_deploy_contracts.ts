import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying ChainPay ID contracts...");
  console.log("📍 Deployer address:", deployer);

  // For Base Sepolia testnet, deploy MockIDRX
  // For Base mainnet, use existing IDRX address
  let idrxAddress: string;

  if (hre.network.name === "baseSepolia" || hre.network.name === "hardhat") {
    console.log("📝 Deploying MockIDRX...");
    const mockIDRX = await deploy("MockIDRX", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    idrxAddress = mockIDRX.address;
    console.log("✅ MockIDRX deployed to:", idrxAddress);
  } else {
    // Use real IDRX address on Base mainnet
    // TODO: Replace with actual IDRX contract address on Base
    idrxAddress = "0x0000000000000000000000000000000000000000"; // Replace this!
    console.log("📌 Using existing IDRX at:", idrxAddress);
  }

  // Deploy MerchantRegistry
  console.log("📝 Deploying MerchantRegistry...");
  const merchantRegistry = await deploy("MerchantRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ MerchantRegistry deployed to:", merchantRegistry.address);

  // Deploy PaymentProcessor
  console.log("📝 Deploying PaymentProcessor...");
  const paymentProcessor = await deploy("PaymentProcessor", {
    from: deployer,
    args: [
      idrxAddress, // IDRX token address
      merchantRegistry.address, // MerchantRegistry address
      deployer, // Fee collector (initially deployer)
    ],
    log: true,
    autoMine: true,
  });
  console.log("✅ PaymentProcessor deployed to:", paymentProcessor.address);

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Summary:");
  console.log("  IDRX Token:", idrxAddress);
  console.log("  MerchantRegistry:", merchantRegistry.address);
  console.log("  PaymentProcessor:", paymentProcessor.address);
  console.log("\n💡 Next steps:");
  console.log("  1. Update .env.local with contract addresses");
  console.log("  2. Verify contracts on BaseScan");
  console.log("  3. Start frontend development");
};

export default deployContracts;
deployContracts.tags = ["all"];
