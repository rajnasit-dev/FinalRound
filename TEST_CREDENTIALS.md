# 🎯 SportsHub - Test Credentials & Database Summary

## 📋 LOGIN CREDENTIALS FOR TESTING

### 👤 Sample Player Account
```
Email: rahulmenon200@gmail.com
Password: Password123!
Role: Player
Sports: Cricket (Bowler), Basketball (Center)
City: Vadodara
Wallet Balance: ₹20,000 - ₹60,000
```

**Account Details:**
- Professional player with 2+ years experience
- Plays multiple sports
- Verified account
- Active player in tournaments

---

### 🏢 Sample Organizer Account
```
Email: niteshverma0@gmail.com
Password: Password123!
Role: Tournament Organizer
Organization: Nitesh Verma Sports Organization
City: Ahmedabad
Wallet Balance: ₹100,000 - ₹300,000
```

**Account Details:**
- Verified Organizer
- Authorized to create tournaments
- Can manage tournament events
- Access to organizer dashboard

---

### 👔 Sample Team Manager Account
```
Email: kunaldesai100@gmail.com
Password: Password123!
Role: Team Manager
City: Vadodara
Teams Managed: 2
Wallet Balance: ₹50,000 - ₹200,000
```

**Account Details:**
- Manages 2 teams
- Can recruit players
- Can participate in tournaments
- Verified account

---

## 📊 Database Content Summary

### Statistics
| Entity | Count |
|--------|-------|
| Sports | 10 |
| Admin Users | 1 |
| Tournament Organizers | 20 |
| Team Managers | 20 |
| Players | 100 |
| Teams | 31 |
| Tournaments | 25 |
| Matches/Fixtures | 17 |
| Payments | 25 |
| Booking Requests | 27 |
| User Requests | 38 |
| Feedback | 3 |

---

## 💰 Payment Data

### Payment Records: **25 Total**

**Breakdown by Type:**
- **Team Payments**: 15 records
  - Amount: ₹10,000 - ₹50,000
  - Status Distribution: Success, Pending, Failed, Refunded
  - Providers: Razorpay, PayPal, Stripe, Google Pay

- **Player Payments**: 10 records
  - Amount: ₹1,000 - ₹11,000
  - Status Distribution: Mixed (Success, Pending, Failed)
  - Providers: Various payment gateways

### Sample Payment Scenarios:
1. ✅ Successful team tournament registration payment
2. ⏳ Pending payment awaiting completion
3. ❌ Failed payment requiring retry
4. 🔄 Refunded payment from cancellation

---

## 📅 Booking Data

### Booking Records: **27 Total**

**Breakdown by Registration Type:**
- **Team Bookings**: 15 records
  - Status: Pending, Confirmed, Cancelled (mixed)
  - Payment Status: Pending, Success, Failed
  - Amount: Variable based on tournament entry fees
  
- **Player Bookings**: 12 records
  - Status: Mixed across all states
  - Payment Status: Mixed
  - Amount: ₹500 - ₹5,500

### Booking Status Distribution:
- Confirmed: ~35%
- Pending: ~40%
- Cancelled: ~25%

---

## 🔗 Request Data

### Request Records: **38 Total**

#### Request Types Distribution:

**1. PLAYER_TO_TEAM Requests**: ~15 records
   - Players requesting to join teams
   - Status: Pending, Accepted, Rejected (mixed)
   - Messages: Customized join requests

**2. TEAM_TO_PLAYER Requests**: ~10 records
   - Team managers inviting players
   - Status: Pending, Accepted, Rejected (mixed)
   - Messages: Recruitment invitations

**3. TOURNAMENT_BOOKING Requests**: ~8 records
   - Teams booking tournament spots
   - Status: Pending, Accepted, Rejected (mixed)
   - Connected to specific tournaments

**4. ORGANIZER_AUTHORIZATION Requests**: ~5 records
   - Organizers requesting admin authorization
   - Status: Pending, Accepted, Rejected
   - For tournament organization privileges

### Request Status Distribution:
- Pending: ~45%
- Accepted: ~35%
- Rejected: ~20%

---

## 🎮 Sports Available

1. **Cricket** - Team-based (11 players)
2. **Football** - Team-based (11 players)
3. **Basketball** - Team-based (5 players)
4. **Volleyball** - Team-based (6 players)
5. **Tennis** - Individual/Doubles (1-2 players)
6. **Badminton** - Individual/Doubles (1-2 players)
7. **Table Tennis** - Individual/Doubles (1-2 players)
8. **Kabaddi** - Team-based (7 players)
9. **Hockey** - Team-based (11 players)
10. **Chess** - Individual (1 player)

---

## 🏆 Tournament Data

### Total Tournaments: **25**

**Tournament Formats:**
- League Format: ~33%
- Knockout Format: ~33%
- Round Robin Format: ~34%

**Tournament States:**
- Upcoming: Most tournaments
- Varying registration dates
- Team limits: 8-16 teams
- Entry fees: Variable (₹10,000 - ₹50,000)

---

## 🎯 Additional Test Data

### Team Information
- **31 Teams** across all sports
- Multiple teams per manager
- Player rosters vary by sport
- Team captains assigned
- Open recruitment status varies

### Player Statistics
- **100 Players** distributed evenly
- 10 players per sport
- 60% play multiple sports
- Age range: 18-28 years
- Various heights and weights
- Achievement badges

### Matches
- **17 Scheduled Matches**
- Mix of: Completed, Scheduled, Live matches
- Various sports represented
- Stadium locations assigned

---

## 🔐 Admin Access

### Admin Account
```
Email: admin@gmail.com
Password: Admin123!
Role: Administrator
Permissions: Full access to all features
```

**Admin Capabilities:**
- Manage users
- Manage organizers
- Manage tournaments
- Manage teams
- Manage matches
- Manage payments
- View analytics
- Manage sports

---

## 💡 Testing Scenarios You Can Use

### Scenario 1: Player Tournament Registration
- Login as Player (rahulmenon200@gmail.com)
- Browse tournaments
- Register for available tournaments
- Make payments
- Track booking status

### Scenario 2: Team Management
- Login as Team Manager (kunaldesai100@gmail.com)
- View your 2 managed teams
- Send player recruitment requests
- Register teams in tournaments
- Track payments and bookings

### Scenario 3: Tournament Organization
- Login as Organizer (niteshverma0@gmail.com)
- Create new tournaments
- Manage tournament registrations
- Receive team booking requests
- Process payments

### Scenario 4: Request Management
- Any role can receive join requests
- Accept/Reject requests
- Track request history
- View pending requests

### Scenario 5: Payment Testing
- Teams make tournament payments (₹10,000 - ₹50,000)
- Players register individually (₹500 - ₹5,500)
- Multiple payment providers available
- Track payment status changes

---

## 📝 Notes

1. **Wallet Balances**: Accounts have been seeded with wallet amounts:
   - Players: ₹10,000 - ₹60,000
   - Team Managers: ₹50,000 - ₹200,000
   - Organizers: ₹100,000 - ₹300,000

2. **Data Relationships**: All data is properly linked:
   - Players belong to sports
   - Teams have players and managers
   - Tournaments require sports and organizers
   - Matches link teams and tournaments
   - Payments relate to tournaments and payers
   - Bookings track registrations
   - Requests facilitate interactions

3. **Realistic Scenarios**: Database includes:
   - Mixed payment statuses
   - Various request states
   - Multiple booking confirmations
   - Diverse team compositions

4. **Testing Ready**: All data is production-ready for:
   - Feature testing
   - User flow validation
   - Payment processing testing
   - Request management testing
   - Reporting and analytics

---

*Last Updated: January 26, 2026*
*Database Seed Version: Enhanced v2.0*
