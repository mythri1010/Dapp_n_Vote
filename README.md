# Dapp_n_Vote 
A decentralized voting application (DApp) built on blockchain technology using MetaMask for secure transactions.

# 🗳️ Blockchain Voting DApp
A **decentralized voting application** built with React, Ethers.js, and Solidity, leveraging MetaMask for secure, transparent, and tamper-proof elections.

![image](https://github.com/user-attachments/assets/5f530bf1-59c8-4762-98f9-98ff149b62cd)
![image](https://github.com/user-attachments/assets/94ae5d75-af6b-40ee-a9bd-77c3cb5fdc6e)
![image](https://github.com/user-attachments/assets/b0222953-1479-4e70-9c61-2df92c5054a7)

## 🔥 Features
- **Secure Voting**: Votes are recorded on the blockchain (immutable and verifiable).
- **MetaMask Integration**: Users authenticate via their Ethereum wallet.
- **Real-Time Results**: Live vote counts displayed in a table.
- **Time-Limited Elections**: Voting period enforced by smart contracts.
- **Gas Optimization**: Handles transaction failures and gas estimation.

## 🛠️ Tech Stack
- **Frontend**: React, Ethers.js, CSS
- **Blockchain**: Solidity (Smart Contracts), Ethereum (Volta Testnet)
- **Tools**: MetaMask, Git, GitHub

## 📂 Project Structure
.
├── public/                  # Static assets (HTML, images)
│   ├── index.html           # Main HTML template
│   └── favicon.ico          # App icon
├── src/
│   ├── Components/          # React components
│   │   ├── Login.jsx        # Login page component
│   │   └── Connected.jsx    # Voting interface component
│   ├── Constant/
│   │   └── constant.js      # Contract ABI and address config
│   ├── App.js               # Main application logic
│   ├── App.css              # Global styles
│   └── index.js             # React entry point
├── contracts/               # Smart contracts (optional)
│   └── Voting.sol           # Solidity contract code
├── README.md                # Project documentation
└── package.json             # Node.js dependencies

## 🚀 Getting Started
### Prerequisites
- MetaMask browser extension
- Node.js (v16+)
- Git

## Smart Contract Deployment
1. Compile and deploy the contract (e.g., using Hardhat or Remix).
2. Update contractAddress and contractAbi in src/Constant/constant.js.

## 🌟 Uniqueness
- Vote Flexibility: Unlike traditional systems, users can change their vote during the voting period.
- Cost-Efficient: Optimized gas usage with fallback mechanisms.
- Transparency: Every vote is recorded on-chain, auditable by anyone.
- No Central Authority: Fully decentralized, eliminating tampering risks.


