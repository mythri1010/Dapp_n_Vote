/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "volta",
  networks: {
    hardhat: {},
    volta: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`], // Keep the 0x prefix
      gas: 5000000, // Fixed gas limit (5 million)
      gasPrice: 1000000000, // 1 Gwei (1,000,000,000 wei)
      gasMultiplier: 1.2 // 20% buffer (optional)
    }
  }
};