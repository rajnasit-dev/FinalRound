# Team Request System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PlayerDetail Page                                               │
│  ├── Player Profile                                              │
│  └── PlayerRequestsSection (NEW)                                │
│      ├── Received Requests Tab                                  │
│      │   └── RequestCard[] (Accept/Reject buttons)              │
│      └── Sent Requests Tab                                      │
│          └── RequestCard[] (Cancel button)                      │
│                                                                   │
│  Redux Store (requestSlice)                                      │
│  ├── State: receivedRequests[], sentRequests[], loading, error   │
│  └── Actions: 8 async thunks for API communication               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                        HTTP/REST API
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Express)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Routes: /api/v1/requests/*                                     │
│  ├── POST   /send-team-request          (Player→Team)           │
│  ├── POST   /send-player-request        (Manager→Player)        │
│  ├── GET    /received                   (Get my received)        │
│  ├── GET    /sent                       (Get my sent)            │
│  ├── GET    /team/:teamId               (Get team's requests)    │
│  ├── PATCH  /accept/:requestId          (Accept & add to team)   │
│  ├── PATCH  /reject/:requestId          (Reject)                │
│  └── DELETE /cancel/:requestId          (Cancel sent)            │
│                                                                   │
│  Controllers                                                     │
│  └── request.controllers.js (8 functions)                        │
│                                                                   │
│  Request Model                                                   │
│  ├── requestType: PLAYER_TO_TEAM | TEAM_TO_PLAYER              │
│  ├── sender: User ID                                            │
│  ├── receiver: User ID                                          │
│  ├── team: Team ID                                              │
│  ├── status: PENDING | ACCEPTED | REJECTED                     │
│  └── message: String (optional)                                 │
│                                                                   │
│  Database (MongoDB)                                              │
│  └── Request Collection                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Interaction Flow

### Scenario 1: Player Requests to Join Team

```
┌─────────────┐                                    ┌──────────┐
│   Player    │                                    │   Team   │
│             │                                    │ Manager  │
└─────────────┘                                    └──────────┘
      │                                                  │
      │ 1. Views team profile                           │
      │───────────────────────────────────────────────→ │
      │                                                  │
      │ 2. Clicks "Request to Join"                     │
      │                                                  │
      │ 3. Submits request with message                 │
      ├──────────────────────────────────────────────┐  │
      │ sendTeamRequest()                            │  │
      │ POST /api/v1/requests/send-team-request      │  │
      │───────────────────────────────────────────────→ │
      │                                                  │
      │ 4. Request created in DB                        │
      │    Status: PENDING                              │
      │                                                  │
      │ ◄──────────────────────────────────────────────│ 5. Manager
      │ Request appears in team dashboard               │    sees
      │                                                  │    request
      │                                                  │
      │ ◄──────────────────────────────────────────────│ 6. Manager
      │ Receives Accept/Reject notification             │    accepts
      │                                                  │
      │ 7. Player added to team.players[]               │
      │    Status: ACCEPTED                             │
      │                                                  │
      │ 8. Player joins team automatically              │
      └──────────────────────────────────────────────────┘
```

### Scenario 2: Team Manager Invites Player

```
┌──────────┐                                    ┌─────────────┐
│   Team   │                                    │   Player    │
│ Manager  │                                    │             │
└──────────┘                                    └─────────────┘
     │                                                  │
     │ 1. Views player profile                         │
     │◄─────────────────────────────────────────────── │
     │                                                  │
     │ 2. Clicks "Invite Player"                       │
     │                                                  │
     │ 3. Submits invitation with message              │
     ├──────────────────────────────────────────────┐  │
     │ sendPlayerRequest()                          │  │
     │ POST /api/v1/requests/send-player-request    │  │
     │──────────────────────────────────────────────┐ │
     │                                               │ │
     │ 4. Request created in DB                      │ │
     │    Status: PENDING                            │ │
     │                                               │ │
     │ ◄──────────────────────────────────────────────│ 5. Player
     │ Receives invitation notification               │    gets
     │                                                 │    notified
     │                                                 │
     │ ◄──────────────────────────────────────────────│ 6. Player
     │ Request appears in PlayerRequestsSection        │    accepts
     │                                                 │
     │ 7. Player added to team.players[]               │
     │    Status: ACCEPTED                             │
     │                                                 │
     │ 8. Confirmation sent to manager                 │
     └─────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
Frontend Action
       ↓
dispatch(sendTeamRequest({teamId, message}))
       ↓
Redux Thunk (createAsyncThunk)
       ↓
axios.post('/api/v1/requests/send-team-request', data)
       ↓
Backend Route (/send-team-request)
       ↓
Controller (sendTeamRequest function)
├── Validate input
├── Check team exists
├── Check player not already in team
├── Check no duplicate PENDING request
└── Create Request document
       ↓
MongoDB Request Collection
       ↓
Response sent to frontend
       ↓
Redux Reducer updates state
       ↓
React Component Re-renders
       ↓
UI Updated with new request
```

---

## Request Status Lifecycle

```
                    ┌─────────────────────────────┐
                    │   Request Created (PENDING) │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼────────┐   ┌───────▼────────┐
            │     ACCEPTED   │   │     REJECTED   │
            │ Player added   │   │ (cannot be     │
            │ to team.players│   │  reversed)     │
            └────────────────┘   └────────────────┘
                    │
        ┌───────────┴──────────────┐
        │                          │
    Player stays  Or Manager can remove
    in team       player separately
```

---

## Request Types

```
Type: PLAYER_TO_TEAM
┌────────────────────────────┐
│ Sender: Player             │
│ Receiver: Team Manager     │
│ Flow: Player → Manager     │
│ Action: Join Request       │
│ Accept Action: Manager     │
└────────────────────────────┘

Type: TEAM_TO_PLAYER
┌────────────────────────────┐
│ Sender: Team Manager       │
│ Receiver: Player           │
│ Flow: Manager → Player     │
│ Action: Invitation         │
│ Accept Action: Player      │
└────────────────────────────┘
```

---

## Component Hierarchy

```
App
│
└── DashboardLayout (or RootLayout)
    │
    └── PlayerDetail
        │
        ├── Container
        │   └── Player Profile Info
        │
        ├── Container
        │   └── About Player
        │
        ├── Container
        │   └── Player Information (using CardStat)
        │
        ├── Container
        │   └── Achievements
        │
        ├── Container
        │   └── Current Teams
        │
        └── PlayerRequestsSection (NEW)
            │
            ├── Tabs
            │   ├── Received (receivedRequests.length)
            │   └── Sent (sentRequests.length)
            │
            ├── Tab Content: Received
            │   └── RequestCard[] (type="received")
            │       ├── Accept Button
            │       └── Reject Button
            │
            └── Tab Content: Sent
                └── RequestCard[] (type="sent")
                    └── Cancel Button
```

---

## State Management Flow

```
Redux Store
│
└── request slice
    ├── State
    │   ├── receivedRequests: Request[]
    │   ├── sentRequests: Request[]
    │   ├── teamRequests: Request[]
    │   ├── loading: boolean
    │   └── error: string | null
    │
    ├── Thunks
    │   ├── sendTeamRequest
    │   ├── sendPlayerRequest
    │   ├── getReceivedRequests
    │   ├── getSentRequests
    │   ├── getTeamRequests
    │   ├── acceptRequest
    │   ├── rejectRequest
    │   └── cancelRequest
    │
    └── Reducers (extraReducers)
        ├── .pending → set loading: true
        ├── .fulfilled → update state + set loading: false
        └── .rejected → set error + set loading: false
```

---

## Permission Matrix

```
┌──────────────────────────────────────────────────────┐
│ Action          │ Player │ Manager │ Receiver │      │
├──────────────────────────────────────────────────────┤
│ Send Team Req   │   ✓    │    -    │    -     │ YES  │
│ Send Player Req │   -    │    ✓    │    -     │ YES  │
│ Accept Req      │   ✓*   │    ✓*   │    ✓ req │ YES  │
│ Reject Req      │   ✓*   │    ✓*   │    ✓ req │ YES  │
│ Cancel Sent Req │   ✓    │    ✓    │   SENDER │ YES  │
│ View Received   │   ✓    │    ✓    │    -     │ YES  │
│ View Sent       │   ✓    │    ✓    │    -     │ YES  │
│ View Team Req   │   -    │    ✓    │  own tm  │ YES  │
└──────────────────────────────────────────────────────┘
* = Can only if they are the receiver
✓ = Can perform
- = Cannot perform
```

---

## Error Handling Flow

```
API Call
│
└── Try
    │
    ├── Validation
    │   ├── Check teamId exists → 404
    │   ├── Check playerId exists → 404
    │   ├── Check authorization → 403
    │   └── Check duplicates → 400
    │
    ├── Business Logic
    │   ├── Check player in team → 400
    │   ├── Check manager permission → 403
    │   └── Create/Update/Delete
    │
    └── Catch
        │
        ├── ValidationError → 400
        ├── NotFoundError → 404
        ├── AuthorizationError → 403
        └── OtherError → 500
        │
        └── Return ApiError response
            │
            └── Frontend Redux catches
                │
                └── Error action triggered
                    │
                    └── state.error = error message
                        │
                        └── Component renders error UI
```

---

## Database Relationships

```
User (Player)
├── Many Requests (as sender)
├── Many Requests (as receiver)
└── Many Teams (in players array)

User (Manager)
├── Many Requests (as sender)
├── Many Requests (as receiver)
└── One Team (as manager)

Team
├── Many Requests (team field)
├── One Manager (manager field)
└── Many Players (players array - updated on acceptance)

Request
├── One Sender (User)
├── One Receiver (User)
└── One Team
```

---

## API Response Flow

```
Client sends request
        ↓
Express Route
        ↓
Controller Function
├── Validate
├── Query Database
├── Process
└── Build Response
        ↓
ApiResponse Helper
        ↓
{
  success: true/false,
  statusCode: number,
  data: object/array/null,
  message: string
}
        ↓
HTTP Response
        ↓
Redux handles response
        ↓
State updated
        ↓
Component re-renders
```

---

## Validation Points

```
Send Request
├── User authenticated? → 401
├── Input validation → 400
├── Team exists? → 404
├── Player exists? → 404
├── Player not in team? → 400
├── Request not already sent? → 400
├── Manager permission (P2T)? → 403
└── No other blocking condition? → 200

Accept Request
├── User authenticated? → 401
├── Request exists? → 404
├── User is receiver? → 403
├── Status is PENDING? → 400
├── Player not already in team? → 400
└── Team still valid? → 404

Reject/Cancel
├── User authenticated? → 401
├── Request exists? → 404
├── User has permission? → 403
└── Status is PENDING? → 400
```

---

## Performance Considerations

```
Query Optimization
├── Indexed fields: (sender, receiver, team, requestType)
├── Unique constraint: PENDING requests only
├── Populate selectively: Only needed fields
└── Limit results: Sort by createdAt DESC

Caching
├── Redux caches received/sent requests
├── Manual refresh on actions
└── Consider SWR/React Query for auto-sync

Database Indexes
├── Index on (status, receiver) → getReceivedRequests
├── Index on (status, sender) → getSentRequests
├── Index on (team, status) → getTeamRequests
└── Compound index on (sender, receiver, team, requestType)
```

---

**Diagrams Generated:** January 17, 2026
