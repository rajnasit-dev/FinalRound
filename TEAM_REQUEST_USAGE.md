# Team Request System - Usage Examples

## Frontend Usage

### 1. Using Request Actions in Components

```jsx
import { useDispatch, useSelector } from "react-redux";
import {
  sendTeamRequest,
  getReceivedRequests,
  acceptRequest,
} from "../store/slices/requestSlice";

function MyComponent() {
  const dispatch = useDispatch();
  const { receivedRequests, loading, error } = useSelector(
    (state) => state.request
  );

  // Send request to join team
  const handleJoinTeam = async (teamId) => {
    await dispatch(
      sendTeamRequest({
        teamId,
        message: "I would like to join your team!",
      })
    );
  };

  // Get all received requests
  const handleGetRequests = () => {
    dispatch(getReceivedRequests());
  };

  // Accept a request
  const handleAccept = async (requestId) => {
    await dispatch(acceptRequest(requestId));
    // Refresh
    dispatch(getReceivedRequests());
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleJoinTeam}>Join Team</button>
    </div>
  );
}
```

### 2. Request Card Component Usage

```jsx
import RequestCard from "../components/ui/RequestCard";

function RequestsList() {
  const requests = [
    {
      _id: "123",
      requestType: "TEAM_TO_PLAYER",
      sender: { fullName: "John Manager", avatarUrl: null },
      team: { name: "Warriors", logoUrl: null },
      status: "PENDING",
      message: "Join our team!",
    },
  ];

  return (
    <div>
      {requests.map((request) => (
        <RequestCard
          key={request._id}
          request={request}
          type="received"
          onAccept={(id) => console.log("Accept:", id)}
          onReject={(id) => console.log("Reject:", id)}
          loading={false}
        />
      ))}
    </div>
  );
}
```

### 3. PlayerRequestsSection Integration

```jsx
import PlayerRequestsSection from "../components/PlayerRequestsSection";

function PlayerDashboard() {
  return (
    <div>
      <h1>My Dashboard</h1>
      {/* Other dashboard content */}
      <PlayerRequestsSection />
    </div>
  );
}
```

---

## Backend Usage (API Examples)

### 1. Player Sends Request to Join Team

**Request:**
```bash
POST /api/v1/requests/send-team-request
Content-Type: application/json
Authorization: Bearer <token>

{
  "teamId": "team123",
  "message": "I want to join your team!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request123",
    "requestType": "PLAYER_TO_TEAM",
    "sender": {
      "_id": "player456",
      "fullName": "John Player",
      "avatarUrl": "https://..."
    },
    "receiver": "manager789",
    "team": {
      "_id": "team123",
      "name": "Warriors"
    },
    "status": "PENDING",
    "message": "I want to join your team!",
    "createdAt": "2024-01-17T10:30:00Z"
  },
  "message": "Request sent successfully"
}
```

### 2. Team Manager Invites Player

**Request:**
```bash
POST /api/v1/requests/send-player-request
Content-Type: application/json
Authorization: Bearer <token>

{
  "playerId": "player456",
  "teamId": "team123",
  "message": "We need you in our team!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request124",
    "requestType": "TEAM_TO_PLAYER",
    "sender": "manager789",
    "receiver": {
      "_id": "player456",
      "fullName": "John Player",
      "avatarUrl": "https://..."
    },
    "team": {
      "_id": "team123",
      "name": "Warriors"
    },
    "status": "PENDING",
    "message": "We need you in our team!",
    "createdAt": "2024-01-17T10:35:00Z"
  },
  "message": "Request sent successfully"
}
```

### 3. Get Received Requests

**Request:**
```bash
GET /api/v1/requests/received
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request124",
      "requestType": "TEAM_TO_PLAYER",
      "sender": {
        "_id": "manager789",
        "fullName": "Mike Manager",
        "role": "TeamManager"
      },
      "team": {
        "_id": "team123",
        "name": "Warriors",
        "logoUrl": "https://..."
      },
      "status": "PENDING",
      "message": "We need you in our team!",
      "createdAt": "2024-01-17T10:35:00Z"
    }
  ],
  "message": "Received requests fetched successfully"
}
```

### 4. Get Sent Requests

**Request:**
```bash
GET /api/v1/requests/sent
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request123",
      "requestType": "PLAYER_TO_TEAM",
      "sender": "player456",
      "receiver": {
        "_id": "manager789",
        "fullName": "Mike Manager"
      },
      "team": {
        "_id": "team123",
        "name": "Warriors",
        "logoUrl": "https://..."
      },
      "status": "PENDING",
      "message": "I want to join your team!",
      "createdAt": "2024-01-17T10:30:00Z"
    }
  ],
  "message": "Sent requests fetched successfully"
}
```

### 5. Accept Request

**Request:**
```bash
PATCH /api/v1/requests/accept/request124
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request124",
    "requestType": "TEAM_TO_PLAYER",
    "sender": "manager789",
    "receiver": "player456",
    "team": "team123",
    "status": "ACCEPTED",
    "message": "We need you in our team!",
    "updatedAt": "2024-01-17T10:40:00Z"
  },
  "message": "Request accepted successfully"
}
```

**Side Effect:** Player is automatically added to team's players array

### 6. Reject Request

**Request:**
```bash
PATCH /api/v1/requests/reject/request124
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "request124",
    "requestType": "TEAM_TO_PLAYER",
    "sender": "manager789",
    "receiver": "player456",
    "team": "team123",
    "status": "REJECTED",
    "message": "We need you in our team!",
    "updatedAt": "2024-01-17T10:42:00Z"
  },
  "message": "Request rejected successfully"
}
```

### 7. Cancel Request

**Request:**
```bash
DELETE /api/v1/requests/cancel/request123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Request cancelled successfully"
}
```

### 8. Get Team Requests (Manager Only)

**Request:**
```bash
GET /api/v1/requests/team/team123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request123",
      "requestType": "PLAYER_TO_TEAM",
      "sender": {
        "_id": "player456",
        "fullName": "John Player",
        "avatarUrl": "https://...",
        "email": "john@example.com",
        "phone": "+1234567890",
        "city": "New York"
      },
      "team": "team123",
      "status": "PENDING",
      "message": "I want to join your team!",
      "createdAt": "2024-01-17T10:30:00Z"
    }
  ],
  "message": "Team requests fetched successfully"
}
```

---

## Error Examples

### Duplicate Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Request already sent to this team",
  "errors": []
}
```

### Player Already in Team
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Player is already a member of this team",
  "errors": []
}
```

### Unauthorized (Not Team Manager)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Only team manager can send requests",
  "errors": []
}
```

### Request Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Request not found",
  "errors": []
}
```

---

## Request Object Structure

```javascript
{
  // MongoDB ID
  _id: ObjectId,
  
  // Type of request
  requestType: "PLAYER_TO_TEAM" | "TEAM_TO_PLAYER",
  
  // Who sent the request
  sender: ObjectId (User),
  
  // Who receives the request
  receiver: ObjectId (User),
  
  // Team involved
  team: ObjectId (Team),
  
  // Current status
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  
  // Optional message
  message: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Version field (managed by MongoDB)
  __v: Number
}
```

---

## State Management

### Redux State for Requests
```javascript
{
  request: {
    receivedRequests: [
      // Array of requests received by current user
    ],
    sentRequests: [
      // Array of requests sent by current user
    ],
    teamRequests: [
      // Array of requests for a specific team (for managers)
    ],
    loading: boolean,
    error: string | null
  }
}
```

---

## Notes

- All endpoints require authentication (JWT token in cookies)
- Request status is immutable once set to ACCEPTED or REJECTED
- Players are automatically added to team when request is accepted
- Duplicate PENDING requests are prevented at database level (unique index)
- Messages are optional but recommended for better UX
- Timestamps are automatically managed by MongoDB
