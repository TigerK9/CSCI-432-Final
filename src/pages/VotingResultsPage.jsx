import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import '../css/votingResults_style.css';

Chart.register(...registerables);

// In a real app, this data would be fetched based on the motion ID from the URL
const motionData = {
    motionName: "Resolution to Implement Monthly Digital Newsletter",
    yesVotes: 85,
    noVotes: 32,
    motionDescription: "This resolution proposes to discontinue the current quarterly printed bulletin and replace it with a monthly digital newsletter. The change aims to save on printing and mailing costs (estimated at $1,500 annually), improve communication frequency, and reduce environmental impact. The funds saved will be reallocated to upgrade the community website."
};

const VotingResultsPage = () => {
    // Set page title dynamically
    useEffect(() => {
        document.title = `${motionData.motionName} - Results`;
    }, []);

    const chartData = {
        labels: ['Yes Votes', 'No Votes'],
        datasets: [{
            data: [motionData.yesVotes, motionData.noVotes],
            backgroundColor: ['#4CAF50', '#F44336'],
            hoverOffset: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.parsed} votes`;
                    }
                }
            }
        }
    };

    const totalVotes = motionData.yesVotes + motionData.noVotes;
    const yesPercent = totalVotes > 0 ? ((motionData.yesVotes / totalVotes) * 100).toFixed(1) : 0;
    const noPercent = totalVotes > 0 ? ((motionData.noVotes / totalVotes) * 100).toFixed(1) : 0;

    return (
        <div style={{ paddingTop: '80px' }}>
            <div className="taskbar">
                <div className="taskbar-left">
                    <Link to="/home" className="taskbar-icon" title="Home">
                        <i className="bi-house"></i>
                    </Link>
                </div>
                <div className="taskbar-right">
                    <Link to="/profile" className="taskbar-icon" title="Profile">
                        <i className="bi-person"></i>
                    </Link>
                </div>
            </div>

            <div className="main-container">
                <h1 className="motion-title">{motionData.motionName}</h1>
                
                <div className="content-wrapper">
                    <div className="chart-container">
                        <Pie data={chartData} options={chartOptions} />
                        <div id="voteSummary">
                            <p><strong>Total Votes:</strong> {totalVotes}</p>
                            <p className="yes-votes"><strong>Yes:</strong> {motionData.yesVotes} ({yesPercent}%)</p>
                            <p className="no-votes"><strong>No:</strong> {motionData.noVotes} ({noPercent}%)</p>
                        </div>
                    </div>
                </div>
                
                <div className="bottom-section">
                    <div className="motion-description-box">
                        <h2>Motion Description</h2>
                        <p>{motionData.motionDescription}</p>
                    </div>
                </div>
            </div>
            
            <Link to="/minutes" className="back-button">
                Back to Minutes
            </Link>
        </div>
    );
};

export default VotingResultsPage;