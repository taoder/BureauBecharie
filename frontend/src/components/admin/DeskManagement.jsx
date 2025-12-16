import { useState, useEffect } from 'react';
import { getAllDesks, createDesk, updateDesk, deleteDesk } from '../../api';

function DeskManagement() {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingDesk, setEditingDesk] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDeskName, setNewDeskName] = useState('');

  useEffect(() => {
    loadDesks();
  }, []);

  const loadDesks = async () => {
    try {
      setLoading(true);
      const data = await getAllDesks();
      setDesks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await createDesk(newDeskName);
      await loadDesks();
      setShowAddForm(false);
      setNewDeskName('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (deskId, updates) => {
    try {
      setError('');
      await updateDesk(deskId, updates);
      await loadDesks();
      setEditingDesk(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (desk) => {
    const action = desk.active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this desk?`)) return;

    try {
      setError('');
      await updateDesk(desk.id, { active: desk.active ? 0 : 1 });
      await loadDesks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (deskId) => {
    if (!confirm('Are you sure you want to delete this desk? This will deactivate it.')) return;

    try {
      setError('');
      await deleteDesk(deskId);
      await loadDesks();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading desks...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Desks</h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Desk'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showAddForm && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px' }}>Add New Desk</h4>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                Desk Name
              </label>
              <input
                type="text"
                value={newDeskName}
                onChange={(e) => setNewDeskName(e.target.value)}
                required
                placeholder="e.g., Desk 6"
                style={{ width: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <button type="submit" className="btn-primary">Create Desk</button>
          </form>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {desks.map(desk => (
            <tr
              key={desk.id}
              style={{
                borderBottom: '1px solid #dee2e6',
                opacity: desk.active ? 1 : 0.5
              }}
            >
              <td style={{ padding: '12px' }}>#{desk.id}</td>
              <td style={{ padding: '12px' }}>
                {editingDesk?.id === desk.id ? (
                  <input
                    type="text"
                    value={editingDesk.name}
                    onChange={(e) => setEditingDesk({ ...editingDesk, name: e.target.value })}
                    style={{ padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                ) : (
                  desk.name
                )}
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: desk.active ? '#2ecc71' : '#e74c3c',
                  color: 'white'
                }}>
                  {desk.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={{ padding: '12px', fontSize: '13px', color: '#7f8c8d' }}>
                {desk.created_at ? new Date(desk.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                {editingDesk?.id === desk.id ? (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => handleUpdate(desk.id, { name: editingDesk.name })}
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Save
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setEditingDesk(null)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-secondary"
                      onClick={() => setEditingDesk({ ...desk })}
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Rename
                    </button>
                    <button
                      className={desk.active ? 'btn-secondary' : 'btn-primary'}
                      onClick={() => handleToggleActive(desk)}
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      {desk.active ? 'Deactivate' : 'Activate'}
                    </button>
                    {desk.active && (
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(desk.id)}
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {desks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          No desks found
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <p style={{ fontSize: '13px', color: '#7f8c8d', margin: 0 }}>
          <strong>Note:</strong> Deactivating a desk will hide it from the calendar. Existing bookings will remain but won't be visible.
        </p>
      </div>
    </div>
  );
}

export default DeskManagement;
