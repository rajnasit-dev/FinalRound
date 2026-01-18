# Quick Start Guide - Enhanced Dashboards

## 🚀 Accessing the Dashboards

### Option 1: Demo Page
Visit the dashboard showcase page to see all layouts:
```
http://localhost:5173/dashboard-demo
```

This page provides:
- Overview of all three dashboard types
- Feature descriptions
- Direct links to each dashboard
- Visual comparison

### Option 2: Direct URLs
58#### Tournament Organizer Dashboard
```
http://localhost:5173/organizer/dashboard-v2
```
**Requirements**: 
- Must be logged in
- User role must be "TournamentOrganizer"

#### Player Dashboard
```
http://localhost:5173/player/dashboard-v2
```
**Requirements**:
- Must be logged in
- User role must be "Player"

#### Team Manager Dashboard
```
http://localhost:5173/manager/dashboard-v2
```
**Requirements**:
- Must be logged in
- User role must be "TeamManager"

## 📱 Layout Features

### Sidebar Navigation (Left)
- **Dashboard**: Main overview page
- **Tournaments**: Tournament management (Organizer)
- **Teams/Players**: Team or player management
- **Payouts/Matches**: Financial or match management
- **Settings**: Account settings
- **Support**: Help and support
- **Log Out**: Sign out button at bottom

### Top Navigation Bar
- **Search**: Global search for tournaments, players
- **Notifications**: Bell icon with unread count badge
- **Profile**: User avatar and quick menu

### Main Content Area
- **Stats Cards**: Key metrics at the top
- **Content Sections**: Role-specific information
- **Sidebar Widgets**: Quick actions and summaries (right)

## 🎨 Visual Design

### Color Coding
- **Blue**: Primary actions, navigation
- **Green**: Success states, positive metrics
- **Amber/Orange**: Warnings, tournaments
- **Purple**: Special features, premium content
- **Red**: Errors, critical actions

### Card Types
1. **Stats Cards**: Metrics with icons and trend indicators
2. **Content Cards**: Main information with images
3. **Action Cards**: Quick action buttons with icons
4. **Widget Cards**: Sidebar information panels

## 🔄 Switching Between Versions

### V2 Dashboards (New)
- Modern dark theme
- Sidebar navigation
- Enhanced features
- Routes: `*-v2`

### Original Dashboards
- Light theme with dark mode
- Full-page layouts
- Classic design
- Routes: Original paths

Example:
- New: `/organizer/dashboard-v2`
- Original: `/organizer/dashboard`

## 💡 Usage Examples

### For Tournament Organizers
1. View active tournaments and participants
2. Filter tournaments by status (Live, Upcoming, Completed)
3. Create new tournaments with the "Create Tournament" button
4. Manage existing tournaments with action buttons
5. Track pending actions and registrations

### For Players
1. Check upcoming matches and schedules
2. View team memberships and roles
3. Track personal performance stats
4. Browse achievements and awards
5. Find new teams and tournaments

### For Team Managers
1. Manage multiple teams from one dashboard
2. Monitor team performance and win rates
3. Schedule matches and view calendar
4. Recruit players and manage rosters
5. Register teams for tournaments

## 🛠️ Development

### Running the App
```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

### Access the App
```
http://localhost:5173
```

### Testing Different Roles

You'll need to:
1. Register/login as different user types
2. Or modify the user role in Redux state temporarily for testing

## 📋 Checklist for Setup

- [ ] Client dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Backend API connected (if applicable)
- [ ] User authentication working
- [ ] Role-based routing configured

## 🐛 Troubleshooting

### Dashboard Not Loading
- Check if you're logged in
- Verify user role matches dashboard type
- Check browser console for errors
- Ensure correct route is accessed

### Sidebar Not Showing on Mobile
- Click hamburger menu icon (top-left)
- Check screen size (sidebar auto-hides < 1024px)

### Search Not Working
- Search functionality needs backend API integration
- Currently shows UI only

### Notifications Not Appearing
- Notification system needs WebSocket integration
- Currently displays mock notifications

## 📚 Additional Resources

- **Full Documentation**: See `DASHBOARD_README.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Component Usage**: Check `DashboardLayout.jsx` comments

## 🎯 Next Steps

1. **Explore the Demo**: Visit `/dashboard-demo`
2. **Try Each Dashboard**: Test all three user roles
3. **Customize**: Modify colors, layouts as needed
4. **Integrate APIs**: Connect to real data sources
5. **Add Features**: Implement additional functionality

## 📞 Support

For questions or issues:
1. Check the documentation files
2. Review component code comments
3. Check browser console for errors
4. Verify authentication and routing

---

**Enjoy the new dashboard experience!** 🎉
