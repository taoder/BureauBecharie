import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginPage from './components/LoginPage';
import DeskScheduler from './components/DeskScheduler';
import MeetingBoard from './components/MeetingBoard';
import WeekTemplates from './components/WeekTemplates';
import AdminPanel from './components/admin/AdminPanel';

function AppContent() {
  const { user, logout, loading, isAdmin } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar', 'templates', 'admin'

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>Coworking Space Scheduler</h1>
          <p>Welcome, {user.name}! {user.role === 'admin' && '(Administrator)'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {!isAdmin() && (
            <>
              <button
                className={currentView === 'calendar' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setCurrentView('calendar')}
              >
                Calendar
              </button>
              <button
                className={currentView === 'templates' ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setCurrentView('templates')}
              >
                My Templates
              </button>
            </>
          )}
          {isAdmin() && (
            <button
              className={currentView === 'admin' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setCurrentView('admin')}
              style={{ minWidth: '120px' }}
            >
              Admin Panel
            </button>
          )}
          <button
            className="btn-danger"
            onClick={handleLogout}
            style={{
              minWidth: '100px',
              fontWeight: '600'
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      {currentView === 'admin' && isAdmin() ? (
        <AdminPanel />
      ) : isAdmin() ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h2>Compte Administrateur</h2>
          <p style={{ color: '#7f8c8d', marginTop: '10px', fontSize: '16px' }}>
            En tant qu'administrateur, vous pouvez gérer les utilisateurs, les bureaux et les paramètres du système.
          </p>
          <p style={{ color: '#e74c3c', marginTop: '15px', fontSize: '15px', fontWeight: '600' }}>
            ⚠️ Les administrateurs ne peuvent pas réserver de bureaux ni créer de templates.
          </p>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            Pour réserver des bureaux, veuillez créer un compte utilisateur standard.
          </p>
        </div>
      ) : currentView === 'templates' ? (
        <WeekTemplates onDataChange={handleDataChange} />
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
            <div className="legend-item">
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#9b59b6' }}></div>
              <span>Meetings</span>
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
