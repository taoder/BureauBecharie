import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './components/LoginPage';
import DeskScheduler from './components/DeskScheduler';
import MeetingBoard from './components/MeetingBoard';

function AppContent() {
  const { user, logout, loading, isAdmin } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Coworking Space Scheduler</h1>
          <p>Welcome, {user.name}! {user.role === 'admin' && '(Administrator)'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin() && (
            <button
              className="btn-secondary"
              onClick={() => setShowAdmin(!showAdmin)}
            >
              {showAdmin ? 'Back to Calendar' : 'Admin Panel'}
            </button>
          )}
          <button
            className="btn-secondary"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {showAdmin && isAdmin() ? (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Admin Panel</h2>
          <p>Admin features will be available here (user management, desk management, etc.)</p>
          <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Coming soon in the next update...</p>
        </div>
      ) : (
        <>
          <div className="main-content">
            <DeskScheduler
              currentUser={user.id}
              refreshTrigger={refreshTrigger}
              onDataChange={handleDataChange}
            />
            <MeetingBoard
              currentUser={user.id}
              refreshTrigger={refreshTrigger}
              onDataChange={handleDataChange}
            />
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-color booked"></div>
              <span>Booked by others</span>
            </div>
            <div className="legend-item">
              <div className="legend-color my-booking"></div>
              <span>Your bookings</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
