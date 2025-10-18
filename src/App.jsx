import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthWrapper from './components/AuthWrapper';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MeetingPage from './pages/MeetingPage';
import ProfilePage from './pages/ProfilePage';
import MinutesPage from './pages/MinutesPage';
import VotingResultsPage from './pages/VotingResultsPage';

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/meeting/:meetingId" element={<MeetingPage />} />
          <Route path="/minutes" element={<MinutesPage />} />
          <Route path="/results" element={<VotingResultsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App;