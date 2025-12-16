# Coworking Space Scheduler

A web application to manage desk bookings and meetings for a coworking space with 5 shared desks.

## Features

- **Desk Booking System**: View and book 5 desks across a weekly calendar
- **User Management**: Create and select users to track individual bookings
- **Meeting Board**: Announce and manage meetings and calls
- **Visual Calendar**: Color-coded view showing available desks, your bookings, and others' bookings
- **Real-time Updates**: Immediate reflection of booking changes

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Styling**: Custom CSS

## Project Structure

```
coworking-space-scheduler/
├── backend/
│   ├── server.js          # Express API server
│   ├── database.js        # SQLite database setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeskScheduler.jsx    # Main calendar view
│   │   │   ├── MeetingBoard.jsx     # Meetings sidebar
│   │   │   └── UserManager.jsx      # User selection
│   │   ├── App.jsx
│   │   ├── api.js         # API client functions
│   │   ├── utils.js       # Date utilities
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json           # Root package with scripts
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BureauBecharie
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

   This will install dependencies for both backend and frontend.

## Running the Application

### Development Mode

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend server:
   ```bash
   npm start
   ```

3. Serve the built frontend files from `frontend/dist/`

## Usage Guide

### Getting Started

1. **Create a User**
   - Click "New User" button
   - Enter your name and email
   - Click "Create User"

2. **Select Your Name**
   - Use the dropdown to select your name from the list

### Booking a Desk

1. Navigate through weeks using the arrow buttons
2. Click on an empty cell to book a desk for that day
3. Your bookings appear in green
4. Other users' bookings appear in blue
5. Click your own booking to cancel it

### Managing Meetings

1. Click "+ Add Meeting" in the Meetings & Calls section
2. Fill in the meeting details:
   - Title (required)
   - Description (optional)
   - Date (required)
   - Time (required)
3. Click "Create Meeting"
4. Meetings you created can be deleted by clicking the "Delete" button

## API Documentation

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```
- `GET /api/users/:id` - Get user by ID

### Desks

- `GET /api/desks` - Get all 5 desks

### Bookings

- `GET /api/bookings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get bookings in date range
- `POST /api/bookings` - Create a booking
  ```json
  {
    "user_id": "uuid",
    "desk_id": 1,
    "date": "2024-01-15"
  }
  ```
- `DELETE /api/bookings/:id` - Delete a booking

### Meetings

- `GET /api/meetings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get meetings in date range
- `POST /api/meetings` - Create a meeting
  ```json
  {
    "title": "Team Standup",
    "description": "Daily sync",
    "date": "2024-01-15",
    "time": "10:00",
    "created_by": "uuid"
  }
  ```
- `DELETE /api/meetings/:id` - Delete a meeting

## Database Schema

### users
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `created_at` (DATETIME)

### desks
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)

### bookings
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `desk_id` (INTEGER, FOREIGN KEY)
- `date` (DATE, NOT NULL)
- `status` (TEXT, DEFAULT 'confirmed')
- `created_at` (DATETIME)

### meetings
- `id` (TEXT, PRIMARY KEY)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `date` (DATE, NOT NULL)
- `time` (TEXT, NOT NULL)
- `created_by` (TEXT, FOREIGN KEY)
- `created_at` (DATETIME)

## Color Legend

- **White**: Available desk
- **Blue**: Booked by another user
- **Green**: Your booking

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - see LICENSE file for details

## Future Enhancements

- Email notifications for bookings and meetings
- Recurring bookings
- Calendar export (iCal)
- User authentication with passwords
- Admin dashboard
- Desk availability statistics
- Mobile app
