# Test Account Credentials and Data Summary

## Login Credentials

All accounts use the password: **Password123!**

### 1. Admin Account
- **Email:** admin@gmail.com
- **Password:** Password123!
- **Role:** Administrator
- **Data:**
  - Received Requests: 5 (all authorization requests from organizers)
  - Can approve/reject organizer authorization requests

### 2. Tournament Organizer Account
- **Email:** arjunpatel0@gmail.com
- **Password:** Password123!
- **Name:** Arjun Patel
- **Role:** Tournament Organizer
- **Organization:** Arjun Patel Sports Organization
- **City:** Ahmedabad
- **Data:**
  - Sent Requests: 1 (Authorization request to admin - PENDING)
  - Received Requests: 0
  - Can create and manage tournaments once authorized

### 3. Player Account
- **Email:** arjunpatel200@gmail.com
- **Password:** Password123!
- **Name:** Arjun Patel
- **Role:** Player
- **Sports:** Cricket (Batsman), Football (Goalkeeper)
- **City:** Ahmedabad
- **Data:**
  - **Sent Requests: 2** (Player to Team requests)
    - Request to join team - 1 PENDING
    - Request to join team - 1 ACCEPTED
  - **Received Requests: 1** (Team to Player invitation)
    - Invitation from team manager - PENDING
  - **Tournament Registrations/Bookings: 2**
    - Basketball Championship 2026 - Vadodara: Confirmed (Payment: Success)
    - Tennis Individual 2026 - Bhavnagar: Pending (Payment: Pending)

### 4. Team Manager Account (Additional)
- **Email:** priyapatel100@gmail.com
- **Password:** Password123!
- **Name:** Priya Patel
- **City:** Ahmedabad
- **Teams Managed:** 2

---

## Complete Database Summary

### Overall Statistics
- **Sports:** 10 different sports
- **Admin:** 1
- **Tournament Organizers:** 20
- **Team Managers:** 20
- **Players:** 100 (10 per sport)
- **Teams:** 28
- **Tournaments:** 28
- **Matches/Fixtures:** 17
- **Payments:** 22
- **Requests:** 39 (various types)
- **Bookings:** 31
- **Feedback:** 3

### Request Types in Database
1. **PLAYER_TO_TEAM** - Players requesting to join teams
2. **TEAM_TO_PLAYER** - Teams inviting players
3. **ORGANIZER_AUTHORIZATION** - Organizers requesting admin approval
4. **TOURNAMENT_BOOKING** - Teams/Players registering for tournaments

### Sports Available
1. Cricket
2. Football
3. Hockey
4. Badminton
5. Basketball
6. Volleyball
7. Table Tennis
8. Tennis
9. Kabaddi
10. Chess

---

## How to Use Test Accounts

### Admin Workflow
1. Login as admin@gmail.com
2. View and manage organizer authorization requests (5 pending)
3. Approve/reject tournament organizer applications

### Organizer Workflow
1. Login as arjunpatel0@gmail.com
2. Has a PENDING authorization request to admin
3. Once approved, can create and manage tournaments
4. Can approve/reject tournament bookings from teams/players

### Player Workflow
1. Login as arjunpatel200@gmail.com
2. View sent team join requests (2 total: 1 PENDING, 1 ACCEPTED)
3. View received team invitations (1 PENDING)
4. View tournament registrations (2 bookings)
5. Check payment status for tournaments
6. Can send requests to join more teams
7. Can register for individual tournaments

### Team Manager Workflow
1. Login as priyapatel100@gmail.com
2. Manage 2 teams
3. View player requests to join teams
4. Send invitations to players
5. Register teams for tournaments

---

## Running the Seed Script

To regenerate all data:
```bash
cd server
node seed.js
```

This will:
1. Clear all existing data
2. Create 10 sports
3. Create all users (admin, organizers, managers, players)
4. Create teams with player assignments
5. Create tournaments with registrations
6. Generate matches/fixtures
7. Create payments, bookings, and requests
8. Create feedback entries

---

## Verification

To verify test account data:
```bash
cd server
node verify-accounts.js
```

This will display:
- Admin received requests count
- Organizer sent/received requests
- Player sent/received requests and tournament bookings
