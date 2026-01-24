# Admin Panel Documentation

## Overview

The SportsHub Admin Panel provides comprehensive management capabilities for the entire platform, including user management, organizer authorization, tournament oversight, team management, and revenue tracking.

## Access

### Login Credentials
- **Email:** admin@gmail.com
- **Password:** Admin123!

### Access URL
- Development: `http://localhost:5173/admin/dashboard`
- The admin panel uses a separate layout without the main navbar

## Features

### 1. Dashboard (`/admin/dashboard`)
Provides an overview of platform statistics:
- **User Statistics:**
  - Total users count
  - Breakdown by role (Players, Managers, Organizers)
- **Tournament Statistics:**
  - Total tournaments
  - Active tournaments count
- **Team Statistics:**
  - Total teams registered
- **Revenue Overview:**
  - Total revenue from tournament listings (₹100 per tournament)
  - Revenue per tournament
- **Pending Requests:**
  - Number of organizers awaiting authorization
- **Recent Activity:**
  - Latest successful payments

### 2. Organizer Authorization (`/admin/organizer-requests`)
Manage tournament organizer authorization requests:
- **View Pending Requests:**
  - Organizer name and email
  - Organization name
  - Request date
  - Verification documents
- **Actions:**
  - **Approve:** Authorize organizer to create tournaments
  - **Reject:** Deny authorization with reason
- **Document Verification:**
  - View uploaded verification documents
  - Links open in new tab

### 3. User Management (`/admin/users`)
Comprehensive user oversight:
- **Filter Options:**
  - By role (Player, Team Manager, Tournament Organizer, Admin)
  - By search (name, email)
- **User Information:**
  - Full name and email
  - Role with color-coded badges
  - Verification status
  - Phone number
  - Join date
- **Statistics:**
  - Total users count
  - Filtered results count

### 4. Tournament Management (`/admin/tournaments`)
Monitor all tournaments:
- **Filter Options:**
  - By status (Upcoming, Ongoing, Completed, Cancelled)
  - By search (name, sport)
- **Tournament Details:**
  - Tournament name and banner
  - Sport type
  - Organizer information
  - Location
  - Start date
  - Team registration (current/max)
  - Status with color-coded badges
- **Statistics:**
  - Total tournaments
  - Filtered results
  - Active tournaments count

### 5. Team Management (`/admin/teams`)
Oversee all registered teams:
- **Search Functionality:**
  - By team name, sport, or manager
- **Team Information:**
  - Team name and logo
  - Sport type
  - Manager details
  - Number of players
  - Number of tournaments
  - Creation date
- **Statistics:**
  - Total teams
  - Filtered results
  - Total players across all teams

### 6. Revenue Management (`/admin/revenue`)
Track platform earnings:
- **Revenue Sources:**
  - **Tournament Listings:** ₹100 per tournament
  - Total revenue calculation
- **Statistics Cards:**
  - Total revenue
  - Tournament revenue
  - Total payments count
  - Monthly revenue
- **Recent Payments:**
  - Last 10 successful payments
  - Tournament and team details
  - Payment amount and status
  - Payment date and time
- **Monthly Breakdown:**
  - Grouped by month and year
  - Payment count per month
  - Revenue per month
- **Payment Statistics:**
  - Successful payments count
  - Pending payments count
  - Failed payments count

## Revenue Model

### Tournament Listing Fee
- **Amount:** ₹100 per tournament
- **Charged When:** Organizer creates a tournament
- **Purpose:** Platform maintenance and hosting costs

### Calculation
```javascript
Total Revenue = Total Tournaments × ₹100
```

## Backend Routes

All admin routes require authentication and admin role verification.

### Base URL: `/api/v1/admin`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard/stats` | GET | Get dashboard statistics |
| `/organizers/pending` | GET | Get pending authorization requests |
| `/organizers` | GET | Get all organizers |
| `/organizers/:organizerId/authorize` | PATCH | Authorize an organizer |
| `/organizers/:organizerId/reject` | PATCH | Reject an organizer |
| `/users` | GET | Get all users (with filters) |
| `/users/:userId` | PATCH | Update user |
| `/users/:userId` | DELETE | Delete user |
| `/tournaments` | GET | Get all tournaments (with filters) |
| `/teams` | GET | Get all teams (with filters) |
| `/revenue` | GET | Get revenue statistics |

## Frontend Structure

```
client/src/
├── pages/admin/
│   ├── AdminDashboard.jsx      # Main dashboard
│   ├── OrganizerRequests.jsx   # Organizer authorization
│   ├── Users.jsx                # User management
│   ├── Tournaments.jsx          # Tournament oversight
│   ├── Teams.jsx                # Team management
│   └── Revenue.jsx              # Revenue tracking
├── layouts/
│   └── AdminLayout.jsx          # Admin-specific layout
└── store/slices/
    └── adminSlice.js            # Redux state management
```

## Database Models

### TournamentOrganizer Extended Fields
```javascript
{
  isAuthorized: Boolean,                    // Authorization status
  authorizationRequestDate: Date,           // When request was submitted
  verificationDocumentUrl: String,          // Document link
  authorizedBy: ObjectId (ref: User),       // Admin who authorized
  authorizedAt: Date,                       // Authorization timestamp
  rejectionReason: String                   // Reason if rejected
}
```

## Organizer Authorization Workflow

1. **Organizer Registration:**
   - Organizer signs up with role "Tournament Organizer"
   - Uploads verification document
   - Sets `authorizationRequestDate`

2. **Admin Review:**
   - Admin views pending requests in admin panel
   - Reviews verification documents
   - Makes authorization decision

3. **Approval:**
   - Admin clicks "Approve"
   - `isAuthorized` set to `true`
   - `authorizedBy` set to admin's ID
   - `authorizedAt` set to current timestamp
   - Organizer can now create tournaments

4. **Rejection:**
   - Admin clicks "Reject"
   - Provides rejection reason
   - `isAuthorized` remains `false`
   - `rejectionReason` stored
   - Organizer cannot create tournaments

## Seed Data

Run the seed script to populate dummy data:

```bash
cd server
npm run seed
```

### Included Organizers:
- **Authorized (4):**
  - Gujarat Sports Authority
  - Ketan Mehta (Gujarat Sports Federation)
  - Priti Shah (Baroda Sports Complex)
  - Ketan Patel (Rajkot Sports Council)

- **Pending Authorization (3):**
  - Rajesh Kumar Sports Inc (Mumbai Sports Center)
  - Sneha Reddy Events (Reddy Sports Events)
  - Vikram Singh Tournament Co (Delhi Sports Hub)

## Security

### Authentication
- All admin routes protected by `authMiddleware`
- Verifies JWT token from cookies
- Validates user session

### Authorization
- `adminMiddleware` checks `user.role === "Admin"`
- Returns 403 Forbidden if not admin
- Prevents unauthorized access

### Hardcoded Admin
- Email: admin@sportshub.com
- Password: Admin@123
- Bypasses normal login flow
- Redirects directly to `/admin/dashboard`

## UI Components

### Reusable Components Used
- **CardStat:** Statistics cards with icons
- **Table:** Data tables with sortable columns
- **Modal:** Confirmation dialogs
- **Spinner:** Loading indicators
- **Button:** Consistent button styling

### Color Coding
- **Role Badges:**
  - Player: Blue
  - Team Manager: Green
  - Tournament Organizer: Purple
  - Admin: Red

- **Status Badges:**
  - Verified: Green
  - Unverified: Orange
  - Upcoming: Blue
  - Ongoing: Green
  - Completed: Gray
  - Cancelled: Red

## Navigation

The admin sidebar includes:
1. Dashboard (Home icon)
2. Organizer Requests (UserCheck icon)
3. Users (Users icon)
4. Tournaments (Trophy icon)
5. Teams (Shield icon)
6. Revenue (DollarSign icon)
7. Logout (LogOut icon)

## Best Practices

### When Authorizing Organizers:
- Review verification documents thoroughly
- Check organization legitimacy
- Verify contact information
- Provide clear rejection reasons if denying

### Revenue Tracking:
- Monitor monthly trends
- Track payment success rates
- Review tournament listing patterns
- Generate reports for stakeholders

### User Management:
- Use filters to find specific users
- Monitor verification status
- Track user growth by role
- Identify inactive accounts

## Troubleshooting

### Cannot Access Admin Panel
- Verify you're using correct credentials
- Clear browser cookies and try again
- Check console for authentication errors

### Data Not Loading
- Check backend server is running
- Verify database connection
- Check browser console for API errors
- Ensure admin routes are registered in `app.js`

### Authorization Not Working
- Verify `adminMiddleware` is applied
- Check JWT token is valid
- Ensure user role is "Admin"

## Future Enhancements

Potential features for future development:
- User deletion and suspension
- Bulk operations
- Advanced analytics and charts
- Export data to CSV/PDF
- Email notifications for admin actions
- Activity logs and audit trail
- Tournament cancellation
- Refund management
- Custom revenue rules
- Multi-admin support with permissions

## Support

For issues or questions about the admin panel:
1. Check this documentation
2. Review backend logs
3. Inspect Redux state in browser DevTools
4. Check network requests in browser
