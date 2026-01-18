# Enhanced Dashboard Layouts

## Overview
Modern, professional dashboard layouts for Tournament Organizers, Players, and Team Managers with a dark theme and sidebar navigation.

## Features

### Design Elements
- **Dark Theme**: Consistent dark color scheme (`#0B1120`, `#151B2D`, `#1C2333`)
- **Sidebar Navigation**: Fixed sidebar with role-based menu items
- **Responsive Layout**: Mobile-friendly with collapsible sidebar
- **Search Bar**: Global search functionality in top navigation
- **Notifications**: Notification bell with badge indicator
- **User Profile**: Quick access to user profile and logout

### Dashboard Components

#### 1. DashboardLayout Component
Location: `client/src/components/layouts/DashboardLayout.jsx`

Reusable layout wrapper with:
- Fixed sidebar navigation
- Top navigation bar with search
- Notifications dropdown
- User profile section
- Mobile responsive menu

**Props:**
- `children`: Dashboard content
- `role`: User role (displayed in sidebar)
- `userName`: User's full name
- `userAvatar`: User's avatar URL
- `menuItems`: Custom menu structure (optional)

#### 2. Tournament Organizer Dashboard V2
Location: `client/src/pages/admin/OrganizerDashboardV2.jsx`
Route: `/organizer/dashboard-v2`

**Features:**
- Stats cards (Active Tournaments, Total Participants, Pending Actions)
- Filter tabs (All Tournaments, Live, Upcoming, Completed)
- Tournament cards with:
  - Status badges (LIVE, REGISTRATION OPEN, DRAFT)
  - Tournament images
  - Team counts and prize pools
  - Quick action buttons (Manage, View, Continue Setup)
  - Setup progress for draft tournaments
- Create Tournament button

#### 3. Player Dashboard V2
Location: `client/src/pages/admin/PlayerDashboardV2.jsx`
Route: `/player/dashboard-v2`

**Features:**
- Performance stats (Teams, Tournaments, Matches, Win Rate)
- Upcoming matches with venue and time details
- My Teams section with team cards
- Recent achievements showcase
- Sidebar with:
  - Win rate visualization
  - Quick actions menu
  - Career highlights

#### 4. Team Manager Dashboard V2
Location: `client/src/pages/admin/TeamManagerDashboardV2.jsx`
Route: `/manager/dashboard-v2`

**Features:**
- Team management stats
- Quick action cards (Create Team, Add Players, Register Tournament, View Schedule)
- My Teams section with detailed stats (Players, Wins, Losses, Win Rate)
- Upcoming matches calendar
- Recent activities feed
- Sidebar with:
  - Performance overview
  - Achievements showcase
  - Quick stats summary

## Color Scheme

```css
/* Background Colors */
--bg-primary: #0B1120
--bg-secondary: #151B2D
--bg-tertiary: #1C2333

/* Border Colors */
--border-primary: rgba(255, 255, 255, 0.1)
--border-secondary: rgba(255, 255, 255, 0.05)

/* Accent Colors */
--blue: #3B82F6
--green: #10B981
--amber: #F59E0B
--purple: #8B5CF6
--red: #EF4444
--orange: #F97316
```

## Usage

### Accessing the Dashboards

1. **Tournament Organizer**: `/organizer/dashboard-v2`
2. **Player**: `/player/dashboard-v2`
3. **Team Manager**: `/manager/dashboard-v2`

### Using DashboardLayout

```jsx
import DashboardLayout from "../../components/layouts/DashboardLayout";

const MyDashboard = () => {
  const menuItems = [
    {
      title: "MENU",
      items: [
        { icon: Trophy, label: "Dashboard", path: "/dashboard", color: "text-blue-500" },
        { icon: Users, label: "Teams", path: "/teams", color: "text-green-500" },
      ],
    },
  ];

  return (
    <DashboardLayout
      role="Your Role"
      userName="John Doe"
      userAvatar="/path/to/avatar.jpg"
      menuItems={menuItems}
    >
      {/* Your dashboard content */}
    </DashboardLayout>
  );
};
```

## Responsive Breakpoints

- **Mobile**: < 1024px (Collapsible sidebar)
- **Desktop**: ≥ 1024px (Fixed sidebar)

## Icons

Using `lucide-react` icon library:
- Trophy, Users, Calendar, Shield
- Play, Edit, Eye, Plus, ArrowRight
- MapPin, Clock, Star, Award
- TrendingUp, Activity, BarChart3

## API Integration

Replace mock data with actual API calls:

```jsx
// Example: Fetch tournaments
useEffect(() => {
  const fetchTournaments = async () => {
    const response = await fetch('/api/tournaments');
    const data = await response.json();
    setTournaments(data);
  };
  fetchTournaments();
}, []);
```

## Future Enhancements

1. Real-time notifications using WebSocket
2. Advanced filtering and sorting
3. Data visualization charts
4. Export data functionality
5. Customizable dashboard widgets
6. Dark/Light theme toggle
7. Multi-language support

## Migration from Old Dashboards

The original dashboards are still available:
- `/organizer/dashboard` - Original Organizer Dashboard
- `/player/dashboard` - Original Player Dashboard
- `/manager/dashboard` - Original Team Manager Dashboard

You can gradually migrate users or run A/B tests between versions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for images
- Optimized re-renders with React.memo
- Virtualized lists for large datasets (recommended)

## Accessibility

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly

## License

Part of SportsHub project
