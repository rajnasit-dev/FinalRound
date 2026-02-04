# Database Seed Instructions

## Overview
This seed file creates a complete, consistent dataset for testing the SportsHub application with realistic relationships and data.

## Quick Start

```bash
cd server
npm run seed
```

## What Gets Seeded

### Sports (12 total)
- Cricket, Football, Basketball, Volleyball, Hockey (team-based)
- Badminton, Tennis, Table Tennis, Chess (individual)
- Kabaddi, Rugby, Baseball (team-based)
- Each with proper roles and configurations

### Users

#### Admin (1)
- **Email:** admin@gmail.com
- **Password:** Password123!
- Full access to admin panel

#### Player (1 main + 20 additional)
- **Email:** alex.morgan@player.com
- **Password:** Password123!
- Multi-sport athlete (Cricket, Football, Basketball)
- Member of 12+ teams
- Registered in 10+ tournaments
- 20+ payments
- 20+ join requests (sent and received)

#### Team Manager (1)
- **Email:** michael.stevens@manager.com
- **Password:** Password123!
- Manages 12+ teams
- Teams registered in tournaments
- Payment history for team registrations

#### Tournament Organizer (1 authorized + 12 pending)
- **Email:** sarah.johnson@organizer.com
- **Password:** Password123!
- Authorized organizer
- Created 12+ tournaments
- 10+ matches scheduled
- 10+ bookings
- 12 pending organizer authorization requests

### Teams (12)
- Distributed across Cricket, Football, Basketball, Volleyball, Hockey
- Each team has 5 players
- Male, Female, and Mixed gender teams
- Achievements and descriptions
- Some open to join, some closed

### Tournaments (12)
- Various sports (Cricket, Football, Basketball, Volleyball, Hockey)
- Status: Upcoming, Live, Completed
- League and Knockout formats
- Entry fees ranging from ₹3000 to ₹7000
- Prize pools from ₹60,000 to ₹150,000
- Teams registered and approved
- Some with platform fee paid, some pending

### Matches (100+)
- Scheduled for tournaments with approved teams
- Spread across tournament dates
- Ground information included

### Payments (30+)
- Player registration payments
- Team registration payments
- Platform fee payments
- Mix of successful and pending statuses

### Requests (20+)
- Player join team requests
- Team invite player requests
- Mix of pending, approved, and rejected

### Bookings (10+)
- Ground bookings for tournaments
- Various statuses: pending, confirmed, completed, cancelled

## Data Consistency

The seed file generates **the same data every time** with:
- Static names and emails
- Consistent passwords (Password123!)
- Predictable relationships
- Same achievements and descriptions

This ensures reliable testing and development.

## Usage Tips

1. **Clean Start:** The seed script automatically clears all existing data before seeding
2. **Environment:** Ensure `.env` is configured with MongoDB connection string
3. **First Run:** After seeding, you can immediately test all features
4. **Re-seed:** Run anytime to reset to clean state

## Testing Workflows

### Admin Workflow
1. Login as admin@gmail.com
2. Approve/reject pending organizer authorization requests (12 available)
3. View all payments, teams, tournaments
4. Monitor platform activity

### Player Workflow
1. Login as alex.morgan@player.com
2. View teams (member of 12+)
3. Browse tournaments (registered in 10+)
4. Check payment history (20+ records)
5. Manage join requests (20+ sent/received)

### Manager Workflow
1. Login as michael.stevens@manager.com
2. Manage 12+ teams
3. View team rosters
4. Handle join requests
5. Register teams in tournaments
6. Process team payments

### Organizer Workflow
1. Login as sarah.johnson@organizer.com
2. View created tournaments (12+)
3. Manage tournament registrations
4. Schedule matches (100+)
5. Handle bookings (10+)
6. Track platform fee payments

## Troubleshooting

### Connection Error
- Verify MongoDB is running
- Check MONGODB_URI in .env file

### Duplicate Key Error
- Database wasn't properly cleared
- Manually clear: `db.dropDatabase()` in MongoDB shell
- Re-run seed script

### Missing Dependencies
```bash
npm install
```

## Database Size
After seeding, expect:
- ~50 users (including additional players and pending organizers)
- ~12 teams
- ~12 tournaments
- ~100+ matches
- ~30+ payments
- ~20+ requests
- ~10+ bookings
- ~12 sports

Total documents: ~250+

## Notes
- All passwords are hashed with bcrypt
- Relationships are properly maintained (ObjectId references)
- Dates are calculated relative to current date for realistic timing
- Platform fee is set to ₹500 in website settings
