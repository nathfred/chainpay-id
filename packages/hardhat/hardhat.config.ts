import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },

    // Base Sepolia Testnet
    baseSepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: process.env.BASESCAN_API_KEY || "",
        },
      },
    },

    // Base Mainnet (for final deployment)
    base: {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || ""],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
          apiKey: process.env.BASESCAN_API_KEY || "",
        },
      },
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
