# 4-Type Request System Implementation

## Overview
Successfully implemented a comprehensive 4-type request system for SportsHub with full backend and database support.

## Request Types Implemented

### 1. **PLAYER_TO_TEAM** 
- Players request to join a team
- Sender: Player | Receiver: Team Manager
- Receiver can ACCEPT or REJECT
- Upon acceptance, player is added to team

### 2. **TEAM_TO_PLAYER**
- Team managers invite players to join their team
- Sender: Team Manager | Receiver: Player
- Receiver can ACCEPT or REJECT
- Upon acceptance, player is added to team

### 3. **ORGANIZER_AUTHORIZATION**
- Admin sends authorization requests to tournament organizers
- Sender: Admin | Receiver: Tournament Organizer
- Admin can track authorization status
- Organizer can see their authorization status
- Status: PENDING, ACCEPTED, or REJECTED

### 4. **TOURNAMENT_BOOKING**
- Players/Teams request to book/register for tournaments
- Sender: Team Manager or Player | Receiver: Tournament Organizer
- Supports both team-based and player-based tournaments
- Organizer can ACCEPT or REJECT bookings
- Status: PENDING, ACCEPTED, or REJECTED

## Database Schema Updates

### Request Model Changes
```javascript
requestSchema: {
  requestType: String (enum: ["PLAYER_TO_TEAM", "TEAM_TO_PLAYER", "ORGANIZER_AUTHORIZATION", "TOURNAMENT_BOOKING"]),
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  team: ObjectId (ref: Team, sparse: true),           // For player/team join requests
  tournament: ObjectId (ref: Tournament, sparse: true), // For organizer auth & bookings
  bookingEntity: ObjectId (ref: Team, sparse: true),   // Which team is booking tournament
  status: String (enum: ["PENDING", "ACCEPTED", "REJECTED"]),
  message: String,
  timestamps: true
}
```

## API Endpoints

### New Endpoints Added:
```
POST   /api/v1/requests/send-authorization      - Send organizer authorization
POST   /api/v1/requests/send-booking             - Send tournament booking request
GET    /api/v1/requests/all                      - Get all requests (organized by type)

### Existing Endpoints Enhanced:
POST   /api/v1/requests/send-team-request        - Player to team request
POST   /api/v1/requests/send-player-request      - Team to player request
GET    /api/v1/requests/received                 - Get received requests
GET    /api/v1/requests/sent                     - Get sent requests
GET    /api/v1/requests/team/:teamId             - Get team requests (for manager)
PATCH  /api/v1/requests/accept/:requestId        - Accept request
PATCH  /api/v1/requests/reject/:requestId        - Reject request
DELETE /api/v1/requests/cancel/:requestId        - Cancel sent request
```

## Seed Data

The seed file now includes:
- **6 PLAYER_TO_TEAM requests** (2 PENDING, 2 ACCEPTED, 2 REJECTED)
- **6 TEAM_TO_PLAYER requests** (3 PENDING, 2 ACCEPTED, 1 REJECTED)
- **3 ORGANIZER_AUTHORIZATION requests** (1 PENDING, 1 ACCEPTED, 1 REJECTED)
- **5 TOURNAMENT_BOOKING requests** (2 PENDING, 2 ACCEPTED, 1 REJECTED)

Total: **20 complete request objects** with realistic statuses and timestamps

## Files Updated

1. **server/src/models/Request.model.js**
   - Added support for 4 request types
   - Added tournament and bookingEntity fields
   - Enhanced indexing for new request types

2. **server/src/controllers/request.controllers.js**
   - Added `sendOrganizerAuthorizationRequest()` - Handle admin→organizer authorization
   - Added `sendTournamentBookingRequest()` - Handle team/player→organizer tournament bookings
   - Added `getAllUserRequests()` - Get all user requests organized by type
   - Enhanced existing methods to support new request types

3. **server/src/routes/request.routes.js**
   - Added new POST endpoints for authorization and booking
   - Added new GET endpoint for all requests
   - Maintained backward compatibility with existing endpoints

4. **server/seed.js**
   - Added comprehensive seed data for all 4 request types
   - Realistic request messages and statuses
   - Proper relationships with teams, tournaments, and users

## Features

✅ **Request Management**
- Create requests of 4 different types
- Accept/Reject requests
- Cancel sent requests
- Track request status (PENDING, ACCEPTED, REJECTED)

✅ **Validation**
- Prevent duplicate pending requests
- Validate sender/receiver roles
- Validate team/tournament existence
- Prevent adding already-joined members

✅ **Data Population**
- Auto-populate related entities (team, tournament, users)
- Return user details with requests
- Return tournament/team details with booking requests

✅ **Authorization**
- Only admins can send organizer authorization
- Only team managers can send/receive team requests
- Only players can join teams
- Only tournament organizers can receive bookings

## How to Use

### 1. **Player Requests to Join Team**
```javascript
POST /api/v1/requests/send-team-request
Body: { teamId: "...", message: "..." }
```

### 2. **Team Invites Player**
```javascript
POST /api/v1/requests/send-player-request
Body: { playerId: "...", teamId: "...", message: "..." }
```

### 3. **Admin Authorizes Organizer**
```javascript
POST /api/v1/requests/send-authorization
Body: { organizerId: "...", message: "..." }
```

### 4. **Team/Player Books Tournament**
```javascript
POST /api/v1/requests/send-booking
Body: { tournamentId: "...", message: "..." }
```

### 5. **View All Requests**
```javascript
GET /api/v1/requests/all
Response: {
  playerToTeam: [...],
  teamToPlayer: [...],
  organizerAuth: [...],
  tournamentBooking: [...]
}
```

### 6. **Accept/Reject Requests**
```javascript
PATCH /api/v1/requests/accept/:requestId
PATCH /api/v1/requests/reject/:requestId
```

## Testing Data Available

✅ Players ready to request teams
✅ Teams with open positions  
✅ Organizers awaiting authorization
✅ Active tournaments accepting bookings
✅ Multiple request statuses for each type

Run `npm run seed` to populate the database with all request types and statuses.

