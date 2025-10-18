import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/minutes_style.css'; // Assuming styles are compatible

const MINUTES_STORAGE_KEY = 'ronr-minutesData';

const initialMotionData = [
    {
        id: 1,
        time: "9:05 AM",
        title: "Motion to Approve Previous Minutes",
        result: "Passed",
        description: "Mr. Jones moved to approve the minutes from the previous meeting (September 2025) as distributed via email.",
        voting_results: { yes: 15, no: 0, abstain: 2 },
        chair_summary: "The minutes were approved without any amendments. Process was quick and clean.",
    },
    {
        id: 2,
        time: "9:15 AM",
        title: "Motion to Allocate $500 for New Supplies",
        result: "Passed",
        description: "Ms. Chen moved that the organization allocate $500 from the general fund to purchase new stationery and office supplies, effective immediately.",
        voting_results: { yes: 14, no: 3, abstain: 0 },
        chair_summary: "A brief discussion occurred regarding specific vendors, but the motion was approved with minor opposition.",
    },
    {
        id: 3,
        time: "9:45 AM",
        title: "Motion to Postpone Vote on Bylaws Amendments",
        result: "Failed",
        description: "Mr. Smith moved to postpone consideration of the proposed bylaws amendments until the next regular meeting in November.",
        voting_results: { yes: 6, no: 11, abstain: 0 },
        chair_summary: "The motion failed, indicating strong sentiment to proceed with the amendments today. The main motion remains on the floor.",
    },
    {
        id: 4,
        time: "10:05 AM",
        title: "Motion to Amend Bylaws, Article IV, Section 2",
        result: "Passed (2/3)",
        description: "The main question regarding the amendment to require a 2/3rds vote for special funds allocation was put to a vote.",
        voting_results: { yes: 13, no: 4, abstain: 0 },
        chair_summary: "The motion required a 2/3rds majority (12 votes needed) and passed easily. The bylaws are amended as stated.",
    }
];

const MinutesPage = () => {
    const [motions, setMotions] = useState([]);
    const [activeMotionId, setActiveMotionId] = useState(null);

    useEffect(() => {
        const storedData = localStorage.getItem(MINUTES_STORAGE_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                const loadedMotions = parsedData.motions || initialMotionData;
                setMotions(loadedMotions);
                setActiveMotionId(parsedData.activeId ?? (loadedMotions.length > 0 ? loadedMotions[0].id : null));
            } catch (e) {
                console.error("Error parsing minutes data from localStorage", e);
                setMotions(initialMotionData);
                setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
            }
        } else {
            setMotions(initialMotionData);
            setActiveMotionId(initialMotionData.length > 0 ? initialMotionData[0].id : null);
        }
    }, []);

    useEffect(() => {
        if (activeMotionId !== null) {
            localStorage.setItem(MINUTES_STORAGE_KEY, JSON.stringify({ motions, activeId: activeMotionId }));
        }
    }, [activeMotionId, motions]);

    const handleSelectMotion = (id) => {
        setActiveMotionId(id);
    };

    const exportMinutes = () => {
        alert('Download functionality is a placeholder. You would implement file generation here!');
    };

    const activeMotion = motions.find(m => m.id === activeMotionId);

    return (
        <div className="min-h-screen" style={{ paddingTop: '80px' }}>
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
            <header>
                <div className="max-w-7xl mx-auto flex justify-center py-4">
                    <div className="bg-dark-header text-white p-4 rounded-lg shadow-lg">
                        <h1 className="text-xl font-bold">Meeting Minutes (Q4 Session)</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg h-[80vh] overflow-y-auto">
                    <div className="p-4 bg-gray-50 border-b rounded-t-xl sticky top-0 z-10">
                        <h2 className="text-lg font-bold text-gray-700">Chronological Motion Index</h2>
                    </div>
                    <div id="motion-list-container" className="p-3">
                        {motions.length > 0 ? motions.map(motion => (
                            <div key={motion.id} className={`motion-item p-4 border-b border-gray-200 cursor-pointer transition duration-150 rounded-lg shadow-sm mb-2 ${motion.id === activeMotionId ? 'active' : ''}`} onClick={() => handleSelectMotion(motion.id)}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex space-x-2">
                                        <span className="time-badge text-xs font-semibold px-2 py-0.5 rounded-full">{motion.time}</span>
                                        <span className={`result-badge text-xs font-medium px-2 py-0.5 rounded-full ${motion.result.includes('Passed') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{motion.result}</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg">{motion.title}</h3>
                            </div>
                        )) : <p className="text-center text-gray-500 p-8">Loading motions...</p>}
                    </div>
                </div>

                <div id="motion-details" className="lg:col-span-2 bg-white rounded-xl shadow-lg h-[80vh] overflow-y-auto">
                    {activeMotion ? (
                        <div className="p-8">
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">{activeMotion.title}</h2>
                            <div className="flex space-x-4 mb-6 text-sm font-semibold">
                                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Time: {activeMotion.time}</span>
                                <span className={`px-3 py-1 rounded-full ${activeMotion.result.includes('Passed') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{activeMotion.result}</span>
                            </div>
                            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-700 border-b pb-1">Motion Description</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{activeMotion.description}</p>
                            <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-700 border-b pb-1">Voting Results</h3>
                            <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                <div className="p-3 bg-blue-50 rounded-lg shadow-sm"><p className="text-2xl font-bold text-blue-800">{activeMotion.voting_results.yes}</p><p className="text-sm text-blue-600">Yes</p></div>
                                <div className="p-3 bg-red-50 rounded-lg shadow-sm"><p className="text-2xl font-bold text-red-800">{activeMotion.voting_results.no}</p><p className="text-sm text-red-600">No</p></div>
                                <div className="p-3 bg-yellow-50 rounded-lg shadow-sm"><p className="text-2xl font-bold text-yellow-800">{activeMotion.voting_results.abstain}</p><p className="text-sm text-yellow-600">Abstain</p></div>
                            </div>
                            {activeMotion.chair_summary && <>
                                <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-700 border-b pb-1">Chair's Summary</h3>
                                <div className="p-4 bg-gray-50 border-l-4 border-green-500 rounded-lg shadow-inner"><p className="text-gray-700 italic">{activeMotion.chair_summary}</p></div>
                            </>}
                        </div>
                    ) : <p className="text-gray-500 p-8">Select a motion from the index to view its full details, voting record, and the Chair's summary.</p>}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 flex justify-center mt-4 mb-8">
                <button onClick={exportMinutes} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-xl transition duration-200 transform hover:scale-105">
                    <i className="bi-download inline-block mr-2"></i>
                    Export/Download Minutes
                </button>
            </div>
        </div>
    );
};

export default MinutesPage;