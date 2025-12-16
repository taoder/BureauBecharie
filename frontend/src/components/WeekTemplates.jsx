import { useState, useEffect } from 'react';
import { getTemplates, createTemplate, deleteTemplate, applyTemplate, getDesks } from '../api';
import { useAuth } from '../auth/AuthContext';

function WeekTemplates({ onDataChange }) {
  const [templates, setTemplates] = useState([]);
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState(null);
  const { user } = useAuth();

  // Create template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    days: {
      1: { enabled: false, deskId: null }, // Monday
      2: { enabled: false, deskId: null }, // Tuesday
      3: { enabled: false, deskId: null }, // Wednesday
      4: { enabled: false, deskId: null }, // Thursday
      5: { enabled: false, deskId: null }, // Friday
      6: { enabled: false, deskId: null }, // Saturday
      0: { enabled: false, deskId: null }  // Sunday
    }
  });

  // Apply template form state
  const [applyForm, setApplyForm] = useState({
    startDate: '',
    endDate: '',
    deskId: null
  });

  const dayNames = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    0: 'Sunday'
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
      loadDesks();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadDesks = async () => {
    try {
      const data = await getDesks();
      setDesks(data);
    } catch (err) {
      console.error('Failed to load desks:', err);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert days object to array format
      const daysArray = Object.entries(newTemplate.days)
        .filter(([_, day]) => day.enabled)
        .map(([dayOfWeek, day]) => ({
          day_of_week: parseInt(dayOfWeek),
          desk_id: day.deskId || null
        }));

      if (daysArray.length === 0) {
        setError('Please select at least one day');
        setLoading(false);
        return;
      }

      await createTemplate(newTemplate.name, daysArray);
      await loadTemplates();
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        days: {
          1: { enabled: false, deskId: null },
          2: { enabled: false, deskId: null },
          3: { enabled: false, deskId: null },
          4: { enabled: false, deskId: null },
          5: { enabled: false, deskId: null },
          6: { enabled: false, deskId: null },
          0: { enabled: false, deskId: null }
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await applyTemplate(
        applyingTemplate.id,
        applyForm.startDate,
        applyForm.endDate,
        applyForm.deskId
      );

      alert(`Template applied!\n${result.bookingsCreated} bookings created.\n${result.errors?.length || 0} errors.`);

      setApplyingTemplate(null);
      setApplyForm({ startDate: '', endDate: '', deskId: null });
      onDataChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Delete this template?')) return;

    try {
      await deleteTemplate(templateId);
      await loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDay = (dayOfWeek) => {
    setNewTemplate({
      ...newTemplate,
      days: {
        ...newTemplate.days,
        [dayOfWeek]: {
          ...newTemplate.days[dayOfWeek],
          enabled: !newTemplate.days[dayOfWeek].enabled
        }
      }
    });
  };

  const setDayDesk = (dayOfWeek, deskId) => {
    setNewTemplate({
      ...newTemplate,
      days: {
        ...newTemplate.days,
        [dayOfWeek]: {
          ...newTemplate.days[dayOfWeek],
          deskId: deskId ? parseInt(deskId) : null
        }
      }
    });
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Week Templates</h3>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Template'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showCreateForm && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '15px' }}>Create Week Template</h4>
          <form onSubmit={handleCreateTemplate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                Template Name
              </label>
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                required
                placeholder="e.g., Mon/Wed/Fri at office"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                Select Days and Preferred Desks
              </label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 0].map(dayOfWeek => (
                  <div key={dayOfWeek} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: newTemplate.days[dayOfWeek].enabled ? '2px solid #3498db' : '1px solid #ddd'
                  }}>
                    <input
                      type="checkbox"
                      checked={newTemplate.days[dayOfWeek].enabled}
                      onChange={() => toggleDay(dayOfWeek)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ minWidth: '100px', fontWeight: '500' }}>
                      {dayNames[dayOfWeek]}
                    </span>
                    {newTemplate.days[dayOfWeek].enabled && (
                      <>
                        <span style={{ fontSize: '13px', color: '#7f8c8d' }}>Preferred desk:</span>
                        <select
                          value={newTemplate.days[dayOfWeek].deskId || ''}
                          onChange={(e) => setDayDesk(dayOfWeek, e.target.value)}
                          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="">Any desk</option>
                          {desks.map(desk => (
                            <option key={desk.id} value={desk.id}>{desk.name}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </form>
        </div>
      )}

      {applyingTemplate && (
        <div className="modal-overlay" onClick={() => setApplyingTemplate(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Apply Template: {applyingTemplate.name}</h3>
            <form onSubmit={handleApplyTemplate}>
              <label>
                Start Date
                <input
                  type="date"
                  value={applyForm.startDate}
                  onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                  required
                />
              </label>

              <label>
                End Date
                <input
                  type="date"
                  value={applyForm.endDate}
                  onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                  required
                />
              </label>

              <label>
                Override Desk (optional)
                <select
                  value={applyForm.deskId || ''}
                  onChange={(e) => setApplyForm({ ...applyForm, deskId: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <option value="">Use template preferences</option>
                  {desks.map(desk => (
                    <option key={desk.id} value={desk.id}>{desk.name}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setApplyingTemplate(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Applying...' : 'Apply Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '10px' }}>
        {templates.map(template => (
          <div key={template.id} style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0' }}>{template.name}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {template.days?.map(day => (
                    <span key={day.id} style={{
                      padding: '4px 8px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {dayNames[day.day_of_week]}
                      {day.desk_name && ` (${day.desk_name})`}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  className="btn-primary"
                  onClick={() => setApplyingTemplate(template)}
                  style={{ padding: '8px 15px', fontSize: '13px' }}
                >
                  Apply
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteTemplate(template.id)}
                  style={{ padding: '8px 15px', fontSize: '13px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !showCreateForm && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
          <p>No templates yet. Create your first week template!</p>
          <p style={{ fontSize: '13px' }}>Templates help you quickly book your regular office days.</p>
        </div>
      )}
    </div>
  );
}

export default WeekTemplates;
