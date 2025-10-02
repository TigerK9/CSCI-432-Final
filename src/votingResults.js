// This object holds all the data for the motion page
const motionData = {
    motionName: "Resolution to Implement Monthly Digital Newsletter",
    yesVotes: 85, // Number of 'Yes' votes (Green segment)
    noVotes: 32,  // Number of 'No' votes (Red segment)
    motionDescription: "This resolution proposes to discontinue the current quarterly printed bulletin and replace it with a monthly digital newsletter. The change aims to save on printing and mailing costs (estimated at $1,500 annually), improve communication frequency, and reduce environmental impact. The funds saved will be reallocated to upgrade the community website."
};

// Expose the data globally so it can be accessed by votingResults.html
window.motionData = motionData;