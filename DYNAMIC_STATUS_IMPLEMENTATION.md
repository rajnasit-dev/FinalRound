# Dynamic Status System Implementation

## Overview
Implemented a dynamic status calculation system for tournaments and matches where status is computed based on dates rather than stored in the database. Only the `isCancelled` flag is stored for explicit cancellations.

## Changes Made

### Backend Changes

#### 1. Models Updated
- **Tournament.model.js**: Replaced `status` enum field with `isCancelled` boolean (default: false)
- **Match.model.js**: Replaced `status` enum field with `isCancelled` boolean (default: false)

#### 2. New Utility Functions (`server/src/utils/statusHelpers.js`)
Created helper functions for computing status dynamically:

**Tournament Status Logic:**
- `Cancelled`: if `isCancelled === true`
- `Completed`: if current date > `endDate`
- `Live`: if current date is between `startDate` and `endDate`
- `Upcoming`: if current date < `startDate`

**Match Status Logic:**
- `Cancelled`: if `isCancelled === true`
- `Completed`: if current time > scheduled time + 3 hours
- `Live`: if current time is between scheduled time and scheduled time + 3 hours
- `Scheduled`: if current time < scheduled time

**Functions:**
- `getTournamentStatus(tournament)` - Compute tournament status
- `getMatchStatus(match)` - Compute match status
- `addTournamentStatus(tournament)` - Add status to single tournament object
- `addMatchStatus(match)` - Add status to single match object
- `addTournamentStatuses(tournaments)` - Add status to array of tournaments
- `addMatchStatuses(matches)` - Add status to array of matches

#### 3. Controllers Updated

**tournament.controllers.js:**
- `createTournament`: Removed status field, added computed status to response
- `getAllTournaments`: Compute status for all tournaments, filter by computed status
- `getTournamentById`: Add computed status to response
- `updateTournament`: Removed status field, added computed status to response
- `deleteTournament`: Compute status before checking if live
- `getTournamentsBySport`: Add computed status to all tournaments
- `getUpcomingTournaments`: Filter by date and isCancelled, compute status
- `getLiveTournaments`: Filter by date range and isCancelled, compute status
- `searchTournaments`: Add computed status to results
- `updateTournamentStatus`: Changed to only handle `isCancelled` boolean
- `getTrendingTournaments`: Filter by date and isCancelled, compute status

**match.controllers.js:**
- `createMatch`: Removed status field, added computed status to response
- `getAllMatches`: Compute status for all matches, filter by computed status
- `getMatchById`: Add computed status to response
- `updateMatch`: Removed status field, added computed status to response
- `deleteMatch`: Compute status before checking if live/completed
- `updateMatchScore`: Add computed status to response
- `updateMatchResult`: Remove status update logic, add computed status
- `getMatchesByTournament`: Add computed status to all matches
- `getMatchesByTeam`: Add computed status to all matches
- `getUpcomingMatches`: Filter by date and isCancelled, compute status
- `getLiveMatches`: Filter by date range (last 3 hours) and isCancelled
- `getCompletedMatches`: Filter by date (more than 3 hours ago) and isCancelled
- `updateMatchStatus`: Changed to only handle `isCancelled` boolean

#### 4. Seed Data Updated (`server/seed.js`)
- Removed `status: "Upcoming"` from tournament creation
- Removed status computation and field from match creation

### Frontend Changes

#### 1. Custom Hooks Created

**`client/src/hooks/useTournamentStatus.js`:**
```javascript
export const useTournamentStatus = (tournament) => {
  // Returns: "Cancelled" | "Completed" | "Live" | "Upcoming"
  // Based on tournament.isCancelled, startDate, endDate
}
```

**`client/src/hooks/useMatchStatus.js`:**
```javascript
export const useMatchStatus = (match) => {
  // Returns: "Cancelled" | "Completed" | "Live" | "Scheduled"
  // Based on match.isCancelled, scheduledAt
}
```

Both hooks use `useMemo` for performance optimization.

#### 2. Frontend Components
**No changes required!** All tournament and match components will receive the computed `status` field from the API responses, as the backend now adds it dynamically to all responses.

The frontend hooks (`useTournamentStatus` and `useMatchStatus`) are available if you need to compute status locally (e.g., for optimistic UI updates or offline scenarios), but by default, components can use `tournament.status` and `match.status` directly from API responses.

## API Changes

### Tournament Endpoints
- **POST/PUT**: No longer accept `status` field (ignored if provided)
- **PUT `/api/v1/tournaments/:id/status`**: Now expects `{ isCancelled: boolean }` instead of `{ status: string }`
- **GET**: All responses include computed `status` field

### Match Endpoints
- **POST/PUT**: No longer accept `status` field (ignored if provided)
- **PUT `/api/v1/matches/:id/status`**: Now expects `{ isCancelled: boolean }` instead of `{ status: string }`
- **GET**: All responses include computed `status` field

## Benefits

1. **Automatic Updates**: Status changes automatically based on time without manual intervention
2. **Data Consistency**: No risk of status being out of sync with dates
3. **Reduced Storage**: Only store cancellation flag instead of full status enum
4. **Simpler Logic**: No need to update status when dates change
5. **Real-time Accuracy**: Status is always accurate to the current moment

## Migration Notes

### Database Migration
No migration needed! Existing `status` fields will be ignored. The models will use the new `isCancelled` field (defaults to false for existing records).

### Frontend Compatibility
All existing frontend code continues to work because:
- API responses still include `status` field (computed dynamically)
- Status values remain the same: "Upcoming", "Live", "Completed", "Cancelled" for tournaments
- Status values remain the same: "Scheduled", "Live", "Completed", "Cancelled" for matches

### Match Duration
Currently hardcoded to 3 hours. To make configurable:
1. Add `duration` field to Match model
2. Update `getMatchStatus` helper to use `match.duration || 3`
3. Update frontend hook similarly

## Testing Recommendations

1. **Create a tournament** with:
   - Start date in the past → should show "Live" or "Completed"
   - Start date in the future → should show "Upcoming"
   - Cancelled flag → should show "Cancelled"

2. **Create a match** with:
   - Scheduled time 1 hour ago → should show "Live"
   - Scheduled time 5 hours ago → should show "Completed"
   - Scheduled time tomorrow → should show "Scheduled"
   - Cancelled flag → should show "Cancelled"

3. **Test filters**:
   - GET `/tournaments?status=Live` → should return only currently live tournaments
   - GET `/matches?status=Completed` → should return only completed matches

4. **Test cancellation**:
   - PUT `/tournaments/:id/status` with `{ isCancelled: true }`
   - PUT `/matches/:id/status` with `{ isCancelled: true }`
   - Verify status shows "Cancelled" regardless of dates
