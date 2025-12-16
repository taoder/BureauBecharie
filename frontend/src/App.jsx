import { useState, useEffect } from 'react';
import DeskScheduler from './components/DeskScheduler';
import MeetingBoard from './components/MeetingBoard';
import UserManager from './components/UserManager';
import { getUsers } from './api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
    setCurrentUser(newUser.id);
  };

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container">
      <header>
        <h1>Coworking Space Scheduler</h1>
        <p>Manage desk bookings and meetings for your coworking space</p>
      </header>

      <UserManager
        users={users}
        currentUser={currentUser}
        onUserSelect={setCurrentUser}
        onUserCreated={handleUserCreated}
      />

      <div className="main-content">
        <DeskScheduler
          currentUser={currentUser}
          refreshTrigger={refreshTrigger}
          onDataChange={handleDataChange}
        />
        <MeetingBoard
          currentUser={currentUser}
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
    </div>
  );
}

export default App;
