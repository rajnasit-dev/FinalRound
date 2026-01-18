# SportsHub Backend API

A comprehensive REST API for managing sports tournaments, teams, players, and matches. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Multi-role authentication system (Player, Team Manager, Tournament Organizer)
- **Team Management**: Create and manage teams with players
- **Tournament Management**: Organize tournaments with registration, approval, and scheduling
- **Match Management**: Schedule and track matches with live scores
- **Ground/Venue Management**: Manage sports venues and facilities
- **Payment Processing**: Handle tournament entry fees and payments
- **Notifications**: Real-time notification system
- **Feedback System**: Tournament feedback and ratings
- **File Uploads**: Image uploads for avatars, logos, banners via Cloudinary

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for image uploads)
- Email service (for sending emails)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```

   Update the following variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `ACCESS_TOKEN_SECRET` - Secret for JWT access tokens
   - `REFRESH_TOKEN_SECRET` - Secret for JWT refresh tokens
   - `CLOUDINARY_*` - Your Cloudinary credentials
   - `EMAIL_*` - Your email service credentials

4. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:8000` (or the PORT specified in your .env file)

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middleware
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app configuration
│   └── index.js         # Server entry point
├── public/
│   └── temp/            # Temporary file storage
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register-player` - Register a new player
- `POST /register-team-manager` - Register a team manager
- `POST /register-tournament-organizer` - Register a tournament organizer
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /verify-email` - Verify email with OTP
- `POST /resend-otp` - Resend verification OTP
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password with token
- `POST /refresh-token` - Refresh access token

### Users (`/api/v1/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PATCH /avatar` - Update user avatar
- `PATCH /cover-image` - Update cover image

### Players (`/api/v1/players`)
- `GET /` - Get all players
- `GET /:id` - Get player by ID
- `GET /profile/me` - Get current player profile
- `PUT /profile/me` - Update player profile
- `POST /sports` - Add sport to profile
- `PUT /sports` - Update sport role
- `DELETE /sports/:sportId` - Remove sport
- `POST /achievements` - Add achievement
- `PUT /achievements/:id` - Update achievement
- `DELETE /achievements/:id` - Delete achievement

### Team Managers (`/api/v1/team-managers`)
- `GET /` - Get all team managers
- `GET /:id` - Get team manager by ID
- `GET /profile/me` - Get current manager profile
- `PUT /profile/me` - Update manager profile
- `GET /teams` - Get manager's teams

### Tournament Organizers (`/api/v1/tournament-organizers`)
- `GET /` - Get all organizers
- `GET /:id` - Get organizer by ID
- `GET /profile/me` - Get current organizer profile
- `PUT /profile/me` - Update organizer profile
- `POST /documents` - Upload verification documents
- `PUT /documents` - Update documents
- `DELETE /documents` - Delete documents
- `GET /tournaments` - Get organizer's tournaments

### Teams (`/api/v1/teams`)
- `GET /` - Get all teams
- `GET /:id` - Get team by ID
- `POST /` - Create team (Manager only)
- `PUT /:id` - Update team
- `PATCH /:id/logo` - Update team logo
- `DELETE /:id` - Delete team
- `POST /:id/players` - Add player to team
- `DELETE /:id/players/:playerId` - Remove player
- `PATCH /:id/captain` - Set team captain
- `GET /sport/:sportId` - Get teams by sport
- `GET /city/:city` - Get teams by city
- `GET /search` - Search teams

### Tournaments (`/api/v1/tournaments`)
- `GET /` - Get all tournaments
- `GET /:id` - Get tournament by ID
- `POST /` - Create tournament (Organizer only)
- `PUT /:id` - Update tournament
- `PATCH /:id/banner` - Update tournament banner
- `PATCH /:id/status` - Update tournament status
- `DELETE /:id` - Delete tournament
- `POST /:id/register` - Register team for tournament
- `PATCH /:id/approve/:teamId` - Approve team registration
- `PATCH /:id/reject/:teamId` - Reject team registration
- `GET /upcoming` - Get upcoming tournaments
- `GET /live` - Get live tournaments
- `GET /sport/:sportId` - Get tournaments by sport
- `GET /search` - Search tournaments

### Matches (`/api/v1/matches`)
- `GET /` - Get all matches
- `GET /:id` - Get match by ID
- `POST /` - Create match (Organizer only)
- `PUT /:id` - Update match
- `DELETE /:id` - Delete match
- `PATCH /:id/score` - Update match score
- `PATCH /:id/result` - Update match result
- `PATCH /:id/status` - Update match status
- `GET /tournament/:tournamentId` - Get tournament matches
- `GET /team/:teamId` - Get team matches
- `GET /upcoming` - Get upcoming matches
- `GET /live` - Get live matches
- `GET /completed` - Get completed matches

### Grounds/Venues (`/api/v1/grounds`)
- `GET /` - Get all grounds
- `GET /:id` - Get ground by ID
- `POST /` - Create ground
- `PUT /:id` - Update ground
- `POST /:id/photos` - Add photos
- `DELETE /:id/photos` - Delete photo
- `DELETE /:id` - Delete ground
- `GET /city/:city` - Get grounds by city
- `GET /sport/:sportId` - Get grounds by sport
- `GET /search` - Search grounds

### Sports (`/api/v1/sports`)
- `GET /` - Get all sports
- `GET /:id` - Get sport by ID
- `POST /` - Create sport
- `PUT /:id` - Update sport
- `DELETE /:id` - Delete sport

### Notifications (`/api/v1/notifications`)
- `GET /` - Get user notifications
- `GET /:id` - Get notification by ID
- `POST /` - Create notification
- `PATCH /:id/read` - Mark as read
- `PATCH /read/all` - Mark all as read
- `DELETE /:id` - Delete notification
- `DELETE /read/all` - Delete all read
- `GET /unread-count` - Get unread count

### Feedback (`/api/v1/feedback`)
- `GET /` - Get all feedback
- `GET /:id` - Get feedback by ID
- `POST /` - Create feedback
- `PUT /:id` - Update feedback
- `DELETE /:id` - Delete feedback
- `GET /tournament/:tournamentId` - Get tournament feedback
- `GET /tournament/:tournamentId/rating` - Get average rating
- `GET /user/me` - Get user's feedback

### Payments (`/api/v1/payments`)
- `GET /` - Get all payments
- `GET /:id` - Get payment by ID
- `POST /` - Create payment
- `PATCH /:id/status` - Update payment status
- `DELETE /:id` - Delete payment
- `GET /tournament/:tournamentId` - Get tournament payments
- `GET /team/:teamId` - Get team payments
- `GET /user/me` - Get user's payments
- `GET /stats/organizer` - Get organizer payment stats

## 🔐 Authentication

The API uses JWT-based authentication. Protected routes require an `accessToken` cookie or Authorization header:

```
Authorization: Bearer <access_token>
```

### User Roles
- **Player**: Can create profile, join teams, register for tournaments
- **TeamManager**: Can create teams, manage players, register teams for tournaments
- **TournamentOrganizer**: Can create tournaments, manage registrations, create matches

## 📤 File Uploads

File uploads are handled via multipart/form-data:
- **Avatar/Logo**: Single file upload (`upload.single('fieldname')`)
- **Photos**: Multiple file upload (`upload.array('photos', 10)`)

Supported fields:
- `avatar` - User/team avatar
- `coverImage` - User cover image
- `logo` - Team logo
- `banner` - Tournament banner
- `photos` - Ground photos
- `document` - Organizer verification documents

## 🗃️ Database Models

### Core Models
- **User** (base model with discriminator)
  - Player
  - TeamManager
  - TournamentOrganizer
- **Sport**
- **Team**
- **Tournament**
- **Match**
- **Ground**
- **Notification**
- **Feedback**
- **Payment**

## 🛡️ Error Handling

The API uses a centralized error handling middleware. All errors return:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 📝 Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## 🧪 Testing

To test the API, you can use:
- Postman
- Thunder Client (VS Code extension)
- curl
- Any HTTP client

Sample request:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "Player"
  }'
```

## 🚀 Deployment

### Environment Variables for Production
Ensure all sensitive data is properly configured:
- Use strong, unique secrets for JWT tokens
- Enable HTTPS in production
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Use production MongoDB database

### Recommended Hosting
- **API**: Heroku, Railway, DigitalOcean, AWS
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## 📄 License

This project is part of the SportsHub application.

## 👥 Support

For issues or questions, please create an issue in the repository.
