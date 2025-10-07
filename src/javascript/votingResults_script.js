// This object holds all the data for the motion page
const motionData = {
    motionName: "Resolution to Implement Monthly Digital Newsletter",
    yesVotes: 85, // Number of 'Yes' votes
    noVotes: 32,  // Number of 'No' votes
    motionDescription: "This resolution proposes to discontinue the current quarterly printed bulletin and replace it with a monthly digital newsletter. The change aims to save on printing and mailing costs (estimated at $1,500 annually), improve communication frequency, and reduce environmental impact. The funds saved will be reallocated to upgrade the community website."
};

// Expose the data globally (necessary if other scripts/pages need it, otherwise this line can be removed)
window.motionData = motionData;

// Wait until the HTML document is fully loaded before executing any DOM manipulation
document.addEventListener('DOMContentLoaded', () => {
    
    const motion = window.motionData;
    
    // --- 1. Set the Title and Description ---
    document.getElementById('motionTitle').textContent = motion.motionName;
    document.getElementById('motionDescription').textContent = motion.motionDescription;
    document.getElementById('pageTitle').textContent = motion.motionName + ' - Results';

    // --- 2. Define Colors and Render the Pie Chart ---
    
    // Get CSS custom properties (variables) for chart colors
    const rootStyles = getComputedStyle(document.documentElement);
    const yesColor = rootStyles.getPropertyValue('--yes-color').trim();
    const noColor = rootStyles.getPropertyValue('--no-color').trim();
    
    const ctx = document.getElementById('votePieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Yes Votes', 'No Votes'],
            datasets: [{
                data: [motion.yesVotes, motion.noVotes],
                backgroundColor: [
                    yesColor, 
                    noColor 
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                     callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + ' votes';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    
    // --- 3. Display vote summary using CSS classes for styling ---
    const totalVotes = motion.yesVotes + motion.noVotes;
    const yesPercent = totalVotes > 0 ? ((motion.yesVotes / totalVotes) * 100).toFixed(1) : 0;
    const noPercent = totalVotes > 0 ? ((motion.noVotes / totalVotes) * 100).toFixed(1) : 0;
    
    // Note the use of classes 'yes-votes' and 'no-votes' instead of inline styles
    document.getElementById('voteSummary').innerHTML = `
        <p><strong>Total Votes:</strong> ${totalVotes}</p>
        <p class="yes-votes"><strong>Yes:</strong> ${motion.yesVotes} (${yesPercent}%)</p>
        <p class="no-votes"><strong>No:</strong> ${motion.noVotes} (${noPercent}%)</p>
    `;
});