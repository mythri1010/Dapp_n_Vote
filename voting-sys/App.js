import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAbi, contractAddress } from './Constant/constant';
import Login from './Components/Login';
import Connected from './Components/Connected';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [balance, setBalance] = useState('0');
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            await updateBalance(accounts[0]);
            await fetchContractData();
          }
        } catch (error) {
          console.error("Initial connection check failed:", error);
        }
      }
      setIsLoading(false);
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        getCandidates();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const handleAccountsChanged = async (accounts) => {
    console.log('Accounts changed:', accounts);
    
    if (accounts.length === 0) {
      setIsConnected(false);
      setAccount(null);
      setBalance('0');
      setShowLogin(true);
    } else {
      const newAccount = accounts[0];
      if (newAccount !== account) {
        setAccount(newAccount);
        setIsConnected(true);
        await updateBalance(newAccount);
        await fetchContractData();
      }
    }
  };

  async function updateBalance(address) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Balance update error:", error);
      setBalance('0');
    }
  }

  async function fetchContractData() {
    try {
      await getCandidates();
      await getRemainingTime();
      await getCurrentStatus();
      if (isConnected) {
        await checkVoteEligibility();
      }
    } catch (error) {
      console.error("Contract data fetch error:", error);
    }
  }

  async function connectToMetamask() {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        setShowLogin(false);
        await updateBalance(accounts[0]);
        await fetchContractData();
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Connection failed: ${error.message}`);
    }
  }

  async function checkVoteEligibility() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
      );
      const voteStatus = await contractInstance.voters(await signer.getAddress());
      setCanVote(!voteStatus);
    } catch (error) {
      console.error("Vote eligibility check failed:", error);
      setCanVote(false);
    }
  }

  async function getCandidates() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        [
          "function getAllVotesOfCandidates() view returns (tuple(string name, uint256 voteCount)[])",
          "function candidateCount() view returns (uint256)"
        ],
        provider
      );

      let candidatesList;
      try {
        candidatesList = await contract.getAllVotesOfCandidates();
      } catch (e) {
        console.log("Using fallback individual fetch...");
        const count = await contract.candidateCount();
        candidatesList = [];
        for (let i = 0; i < count; i++) {
          candidatesList.push(await contract.candidates(i));
        }
      }

      const formattedCandidates = candidatesList.map((candidate, index) => ({
        index,
        name: candidate.name,
        voteCount: candidate.voteCount.toString(),
        canVote: canVote
      }));

      setCandidates(formattedCandidates);
      
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      if (candidates.length === 0) {
        setCandidates([
          { index: 0, name: "Mark", voteCount: "0", canVote },
          { index: 1, name: "Mike", voteCount: "0", canVote },
          { index: 2, name: "Henry", voteCount: "0", canVote },
          { index: 3, name: "Rock", voteCount: "0", canVote }
        ]);
      }
    }
  }

  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
      );
      const status = await contractInstance.getVotingStatus();
      setVotingStatus(status);
      return status;
    } catch (error) {
      console.error("getCurrentStatus error:", error);
      return false;
    }
  }

  async function getRemainingTime() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
      );
      const time = await contractInstance.getRemainingTime();
      setRemainingTime(parseInt(time, 16));
    } catch (error) {
      console.error("getRemainingTime error:", error);
    }
  }

  async function vote() {
    if (transactionInProgress) {
      alert('Please wait for the current transaction to complete');
      return;
    }

    if (!number || number === '') {
      alert('Please select a candidate to vote for');
      return;
    }

    // Validate candidate index
    if (number < 0 || number >= candidates.length) {
      alert('Invalid candidate selected');
      return;
    }

    setTransactionInProgress(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress, 
        contractAbi, 
        signer
      );

      // Check voting status
      const isVotingOpen = await getCurrentStatus();
      if (!isVotingOpen) {
        alert('Voting is currently closed');
        setTransactionInProgress(false);
        return;
      }

      // Check eligibility
      const currentAddress = await signer.getAddress();
      const hasVoted = await contractInstance.voters(currentAddress);
      if (hasVoted) {
        alert('You have already voted');
        setCanVote(false);
        setTransactionInProgress(false);
        return;
      }

      // Check balance
      const balance = await provider.getBalance(currentAddress);
      const formattedBalance = ethers.utils.formatEther(balance);
      setBalance(formattedBalance);

      if (balance.eq(0)) {
        alert(`Your balance is 0 VT. Get test VT at:\nhttps://volta-faucet.energyweb.org`);
        setTransactionInProgress(false);
        return;
      }

      // Estimate gas with buffer
      let gasEstimate;
      try {
        gasEstimate = await contractInstance.estimateGas.vote(number);
        gasEstimate = gasEstimate.mul(15).div(10); // Add 50% buffer
      } catch (estimateError) {
        console.warn("Gas estimate failed, using fallback", estimateError);
        gasEstimate = ethers.BigNumber.from(1000000); // Higher fallback
      }

      const gasPrice = await provider.getGasPrice();
      const totalCost = gasEstimate.mul(gasPrice);

      if (balance.lt(totalCost)) {
        alert(`Insufficient funds for gas. You need at least ${ethers.utils.formatEther(totalCost)} VT`);
        setTransactionInProgress(false);
        return;
      }

      // Send transaction with higher gas limit
      console.log("Sending vote transaction...");
      const tx = await contractInstance.vote(number, {
        gasLimit: gasEstimate,
        gasPrice: gasPrice
      });

      console.log("Transaction sent, waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Update UI
      await getCandidates();
      await checkVoteEligibility();
      
      alert(`Successfully voted for ${candidates[number].name}!`);
      
    } catch (error) {
      console.error("Voting error:", error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        alert(`Insufficient VT tokens for gas. Get test VT at:\nhttps://volta-faucet.energyweb.org`);
      } else if (error.message.includes('User denied transaction')) {
        alert('You rejected the transaction');
      } else if (error.message.includes('revert')) {
        alert('Transaction reverted. You may have already voted or voting is closed.');
      } else {
        alert(`Voting failed: ${error.reason || error.message}`);
      }
    } finally {
      setTransactionInProgress(false);
    }
  }

  async function changeVote(newCandidateIndex) {
    if (transactionInProgress) return;

    setTransactionInProgress(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      
      const tx = await contract.changeVote(newCandidateIndex);
      await tx.wait();
      
      await getCandidates();
      alert(`Vote changed to candidate ${newCandidateIndex}`);
    } catch (error) {
      console.error("Change vote failed:", error);
      alert(`Failed to change vote: ${error.reason || error.message}`);
    } finally {
      setTransactionInProgress(false);
    }
  }

  function handleNumberChange(e) {
    const value = e.target.value;
    if (value === '' || (value >= 0 && value < candidates.length)) {
      setNumber(value);
    }
  }

  if (isLoading) {
    return <div className="app-loading">Loading application...</div>;
  }

  return (
    <div className="App">
      {showLogin ? (
        <Login connectWallet={connectToMetamask} />
      ) : (
        <Connected
          account={account}
          candidates={candidates}
          remainingTime={remainingTime}
          number={number}
          handleNumberChange={handleNumberChange}
          voteFunction={vote}
          changeVoteFunction={changeVote}
          showButton={canVote && votingStatus}
          balance={balance}
          transactionInProgress={transactionInProgress}
        />
      )}
    </div>
  );
}

export default App;