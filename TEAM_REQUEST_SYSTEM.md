# Team Request System - Implementation Summary

## Overview
A complete bidirectional request system where:
- **Players** can request to join a team
- **Team Managers** can request players to join their team
- Both can accept or reject requests

---

## Backend Implementation

### 1. Request Model (`server/src/models/Request.model.js`)
```javascript
Fields:
- requestType: "PLAYER_TO_TEAM" | "TEAM_TO_PLAYER"
- sender: User ID (who sent the request)
- receiver: User ID (who receives the request)
- team: Team ID (the team involved)
- status: "PENDING" | "ACCEPTED" | "REJECTED"
- message: Optional message from sender
- timestamps: createdAt, updatedAt

Indexes:
- Unique constraint on (sender, receiver, team, requestType) for PENDING requests only
```

### 2. Request Controllers (`server/src/controllers/request.controllers.js`)
**Key Functions:**

- **sendTeamRequest**: Player sends request to join a team
  - `POST /api/v1/requests/send-team-request`
  - Body: `{ teamId, message (optional) }`
  - Checks: Player not already in team, no duplicate PENDING request

- **sendPlayerRequest**: Team Manager sends request to a player
  - `POST /api/v1/requests/send-player-request`
  - Body: `{ playerId, teamId, message (optional) }`
  - Checks: User is team manager, player not already in team

- **getReceivedRequests**: Get all pending requests received by user
  - `GET /api/v1/requests/received`
  - Returns: All PENDING requests where user is receiver

- **getSentRequests**: Get all pending requests sent by user
  - `GET /api/v1/requests/sent`
  - Returns: All PENDING requests where user is sender

- **getTeamRequests**: Get all requests for a specific team
  - `GET /api/v1/requests/team/:teamId`
  - Only accessible by team manager

- **acceptRequest**: Accept a received request
  - `PATCH /api/v1/requests/accept/:requestId`
  - Adds player to team's players array
  - Updates request status to ACCEPTED

- **rejectRequest**: Reject a received request
  - `PATCH /api/v1/requests/reject/:requestId`
  - Updates request status to REJECTED

- **cancelRequest**: Cancel a sent request
  - `DELETE /api/v1/requests/cancel/:requestId`
  - Deletes the request (only for PENDING requests)

### 3. Request Routes (`server/src/routes/request.routes.js`)
All routes require JWT authentication (`verifyJWT` middleware).

### 4. App Configuration
Updated `server/src/app.js` to register request routes at `/api/v1/requests`

---

## Frontend Implementation

### 1. Redux Slice (`client/src/store/slices/requestSlice.js`)
**State:**
```javascript
{
  receivedRequests: [],    // Requests sent to user
  sentRequests: [],        // Requests sent by user
  teamRequests: [],        // Requests for a specific team
  loading: false,
  error: null
}
```

**Async Thunks:**
- `sendTeamRequest({ teamId, message })`
- `sendPlayerRequest({ playerId, teamId, message })`
- `getReceivedRequests()`
- `getSentRequests()`
- `getTeamRequests(teamId)`
- `acceptRequest(requestId)`
- `rejectRequest(requestId)`
- `cancelRequest(requestId)`

**Actions:**
- `clearError()`

### 2. Redux Store Update
Updated `client/src/store/store.js` to include `requestReducer`

### 3. Request Card Component (`client/src/components/ui/RequestCard.jsx`)
Displays a single request with:
- **Received View**: Shows sender info with Accept/Reject buttons
- **Sent View**: Shows receiver/team info with Cancel button
- Displays request status (Pending)
- Shows optional message
- Responsive design with proper icons

### 4. Player Requests Section (`client/src/components/PlayerRequestsSection.jsx`)
Main component featuring:
- Two tabs: "Received" and "Sent"
- Lists of RequestCard components
- Empty states with icons
- Loading states
- Error handling
- Integration with Redux

### 5. Player Detail Page Integration
- Added import of `PlayerRequestsSection`
- Integrated section at bottom of PlayerDetail page
- Shows player's team requests

### 6. UI Components Used
- RequestCard: Displays individual requests
- Container: For layout consistency
- Spinner: Loading indicator
- Icons from lucide-react: Inbox, Send, CheckCircle2, XCircle, Clock, User, Trophy

---

## Component Replacement: CardItem → CardStat

### Files Updated:
1. `client/src/components/ui/CardItem.jsx` - Component file content updated to use CardStat
2. `client/src/pages/public/PlayerDetail.jsx` - Import + 4 usages
3. `client/src/pages/public/TeamDetail.jsx` - Import + 6 usages
4. `client/src/pages/public/TournamentDetail.jsx` - Import + 14 usages
5. `client/src/pages/public/TournamentRegister.jsx` - Import + 5 usages

**Status:** CardItem.jsx file has been deleted. All references now use CardStat component.

---

## API Endpoints Summary

### Request Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/requests/send-team-request` | Player joins team request |
| POST | `/api/v1/requests/send-player-request` | Manager invites player |
| GET | `/api/v1/requests/received` | Get received requests |
| GET | `/api/v1/requests/sent` | Get sent requests |
| GET | `/api/v1/requests/team/:teamId` | Get team's requests |
| PATCH | `/api/v1/requests/accept/:requestId` | Accept request |
| PATCH | `/api/v1/requests/reject/:requestId` | Reject request |
| DELETE | `/api/v1/requests/cancel/:requestId` | Cancel sent request |

---

## User Flow

### Player Requesting to Join Team
1. Player views team details
2. Clicks "Request to Join"
3. Request sent to team manager
4. Manager sees in team dashboard
5. Manager accepts/rejects
6. Player notified of status

### Team Manager Inviting Player
1. Manager views player profile
2. Clicks "Invite to Team"
3. Request sent to player
4. Player sees in PlayerRequestsSection
5. Player accepts/rejects
6. Manager notified of status

---

## Testing Checklist
- [ ] Player can send request to join team
- [ ] Team manager can send request to player
- [ ] Received requests display correctly
- [ ] Sent requests display correctly
- [ ] Accept request adds player to team
- [ ] Reject request removes from received
- [ ] Cancel request removes from sent
- [ ] Duplicate requests prevented
- [ ] Players already in team can't request again
- [ ] Non-managers can't send player invites
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] CardStat component used everywhere
- [ ] CardItem component deleted completely
