import { useState } from 'react';
import UserManagement from './UserManagement';
import DeskManagement from './DeskManagement';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Admin Panel</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #3498db' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'users' ? '600' : '400',
            color: activeTab === 'users' ? '#3498db' : '#7f8c8d'
          }}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('desks')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'desks' ? '3px solid #3498db' : '3px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'desks' ? '600' : '400',
            color: activeTab === 'desks' ? '#3498db' : '#7f8c8d'
          }}
        >
          Desk Management
        </button>
      </div>

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'desks' && <DeskManagement />}
    </div>
  );
}

export default AdminPanel;
