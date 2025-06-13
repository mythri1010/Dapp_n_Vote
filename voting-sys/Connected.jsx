import React from "react";

const Connected = (props) => {
    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="connected-container">
            <h1>You are Connected to Metamask</h1>
            <p><strong>Metamask Account:</strong> {props.account}</p>
            <p><strong>Remaining Time:</strong> {formatTime(props.remainingTime)} (MM:SS)</p>
            <p>Your VT Balance: {props.balance}</p>
            <a href="https://volta-faucet.energyweb.org" target="_blank" rel="noreferrer">
                Get More VT Tokens
            </a>
            
            {props.showButton ? (
                <div className="vote-form">
                    <input 
                        type="number" 
                        placeholder="Enter Candidate Index" 
                        value={props.number} 
                        onChange={props.handleNumberChange}
                        min="0"
                        max={props.candidates.length - 1}
                        disabled={props.transactionInProgress}
                    />
                    <button 
                      onClick={props.voteFunction}
                      disabled={props.transactionInProgress}
                    >
                        {props.transactionInProgress ? 'Processing...' : 'Vote'}
                    </button>
                </div>
            ) : (
                <p className="voted-message">You have already voted or voting is closed</p>
            )}

            <div className="candidates-table">
                <h3>Voting Results</h3>
                {props.candidates.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Index</th>
                                <th>Candidate Name</th>
                                <th>Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.candidates.map((candidate) => (
                                <tr key={candidate.index}>
                                    <td>{candidate.index}</td>
                                    <td>{candidate.name}</td>
                                    <td>{candidate.voteCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No candidates available. The voting contract may not be initialized.</p>
                )}
            </div>
        </div>
    );
};

export default Connected;