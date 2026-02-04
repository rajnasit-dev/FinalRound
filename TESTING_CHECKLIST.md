# End-to-End Testing Checklist

## Pre-Testing Setup

### 1. Environment Configuration
- [ ] Server `.env` file configured with MongoDB URI
- [ ] Server `.env` has Cloudinary credentials
- [ ] Client `.env` has VITE_API_URL set
- [ ] MongoDB is running

### 2. Database Seeding
```bash
cd server
npm run seed
```
- [ ] Seed completed successfully
- [ ] No errors in console
- [ ] Confirmed: "Database seeded successfully!" message

### 3. Start Services
Terminal 1 (Backend):
```bash
cd server
npm run dev
```
- [ ] Server running on port 8000
- [ ] No connection errors

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```
- [ ] Client running on port 5173
- [ ] No build errors

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | Password123! |
| Player | alex.morgan@player.com | Password123! |
| Manager | michael.stevens@manager.com | Password123! |
| Organizer | sarah.johnson@organizer.com | Password123! |

---

## Testing Workflow

### Admin Tests ✅

#### Login
- [ ] Navigate to login page
- [ ] Enter: admin@gmail.com / Password123!
- [ ] Click login
- [ ] Redirected to admin dashboard
- [ ] Dashboard loads without errors

#### Dashboard
- [ ] Admin Revenue card displays
- [ ] Organizer Revenue card displays
- [ ] Total Transactions card displays
- [ ] All values are numbers (not NaN or undefined)

#### User Management
- [ ] Navigate to Users page
- [ ] User list displays
- [ ] Can see all user types (Player, Manager, Organizer)
- [ ] User details are visible

#### Organizer Authorization
- [ ] Navigate to Organizer Requests page
- [ ] See 12 pending authorization requests
- [ ] Can approve an organizer
- [ ] Can reject an organizer
- [ ] Status updates correctly

#### Payment Monitoring
- [ ] Navigate to Payments page
- [ ] See all payment types (Player, Team, Platform Fee)
- [ ] Pagination works
- [ ] Can filter by type
- [ ] Payment details display correctly

#### Sports Management
- [ ] Navigate to Sports page
- [ ] See 12 sports (Cricket, Football, Basketball, etc.)
- [ ] Can add new sport
- [ ] Can edit existing sport
- [ ] Can toggle sport active status
- [ ] Changes save to database

---

### Player Tests ✅

#### Login
- [ ] Navigate to login page
- [ ] Enter: alex.morgan@player.com / Password123!
- [ ] Click login
- [ ] Redirected to player dashboard

#### Dashboard
- [ ] Active Tournaments card shows data
- [ ] My Teams card shows data
- [ ] Upcoming Matches card shows data
- [ ] Win Rate card displays percentage
- [ ] Recent matches list displays

#### Teams
- [ ] Navigate to My Teams
- [ ] See 12+ teams
- [ ] Team details display (name, sport, city)
- [ ] Can click to view team details
- [ ] Player roster displays

#### Browse Teams
- [ ] Navigate to Browse Teams (public)
- [ ] Teams list displays
- [ ] **Sport filter dropdown populated from backend** ✅
- [ ] Gender filter works
- [ ] Status filter works
- [ ] Can send join request to open teams

#### Tournaments
- [ ] Navigate to My Tournaments
- [ ] See registered tournaments
- [ ] Tournament details display
- [ ] Registration status visible

#### Browse Tournaments
- [ ] Navigate to Browse Tournaments (public)
- [ ] Tournaments list displays
- [ ] **Sport filter dropdown populated from backend** ✅
- [ ] Status filter works (Upcoming, Live, Completed)
- [ ] Can view tournament details
- [ ] Can register for tournaments

#### Payments
- [ ] Navigate to Payment History
- [ ] See 20+ payment records
- [ ] Payment status displays (Success, Pending)
- [ ] Transaction IDs visible
- [ ] Amount displays correctly

#### Requests
- [ ] Navigate to Requests
- [ ] See sent requests
- [ ] See received requests
- [ ] Can accept/reject received requests
- [ ] Request status updates

---

### Manager Tests ✅

#### Login
- [ ] Navigate to login page
- [ ] Enter: michael.stevens@manager.com / Password123!
- [ ] Click login
- [ ] Redirected to manager dashboard

#### Dashboard
- [ ] **Total Teams card displays with gradient** ✅
- [ ] **Total Players card displays** ✅
- [ ] **Upcoming Matches card displays** ✅
- [ ] **Win Rate card displays** ✅
- [ ] No undefined values
- [ ] All gradient styles render correctly

#### My Teams
- [ ] Navigate to My Teams
- [ ] See 12+ teams managed
- [ ] Team details display
- [ ] Can view team roster
- [ ] Player count accurate

#### Create Team
- [ ] Navigate to Create Team
- [ ] **Sport dropdown populated from backend** ✅
- [ ] Fill in team details (name, city, gender)
- [ ] Upload team logo (optional)
- [ ] Submit form
- [ ] Team created successfully
- [ ] **New team appears in database** ✅
- [ ] Redirected to team details

#### Edit Team
- [ ] Select existing team
- [ ] Click edit
- [ ] Modify team details
- [ ] Save changes
- [ ] Changes persist in database

#### Manage Players
- [ ] View team roster
- [ ] Can invite players
- [ ] Can remove players
- [ ] Roster updates correctly

#### Tournament Registration
- [ ] Navigate to available tournaments
- [ ] Select tournament matching team sport
- [ ] Register team
- [ ] Payment flow initiates
- [ ] Registration status updates

#### Requests
- [ ] Navigate to Requests
- [ ] See join requests from players
- [ ] Can approve join requests
- [ ] Can reject join requests
- [ ] Player added to team on approval

---

### Organizer Tests ✅

#### Login
- [ ] Navigate to login page
- [ ] Enter: sarah.johnson@organizer.com / Password123!
- [ ] Click login
- [ ] Redirected to organizer dashboard

#### Dashboard
- [ ] Total Tournaments card displays
- [ ] Active Tournaments card displays
- [ ] Total Participants card displays
- [ ] Pending Approvals card displays

#### My Tournaments
- [ ] Navigate to My Tournaments
- [ ] See 12+ created tournaments
- [ ] Tournament status displays (Upcoming, Live, Completed)
- [ ] Entry fee and prize pool visible

#### Create Tournament
- [ ] Navigate to Create Tournament
- [ ] **Sport dropdown populated from backend** ✅
- [ ] Fill tournament details (name, format, dates)
- [ ] Set entry fee and prize pool
- [ ] Add ground information
- [ ] Add rules
- [ ] Submit form
- [ ] **Tournament saves to database** ✅
- [ ] Redirected to tournament details

#### Edit Tournament
- [ ] Select existing tournament
- [ ] Click edit
- [ ] Modify tournament details
- [ ] Save changes
- [ ] Changes persist

#### Manage Registrations
- [ ] View tournament registrations
- [ ] See registered teams/players
- [ ] Can approve registrations
- [ ] Can reject registrations
- [ ] Approved list updates

#### Create Match
- [ ] Navigate to Create Match
- [ ] Select tournament
- [ ] **Participant dropdown shows proper names (not "undefined")** ✅
- [ ] Select Team A
- [ ] Select Team B
- [ ] Set match date/time
- [ ] Set ground details
- [ ] Submit form
- [ ] **Match includes sport field** ✅
- [ ] Match created successfully

#### Match Schedule
- [ ] Navigate to Matches
- [ ] See 100+ scheduled matches
- [ ] Match details display correctly
- [ ] Can edit match details
- [ ] Can update match results

#### Bookings
- [ ] Navigate to Bookings
- [ ] See 10+ ground bookings
- [ ] Booking status displays
- [ ] Can create new booking
- [ ] Can update booking status

#### Platform Fee
- [ ] View platform fee status
- [ ] See unpaid tournaments
- [ ] Initiate payment
- [ ] Payment status updates

---

## Feature-Specific Tests

### Dynamic Sports Data ✅
- [ ] Admin adds new sport "Swimming"
- [ ] New sport appears in all dropdowns immediately
- [ ] Player can browse teams filtered by "Swimming"
- [ ] Manager can create team for "Swimming"
- [ ] Organizer can create tournament for "Swimming"
- [ ] **No hardcoded sports arrays anywhere**

### Image Upload 📸
- [ ] Upload team logo
- [ ] Image saves to Cloudinary
- [ ] Image URL stored in database
- [ ] Image displays on team page
- [ ] Upload tournament banner
- [ ] Image displays correctly

### Payment Flow 💳
- [ ] Player registers for tournament
- [ ] Payment initiated
- [ ] Payment recorded in database
- [ ] Payment appears in player's history
- [ ] Payment appears in admin's payment monitoring
- [ ] Transaction ID generated

### Request System 📋
- [ ] Player sends join team request
- [ ] Manager receives notification
- [ ] Manager approves request
- [ ] Player added to team
- [ ] Request status updated to "approved"
- [ ] Both parties can see status

### Match Scheduling ⚡
- [ ] Organizer creates match
- [ ] Match appears in tournament schedule
- [ ] Match appears on team calendars
- [ ] Match appears on player dashboards
- [ ] Match time and venue correct

---

## Data Integrity Tests

### Relationships
- [ ] Player belongs to multiple teams
- [ ] Team has multiple players
- [ ] Tournament has registered teams
- [ ] Match references correct teams
- [ ] Payment links to correct user and tournament

### Cascading Updates
- [ ] Approve team registration → team added to tournament.approvedTeams
- [ ] Approve join request → player added to team.players
- [ ] Complete payment → payment.status = 'success'

### Validation
- [ ] Cannot create team without selecting sport
- [ ] Cannot create tournament with past dates
- [ ] Cannot create match without two different teams
- [ ] Cannot register same team twice for tournament

---

## Performance Tests

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Team list loads in < 1 second
- [ ] Tournament list loads in < 1 second
- [ ] Search/filter results instant

### Pagination
- [ ] Admin payments page paginates correctly
- [ ] Large team lists paginate
- [ ] Tournament lists paginate
- [ ] Can navigate between pages

---

## Browser Compatibility

### Desktop
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Edge - All features work
- [ ] Safari - All features work

### Mobile Responsive
- [ ] Navbar collapses to hamburger menu
- [ ] Cards stack vertically
- [ ] Tables scroll horizontally
- [ ] Forms are usable on mobile

---

## Security Tests

### Authentication
- [ ] Cannot access dashboard without login
- [ ] Invalid credentials rejected
- [ ] Logout clears session
- [ ] Cannot access other role's pages

### Authorization
- [ ] Player cannot access admin pages
- [ ] Manager cannot access organizer pages
- [ ] Organizer cannot access admin pages
- [ ] API returns 401/403 for unauthorized requests

---

## Error Handling

### Network Errors
- [ ] Graceful handling of API failures
- [ ] Loading states display
- [ ] Error messages user-friendly
- [ ] Retry mechanisms work

### Validation Errors
- [ ] Form validation messages clear
- [ ] Required fields highlighted
- [ ] Invalid input formats caught
- [ ] Server-side validation errors displayed

---

## Final Verification

### Database State
- [ ] Open MongoDB Compass/Shell
- [ ] Verify 12 sports exist
- [ ] Verify users have proper roles
- [ ] Verify teams have players array populated
- [ ] Verify tournaments have registeredTeams
- [ ] Verify matches have sport field
- [ ] Verify payments have correct types

### Clean Re-seed
- [ ] Run `npm run seed` again
- [ ] Verify same data created
- [ ] Same user emails
- [ ] Same team names
- [ ] Same tournament names
- [ ] **Data is consistent across re-seeds** ✅

---

## Issue Tracking

### Found Issues
| Issue | Page | Severity | Status |
|-------|------|----------|--------|
| | | | |

### To Be Fixed
| Task | Priority | Assigned To |
|------|----------|-------------|
| | | |

---

## Sign-Off

- [ ] All admin tests passed
- [ ] All player tests passed
- [ ] All manager tests passed
- [ ] All organizer tests passed
- [ ] All feature tests passed
- [ ] All data integrity tests passed
- [ ] All security tests passed
- [ ] No critical bugs found

**Tested By:** ___________________  
**Date:** ___________________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** ___________________

---

## Deployment Checklist

Ready for production:
- [ ] All tests passing
- [ ] Environment variables configured for production
- [ ] Database backups configured
- [ ] Cloudinary production credentials set
- [ ] Security headers enabled
- [ ] CORS configured for production domain
- [ ] Error logging configured
- [ ] Performance monitoring setup

---

**Last Updated:** January 2025  
**Version:** 1.0
