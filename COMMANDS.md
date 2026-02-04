# SportsHub - Quick Command Reference

## 🚀 First Time Setup

### 1. Clone and Install
```bash
# Clone repository (if needed)
git clone <repository-url>
cd SportsHub

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

**Backend (.env in server/):**
```env
MONGODB_URI=mongodb://localhost:27017/sportshub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=8000
CLIENT_URL=http://localhost:5173

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Frontend (.env in client/):**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Seed Database
```bash
cd server
npm run seed
```

---

## 📦 Daily Development Commands

### Start Everything (3 terminals)

**Terminal 1 - MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo mongod
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:8000
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🗄️ Database Commands

### Seed Database (Fresh Start)
```bash
cd server
npm run seed
```
**What it does:**
- Clears all existing data
- Creates 12 sports
- Creates test users (admin, player, manager, organizer)
- Creates 20+ additional players
- Creates 12 teams
- Creates 12 tournaments
- Creates 100+ matches
- Creates 30+ payments
- Creates 20+ requests
- Creates 10+ bookings

### MongoDB Shell Commands
```bash
# Connect to MongoDB
mongosh

# Switch to database
use sportshub

# View collections
show collections

# Count documents
db.users.countDocuments()
db.sports.countDocuments()
db.teams.countDocuments()
db.tournaments.countDocuments()

# View all sports
db.sports.find().pretty()

# View all users
db.users.find({ role: "Player" }).pretty()

# Clear specific collection
db.teams.deleteMany({})

# Clear entire database
db.dropDatabase()

# Exit
exit
```

---

## 🧪 Testing Commands

### Backend API Tests (using curl/Postman)

**Health Check:**
```bash
curl http://localhost:8000/api/v1/health
```

**Login as Admin:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"Password123!"}'
```

**Get All Sports:**
```bash
curl http://localhost:8000/api/v1/sports
```

**Get All Teams:**
```bash
curl http://localhost:8000/api/v1/teams
```

---

## 🔧 Development Tools

### Check Running Processes
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :8000
lsof -i :5173
```

### Kill Process
```bash
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Clear Node Modules (if needed)
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Access URLs

### Frontend
- **Development:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **Register:** http://localhost:5173/register

### Backend API
- **Base URL:** http://localhost:8000/api/v1
- **Health Check:** http://localhost:8000/api/v1/health

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | Password123! |
| Player | alex.morgan@player.com | Password123! |
| Manager | michael.stevens@manager.com | Password123! |
| Organizer | sarah.johnson@organizer.com | Password123! |

---

## 🐛 Troubleshooting

### Frontend Build Errors
```bash
cd client
npm run build
# Check for errors in output
```

### Backend Linting
```bash
cd server
npm run lint
# If you have a lint script
```

### Clear Browser Cache
- **Chrome:** Ctrl+Shift+Delete → Clear cache and cookies
- **Firefox:** Ctrl+Shift+Delete → Clear cache and cookies

### Reset to Clean State
```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Clear database
mongosh
use sportshub
db.dropDatabase()
exit

# 3. Re-seed
cd server
npm run seed

# 4. Restart servers
# Backend: npm run dev
# Frontend: npm run dev
```

---

## 📊 Useful MongoDB Queries

### View User Roles
```javascript
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

### View Tournaments by Sport
```javascript
db.tournaments.aggregate([
  {
    $lookup: {
      from: "sports",
      localField: "sport",
      foreignField: "_id",
      as: "sportInfo"
    }
  },
  { $unwind: "$sportInfo" },
  {
    $group: {
      _id: "$sportInfo.name",
      count: { $sum: 1 }
    }
  }
])
```

### View Payment Summary
```javascript
db.payments.aggregate([
  {
    $group: {
      _id: "$status",
      total: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  }
])
```

### Find Teams by Manager
```javascript
db.teams.find({ manager: ObjectId("manager-id-here") }).pretty()
```

---

## 🚀 Production Commands

### Build Frontend
```bash
cd client
npm run build
# Creates dist/ folder
```

### Start Production Backend
```bash
cd server
npm start
# Runs without nodemon
```

### Environment Variables for Production
- Set NODE_ENV=production
- Use production MongoDB URI
- Use production Cloudinary credentials
- Set secure JWT_SECRET
- Configure proper CORS origins

---

## 📝 Git Commands (if using version control)

### Commit Changes
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Create Feature Branch
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### Pull Latest Changes
```bash
git pull origin main
```

---

## 🔑 Important File Locations

### Backend
- **Models:** `server/src/models/`
- **Controllers:** `server/src/controllers/`
- **Routes:** `server/src/routes/`
- **Middleware:** `server/src/middlewares/`
- **Seed File:** `server/seed.js`
- **Main App:** `server/src/app.js`
- **Entry Point:** `server/src/index.js`

### Frontend
- **Pages:** `client/src/pages/`
- **Components:** `client/src/components/`
- **Redux Store:** `client/src/store/`
- **Routes:** `client/src/router.jsx`
- **Main Entry:** `client/src/main.jsx`

---

## 📚 Additional Documentation

- **Full Implementation Summary:** [FINAL_IMPLEMENTATION_SUMMARY.md](FINAL_IMPLEMENTATION_SUMMARY.md)
- **Testing Checklist:** [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
- **Seed Instructions:** [server/SEED_INSTRUCTIONS.md](server/SEED_INSTRUCTIONS.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Test Credentials:** [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md)

---

## 💡 Pro Tips

1. **Always seed before testing:** Ensures consistent data
2. **Use MongoDB Compass:** Visual interface for database
3. **Check browser console:** Frontend errors show here
4. **Check terminal output:** Backend errors show here
5. **Use Postman:** Test API endpoints directly
6. **Clear cache often:** Prevents stale data issues
7. **Keep terminals organized:** Label them (MongoDB, Backend, Frontend)

---

**Last Updated:** January 2025  
**Version:** 1.0
