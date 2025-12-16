import { useState } from 'react';
import { createUser } from '../api';

function UserManager({ users, currentUser, onUserSelect, onUserCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await createUser(name, email);
      onUserCreated(newUser);
      setName('');
      setEmail('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-section">
      <h2>User Selection</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="user-selector">
        <select
          value={currentUser || ''}
          onChange={(e) => onUserSelect(e.target.value)}
        >
          <option value="">Select your name...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New User'}
        </button>
      </div>

      {showForm && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ display: 'block', width: '100%', marginTop: '5px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </label>
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserManager;
