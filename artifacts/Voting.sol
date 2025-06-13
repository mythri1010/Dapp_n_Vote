// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address public owner;
    mapping(address => bool) public voters;
    mapping(address => uint256) public currentVote;
    
    bool public votingPaused;
    uint256 public votingStart;
    uint256 public votingEnd;
    uint256 public candidateCount;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier votingEnabled() {
        require(!votingPaused, "Voting is currently paused");
        require(block.timestamp >= votingStart, "Voting has not started yet");
        require(block.timestamp < votingEnd, "Voting has ended");
        _;
    }

    constructor(string[] memory _candidateNames, uint256 _durationInMinutes) {
        require(_candidateNames.length > 0, "At least one candidate required");
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
        votingPaused = false;
        candidateCount = _candidateNames.length;
    }

    // Circuit breaker pattern for emergency stops
    function toggleVotingPause() public onlyOwner {
        votingPaused = !votingPaused;
    }

    function addCandidate(string memory _name) public onlyOwner {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidates.push(Candidate({
            name: _name,
            voteCount: 0
        }));
        candidateCount++;
    }

    function vote(uint256 _candidateIndex) public votingEnabled {
        require(!voters[msg.sender], "You have already voted (use changeVote instead)");
        require(_candidateIndex < candidates.length, "Invalid candidate");
        
        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
        currentVote[msg.sender] = _candidateIndex;
    }

    function changeVote(uint256 newCandidateIndex) public votingEnabled {
        require(voters[msg.sender], "You haven't voted yet");
        require(newCandidateIndex < candidates.length, "Invalid candidate");
        require(currentVote[msg.sender] != newCandidateIndex, "This is already your current vote");
        
        candidates[currentVote[msg.sender]].voteCount--;
        
       
        candidates[newCandidateIndex].voteCount++;
        currentVote[msg.sender] = newCandidateIndex;
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidateCount);
        for (uint i = 0; i < candidateCount; i++) {
            result[i] = candidates[i];
        }
        return result;
    }

    function getVotingStatus() public view returns (bool) {
        return (!votingPaused && 
                block.timestamp >= votingStart && 
                block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp < votingStart) return votingStart - block.timestamp;
        if (block.timestamp >= votingEnd) return 0;
        return votingEnd - block.timestamp;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    function resetAllVotes() public onlyOwner {
        for(uint i = 0; i < candidateCount; i++) {
            candidates[i].voteCount = 0;
        }
    }

    function resetVoter(address _voter) public onlyOwner {
        voters[_voter] = false;
        currentVote[_voter] = 0;
    }

    function getCandidate(uint256 index) public view returns (string memory, uint256) {
        require(index < candidateCount, "Invalid index");
        return (candidates[index].name, candidates[index].voteCount);
    }

    function extendVotingTime(uint256 additionalMinutes) public onlyOwner {
        require(block.timestamp < votingEnd, "Voting has already ended");
        votingEnd += additionalMinutes * 1 minutes;
    }

    function closeVotingEarly() public onlyOwner {
        require(block.timestamp < votingEnd, "Voting has already ended");
        votingEnd = block.timestamp;
    }
}