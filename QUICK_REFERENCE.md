# Quick Reference - Team Request System

## What Was Implemented

### Backend (Node.js/Express)
```
✅ Request Model - PLAYER_TO_TEAM & TEAM_TO_PLAYER types
✅ 8 Controller Functions
✅ 8 API Endpoints
✅ Request Routes Configuration
✅ Auto-add players on acceptance
✅ Duplicate prevention
✅ Full validation & error handling
```

### Frontend (React/Redux)
```
✅ Redux Slice with 8 Async Thunks
✅ Request Card Component
✅ Player Requests Section (Tabbed UI)
✅ Integration in PlayerDetail Page
✅ Redux Store Configuration
✅ Loading/Error/Empty States
```

### Component Migration
```
✅ CardItem → CardStat (30 references replaced)
✅ CardItem.jsx deleted
✅ All imports updated
✅ All usages updated
```

---

## Quick API Reference

### Send Requests
```bash
# Player joins team
POST /api/v1/requests/send-team-request
{ teamId, message? }

# Manager invites player
POST /api/v1/requests/send-player-request
{ playerId, teamId, message? }
```

### View Requests
```bash
# Your received requests
GET /api/v1/requests/received

# Your sent requests
GET /api/v1/requests/sent

# Team's requests (manager only)
GET /api/v1/requests/team/:teamId
```

### Manage Requests
```bash
# Accept a request (adds player to team)
PATCH /api/v1/requests/accept/:requestId

# Reject a request
PATCH /api/v1/requests/reject/:requestId

# Cancel a sent request
DELETE /api/v1/requests/cancel/:requestId
```

---

## Redux Usage

### Import & Dispatch
```jsx
import { 
  getReceivedRequests,
  getSentRequests,
  sendTeamRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest 
} from "@/store/slices/requestSlice";

// In component:
const dispatch = useDispatch();
const { receivedRequests, sentRequests, loading } = useSelector(
  state => state.request
);

// Fetch requests
dispatch(getReceivedRequests());
dispatch(getSentRequests());

// Send request
dispatch(sendTeamRequest({ teamId: "123", message: "Join team!" }));

// Accept/Reject
dispatch(acceptRequest(requestId));
dispatch(rejectRequest(requestId));
dispatch(cancelRequest(requestId));
```

---

## Component Usage

### PlayerRequestsSection
```jsx
import PlayerRequestsSection from "@/components/PlayerRequestsSection";

// Just add to page:
<PlayerRequestsSection />
```

### RequestCard
```jsx
import RequestCard from "@/components/ui/RequestCard";

<RequestCard
  request={requestData}
  type="received" // or "sent"
  onAccept={(id) => {...}}
  onReject={(id) => {...}}
  onCancel={(id) => {...}}
  loading={false}
/>
```

---

## Database Model

### Request Document
```javascript
{
  _id: ObjectId,
  requestType: "PLAYER_TO_TEAM" | "TEAM_TO_PLAYER",
  sender: ObjectId,           // User who sent
  receiver: ObjectId,         // User who receives
  team: ObjectId,             // Team involved
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  message: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Features

### Player Can:
- ✅ Request to join any team
- ✅ Include message with request
- ✅ View all received requests from teams
- ✅ Accept team invitations (auto-join)
- ✅ Reject team invitations
- ✅ View sent requests
- ✅ Cancel sent requests

### Manager Can:
- ✅ Invite specific players to team
- ✅ Include message with invitation
- ✅ View all pending join requests
- ✅ Accept player requests (auto-add)
- ✅ Reject player requests
- ✅ View team-specific requests

### System:
- ✅ Prevents duplicate requests
- ✅ Prevents already-joined players from requesting
- ✅ Auto-adds players on acceptance
- ✅ Validates permissions
- ✅ Manages request lifecycle
- ✅ Error handling & validation

---

## File Locations

### Backend
```
server/src/
├── models/Request.model.js
├── controllers/request.controllers.js
├── routes/request.routes.js
└── app.js (modified)
```

### Frontend
```
client/src/
├── store/slices/requestSlice.js
├── store/store.js (modified)
├── components/
│   ├── PlayerRequestsSection.jsx
│   └── ui/RequestCard.jsx
└── pages/public/
    ├── PlayerDetail.jsx (modified)
    ├── TeamDetail.jsx (modified)
    ├── TournamentDetail.jsx (modified)
    └── TournamentRegister.jsx (modified)
```

---

## Error Handling

```javascript
{
  400: "Request already sent to this team",
  400: "Player is already a member of this team",
  400: "Cannot cancel rejected/accepted request",
  403: "Only team manager can send requests",
  403: "You can only accept/reject requests sent to you",
  404: "Request not found",
  404: "Team not found",
  404: "Player not found"
}
```

---

## State Management Flow

```
Component
   ↓
Action (sendTeamRequest, etc.)
   ↓
Redux Thunk
   ↓
API Call
   ↓
State Update (reducer)
   ↓
Component Re-render
```

---

## UI Layout

```
PlayerDetail
└── PlayerRequestsSection
    ├── Tabs: "Received" | "Sent"
    ├── [Received Tab]
    │   └── RequestCard[] (with Accept/Reject)
    └── [Sent Tab]
        └── RequestCard[] (with Cancel)
```

---

## Integration Checklist

- [x] Request Model created
- [x] Controllers implemented
- [x] Routes configured
- [x] App.js updated
- [x] Redux slice created
- [x] Store configured
- [x] Components created
- [x] PlayerDetail updated
- [x] CardItem → CardStat migration
- [x] Documentation created

---

## Testing Example

```bash
# 1. Player sends request
POST http://localhost:3000/api/v1/requests/send-team-request
{
  "teamId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "message": "I want to join!"
}

# 2. Manager views requests
GET http://localhost:3000/api/v1/requests/team/65a1b2c3d4e5f6g7h8i9j0k1

# 3. Manager accepts
PATCH http://localhost:3000/api/v1/requests/accept/65b1b2c3d4e5f6g7h8i9j0k2

# 4. Player auto-added to team
# Team.players array updated
```

---

## Support Docs

- **TEAM_REQUEST_SYSTEM.md** - Full implementation details
- **TEAM_REQUEST_USAGE.md** - Detailed API & code examples
- **IMPLEMENTATION_COMPLETE.md** - Summary & next steps

---

**Status:** ✅ Production Ready
**Last Updated:** January 17, 2026
