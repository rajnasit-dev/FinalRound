# 🚀 SportsHub Backend - Quick Start Guide

## Prerequisites
- Node.js v14+ installed
- MongoDB running locally or cloud instance (MongoDB Atlas)
- Cloudinary account for image uploads

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017
DB_NAME=sportshub

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT Tokens
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_change_in_production
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_change_in_production
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=SportsHub <noreply@sportshub.com>

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection string in .env
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:8000`

## 🧪 Testing the API

### Register a Player
```bash
curl -X POST http://localhost:8000/api/v1/auth/register-player \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "city": "New York",
    "age": 25,
    "gender": "Male"
  }'
```

### Verify Email
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "Player"
  }'
```

## 📚 Available Roles

### 1. Player
- Create profile with sports and achievements
- Join teams
- Register for tournaments
- Provide feedback

### 2. Team Manager
- Create and manage teams
- Add/remove players
- Register teams for tournaments
- Handle team payments

### 3. Tournament Organizer
- Create and manage tournaments
- Create venues/grounds
- Schedule matches
- Approve team registrations
- Update match scores

## 🗂️ API Structure

```
/api/v1
  /auth                  - Authentication endpoints
  /users                 - User profile management
  /players               - Player-specific operations
  /team-managers         - Team manager operations
  /tournament-organizers - Organizer operations
  /teams                 - Team management
  /tournaments           - Tournament management
  /matches               - Match management
  /grounds               - Venue management
  /sports                - Sports catalog
  /notifications         - User notifications
  /feedback              - Tournament feedback
  /payments              - Payment handling
```

## 🔑 Protected Routes

Most routes require authentication. Include the JWT token in requests:

**Using Cookie (automatically set after login):**
```bash
curl http://localhost:8000/api/v1/players/profile/me \
  --cookie "accessToken=YOUR_TOKEN_HERE"
```

**Using Authorization Header:**
```bash
curl http://localhost:8000/api/v1/players/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📤 File Upload Example

```bash
curl -X POST http://localhost:8000/api/v1/teams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Eagles FC" \
  -F "sport=SPORT_ID" \
  -F "city=Boston" \
  -F "logo=@/path/to/logo.png"
```

## 🐛 Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI and DB_NAME in .env
- For Atlas, ensure IP is whitelisted

### Email Not Sending
- Enable "Less secure app access" for Gmail (or use App Password)
- Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
- Verify firewall allows SMTP connections

### Cloudinary Upload Fails
- Verify CLOUDINARY_* credentials
- Check if file size is within limits
- Ensure temp folder exists: `server/public/temp`

### CORS Errors
- Update CORS_ORIGIN in .env to match your frontend URL
- Check that frontend is running on the specified port

## 📊 Database Collections

The following collections will be created:
- `users` - All users (with discriminators for Player, TeamManager, TournamentOrganizer)
- `sports` - Available sports
- `teams` - Teams
- `tournaments` - Tournaments
- `matches` - Scheduled matches
- `grounds` - Venues
- `notifications` - User notifications
- `feedbacks` - Tournament feedback
- `payments` - Payment records

## 🛠️ Development Tips

### Add Sample Sports Data
```javascript
// Run in MongoDB shell or create a seed script
db.sports.insertMany([
  { name: "Cricket", teamBased: true, minPlayers: 11, maxPlayers: 11, isActive: true },
  { name: "Football", teamBased: true, minPlayers: 11, maxPlayers: 11, isActive: true },
  { name: "Basketball", teamBased: true, minPlayers: 5, maxPlayers: 5, isActive: true },
  { name: "Tennis", teamBased: false, minPlayers: 1, maxPlayers: 2, isActive: true }
])
```

### Check Logs
The server logs important information to the console. Watch for:
- Database connection status
- Server start confirmation
- Error messages
- Request logs

### Clear Temp Files
Periodically clean the temp upload folder:
```bash
rm -rf server/public/temp/*
```

## 🚀 Next Steps

1. **Test all endpoints** using Postman or Thunder Client
2. **Create sample data** for development
3. **Connect frontend** to the API
4. **Set up proper logging** for production
5. **Configure backup** for MongoDB
6. **Set up monitoring** and error tracking

## 📞 Support

For issues or questions:
- Check the main README.md for detailed API documentation
- Review error messages in console
- Check MongoDB connection and data
- Verify all environment variables are set correctly

Happy coding! 🎉
