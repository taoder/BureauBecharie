# Coworking Space Scheduler

A comprehensive web application to manage desk bookings, meetings, and user presence for coworking spaces.

## Features

### Core Features
- **JWT Authentication**: Secure login/register system with role-based access control
- **Desk Booking System**: Visual weekly calendar for managing desk reservations
- **Meeting Display**: Meetings shown directly on the calendar grid
- **Week Templates**: Save recurring booking patterns and apply them quickly
- **Admin Panel**: Comprehensive management interface for administrators

### User Features
- **Personal Account**: Secure authentication with password
- **Quick Booking**: Click-to-book interface with visual feedback
- **Week Templates**: Create patterns like "Mon/Wed/Fri at Desk 3" and apply to multiple weeks
- **Meeting Visibility**: See all scheduled meetings alongside desk bookings

### Admin Features
- **User Management**: Create, edit, delete users, and assign roles
- **Desk Management**: Add, rename, activate/deactivate desks
- **Full Control**: Access to all system configuration

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite with automatic migrations
- **Authentication**: JWT + bcrypt
- **Testing**: Jest (backend) + Vitest (frontend)
- **Styling**: Custom CSS

## Project Structure

```
coworking-space-scheduler/
├── backend/
│   ├── server.js              # Express API server
│   ├── database.js            # SQLite database + migrations
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── __tests__/             # Jest test suite
│   ├── .env.example           # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   │   └── AuthContext.jsx       # React auth context
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminPanel.jsx    # Admin dashboard
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   └── DeskManagement.jsx
│   │   │   ├── DeskScheduler.jsx     # Main calendar
│   │   │   ├── MeetingBoard.jsx      # Meeting sidebar
│   │   │   ├── WeekTemplates.jsx     # Template manager
│   │   │   └── LoginPage.jsx         # Auth page
│   │   ├── App.jsx
│   │   ├── api.js             # API client
│   │   └── utils.js
│   └── package.json
└── package.json               # Root scripts
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

3. **Configure environment** (optional)
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env to customize admin credentials
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts:
- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:3000`

### Testing

**Backend tests with coverage:**
```bash
cd backend
npm test
```

**Frontend tests:**
```bash
cd frontend
npm test
```

## Default Admin Account

On first run, an admin account is automatically created:

- **Email**: `admin@coworking.local`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials in production via the `.env` file!

## Usage Guide

### Getting Started

1. **Login or Register**
   - Navigate to `http://localhost:3000`
   - Login with admin credentials or create a new account
   - New accounts have 'user' role by default

2. **Book a Desk**
   - Click "Calendar" in the navigation
   - Click any empty cell to book that desk for that day
   - Click your booking to cancel it
   - Your bookings are shown in green, others in blue

3. **Create a Week Template**
   - Click "My Templates"
   - Create a template with your regular office days
   - Example: "Mon/Wed/Fri at Desk 3"
   - Apply the template to any date range

4. **Add Meetings**
   - Use the "Meetings & Calls" sidebar
   - Meetings appear in purple on the calendar
   - Everyone can see all meetings

### Admin Features

1. **Access Admin Panel**
   - Login with admin account
   - Click "Admin" in navigation

2. **Manage Users**
   - Create new users with passwords
   - Edit user details and roles
   - Delete users (except yourself)

3. **Manage Desks**
   - Add new desks to the system
   - Rename existing desks
   - Deactivate desks (hides from calendar, preserves data)

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/change-password` - Change password

### Desks

- `GET /api/desks` - List active desks
- `GET /api/admin/desks` - List all desks (admin only)
- `POST /api/admin/desks` - Create desk (admin only)
- `PUT /api/admin/desks/:id` - Update desk (admin only)
- `DELETE /api/admin/desks/:id` - Deactivate desk (admin only)

### Bookings

- `GET /api/bookings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/:id` - Delete booking

### Meetings

- `GET /api/meetings?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get meetings
- `POST /api/meetings` - Create meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Week Templates

- `GET /api/templates` - Get user's templates (auth required)
- `POST /api/templates` - Create template (auth required)
- `POST /api/templates/:id/apply` - Apply template to date range
- `DELETE /api/templates/:id` - Delete template

## Database Schema

### users
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `password_hash` (TEXT)
- `role` (TEXT, DEFAULT 'user') - 'user' or 'admin'
- `created_at` (DATETIME)

### desks
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `name` (TEXT, NOT NULL)
- `active` (INTEGER, DEFAULT 1) - 1 = active, 0 = inactive
- `created_at` (DATETIME)

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

### week_templates
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `name` (TEXT, NOT NULL)
- `created_at` (DATETIME)

### template_days
- `id` (TEXT, PRIMARY KEY)
- `template_id` (TEXT, FOREIGN KEY)
- `day_of_week` (INTEGER, NOT NULL) - 0=Sunday, 1=Monday, etc.
- `desk_id` (INTEGER, FOREIGN KEY) - NULL for "any desk"
- `created_at` (DATETIME)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management with expiration
- **Role-Based Access**: Admin-only routes protected by middleware
- **Environment Variables**: Secrets stored in `.env` file (not committed)
- **Input Validation**: All API endpoints validate input data
- **SQL Injection Protection**: Parameterized queries throughout

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# Admin Account (created on first run)
ADMIN_EMAIL=admin@coworking.local
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrator
```

## Testing

The project includes comprehensive test coverage:

- **Backend**: Jest + Supertest for API testing
- **Frontend**: Vitest + React Testing Library
- **Coverage Reports**: HTML reports generated in `coverage/` directory

Run tests:
```bash
# Backend with coverage
cd backend && npm test

# Frontend with coverage
cd frontend && npm run test:coverage
```

## Calendar Color Legend

- **White**: Available desk
- **Blue**: Booked by another user
- **Green**: Your booking
- **Purple**: Meeting scheduled

## Development

### Adding New Features

1. Backend routes: Add to `backend/server.js`
2. Frontend API calls: Update `frontend/src/api.js`
3. Components: Add to `frontend/src/components/`
4. Tests: Add to `__tests__/` directories

### Database Migrations

The database automatically migrates on startup. New columns are added safely without data loss.

## Production Deployment

1. **Set strong credentials** in `.env`
2. **Use HTTPS** in production
3. **Set `NODE_ENV=production`**
4. **Use a reverse proxy** (nginx/Apache)
5. **Regular backups** of `coworking.db`
6. **Change JWT_SECRET** to a random string

## Troubleshooting

**Can't login:**
- Delete `backend/coworking.db` to recreate with default admin
- Check `.env` file exists with correct credentials

**Port already in use:**
- Change `PORT` in `backend/.env`
- Update `vite.config.js` proxy target

**Tests failing:**
- Ensure dependencies are installed
- Delete `node_modules` and reinstall

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub.
