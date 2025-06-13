const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  // Deploy the Voting contract
  const Voting = await ethers.getContractFactory("Voting");
  console.log("Deploying Voting contract...");
  
  const candidateNames = ["Mark", "Mike", "Henry", "Rock"];
  const votingDurationMinutes = 60 * 24; // 24 hours for testing
  
  const voting = await Voting.deploy(
    candidateNames,
    votingDurationMinutes
  );

  await voting.deployed();
  
  console.log("\n=== Deployment Successful ===");
  console.log("Contract address:", voting.address);
  console.log("Transaction hash:", voting.deployTransaction.hash);
  console.log("Network:", network.name);
  
  // Verify contract initialization
  console.log("\n=== Contract Verification ===");
  console.log("Owner:", await voting.owner());
  console.log("Candidate count:", (await voting.candidateCount()).toString());
  
  const votingEnd = await voting.votingEnd();
  console.log("Voting end time:", new Date(votingEnd * 1000).toLocaleString());
  console.log("Current time:", new Date().toLocaleString());
  console.log("Time remaining (minutes):", (votingEnd - Math.floor(Date.now() / 1000)) / 60);
  
  // Log all candidates
  console.log("\n=== Initial Candidates ===");
  const candidates = await Promise.all(
    Array(parseInt(await voting.candidateCount())).fill().map((_, i) => voting.candidates(i))
  );
  
  candidates.forEach((candidate, i) => {
    console.log(`Candidate ${i}: ${candidate.name} (Votes: ${candidate.voteCount})`);
  });

  console.log("\n=== Voting Status ===");
  console.log("Voting paused:", await voting.votingPaused());
  console.log("Voting status:", await voting.getVotingStatus());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n!!! Deployment Failed !!!");
    console.error(error);
    process.exit(1);
  });