import { useState, useEffect } from 'react';
import { getDesks, getBookings, createBooking, deleteBooking, getMeetings } from '../api';
import { formatDate, formatDisplayDate, getWeekDates, getMonday } from '../utils';

function DeskScheduler({ currentUser, refreshTrigger, onDataChange }) {
  const [desks, setDesks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDesks();
  }, []);

  useEffect(() => {
    loadBookings();
    loadMeetings();
  }, [weekStart, refreshTrigger]);

  const loadDesks = async () => {
    try {
      const data = await getDesks();
      setDesks(data);
    } catch (err) {
      setError('Failed to load desks');
      console.error(err);
    }
  };

  const loadBookings = async () => {
    try {
      const weekDates = getWeekDates(weekStart);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);

      const data = await getBookings(startDate, endDate);
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    }
  };

  const loadMeetings = async () => {
    try {
      const weekDates = getWeekDates(weekStart);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);

      const data = await getMeetings(startDate, endDate);
      setMeetings(data);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    }
  };

  const handleCellClick = async (deskId, date) => {
    if (!currentUser) {
      alert('Please login first');
      return;
    }

    const dateStr = formatDate(date);
    const existing = bookings.find(
      b => b.desk_id === deskId && b.date === dateStr
    );

    if (existing) {
      if (existing.user_id === currentUser) {
        if (confirm('Cancel your booking?')) {
          try {
            setLoading(true);
            await deleteBooking(existing.id);
            await loadBookings();
            onDataChange();
          } catch (err) {
            alert(err.message);
          } finally {
            setLoading(false);
          }
        }
      } else {
        alert(`This desk is already booked by ${existing.user_name}`);
      }
      return;
    }

    try {
      setLoading(true);
      await createBooking(currentUser, deskId, dateStr);
      await loadBookings();
      onDataChange();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  const goToThisWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const weekDates = getWeekDates(weekStart);

  const getBookingForCell = (deskId, date) => {
    const dateStr = formatDate(date);
    return bookings.find(b => b.desk_id === deskId && b.date === dateStr);
  };

  const getMeetingsForDate = (date) => {
    const dateStr = formatDate(date);
    return meetings.filter(m => m.date === dateStr);
  };

  const getCellClassName = (deskId, date) => {
    const booking = getBookingForCell(deskId, date);
    if (!booking) return 'calendar-cell';
    if (booking.user_id === currentUser) return 'calendar-cell my-booking';
    return 'calendar-cell booked';
  };

  return (
    <div className="desk-scheduler">
      <h2>Desk Bookings & Meetings</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="week-navigation">
        <button onClick={goToPreviousWeek}>← Previous Week</button>
        <span>
          {formatDisplayDate(formatDate(weekDates[0]))} - {formatDisplayDate(formatDate(weekDates[6]))}
        </span>
        <button onClick={goToThisWeek}>This Week</button>
        <button onClick={goToNextWeek}>Next Week →</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header desk-label">Desk</div>
        {weekDates.map(date => (
          <div key={date.toISOString()} className="calendar-header">
            {formatDisplayDate(formatDate(date))}
          </div>
        ))}

        {/* Meetings row */}
        <div className="desk-label-cell" style={{ backgroundColor: '#9b59b6', color: 'white' }}>
          Meetings
        </div>
        {weekDates.map(date => {
          const dayMeetings = getMeetingsForDate(date);
          return (
            <div
              key={`meetings-${date.toISOString()}`}
              className="calendar-cell"
              style={{
                backgroundColor: dayMeetings.length > 0 ? '#f3e5f5' : 'white',
                cursor: 'default',
                minHeight: '80px',
                padding: '4px'
              }}
            >
              {dayMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  style={{
                    fontSize: '11px',
                    padding: '4px',
                    marginBottom: '3px',
                    backgroundColor: '#9b59b6',
                    color: 'white',
                    borderRadius: '3px',
                    lineHeight: '1.3'
                  }}
                  title={`${meeting.title}\n${meeting.time}\n${meeting.description || ''}`}
                >
                  <div style={{ fontWeight: '600' }}>{meeting.time}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {meeting.title}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Desk rows */}
        {desks.map(desk => (
          <>
            <div key={`label-${desk.id}`} className="desk-label-cell">
              {desk.name}
            </div>
            {weekDates.map(date => {
              const booking = getBookingForCell(desk.id, date);
              return (
                <div
                  key={`${desk.id}-${date.toISOString()}`}
                  className={getCellClassName(desk.id, date)}
                  onClick={() => !loading && handleCellClick(desk.id, date)}
                  title={booking ? `Booked by ${booking.user_name}` : 'Click to book'}
                >
                  {booking && (
                    <div className="booking-info">
                      {booking.user_name}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

export default DeskScheduler;
