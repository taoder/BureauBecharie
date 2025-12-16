import { useState, useEffect } from 'react';
import { getMeetings, createMeeting, deleteMeeting } from '../api';
import { formatDate, getWeekDates, getMonday } from '../utils';

function MeetingBoard({ currentUser, refreshTrigger, onDataChange }) {
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, [refreshTrigger]);

  const loadMeetings = async () => {
    try {
      const weekStart = getMonday(new Date());
      const weekDates = getWeekDates(weekStart);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);

      const data = await getMeetings(startDate, endDate);
      setMeetings(data);
    } catch (err) {
      setError('Failed to load meetings');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please select your name first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await createMeeting(title, description, date, time, currentUser);
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setShowForm(false);
      await loadMeetings();
      onDataChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!confirm('Delete this meeting?')) return;

    try {
      await deleteMeeting(meetingId);
      await loadMeetings();
      onDataChange();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatMeetingDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="meetings-board">
      <h2>Meetings & Calls</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        className="btn-primary"
        onClick={() => setShowForm(!showForm)}
        style={{ width: '100%' }}
      >
        {showForm ? 'Cancel' : '+ Add Meeting'}
      </button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Meeting</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Team standup"
                />
              </label>

              <label>
                Description (optional)
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Weekly team sync"
                />
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Time
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="meeting-list">
        {meetings.length === 0 ? (
          <div className="no-meetings">
            No meetings scheduled for this week
          </div>
        ) : (
          meetings.map(meeting => (
            <div key={meeting.id} className="meeting-item">
              <h3>{meeting.title}</h3>
              <p className="meeting-time">
                {formatMeetingDate(meeting.date)} at {meeting.time}
              </p>
              {meeting.description && <p>{meeting.description}</p>}
              <p style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                Created by {meeting.created_by_name}
              </p>
              {currentUser === meeting.created_by && (
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(meeting.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MeetingBoard;
