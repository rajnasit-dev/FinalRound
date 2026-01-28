# Pagination Implementation

## Overview
Added pagination to improve user experience and performance when browsing large lists of tournaments, teams, players, and users.

## Components

### Pagination Component
**Location:** `client/src/components/ui/Pagination.jsx`

**Features:**
- ✅ Page navigation with prev/next buttons
- ✅ Direct page number selection
- ✅ Ellipsis for large page ranges
- ✅ Items per page selector (10, 20, 30, 50)
- ✅ Shows current range (e.g., "Showing 1 to 10 of 50 items")
- ✅ Responsive design (stacks on mobile)
- ✅ Disabled state for first/last pages
- ✅ Dark mode support
- ✅ Uses `font-num` class for numbers

**Props:**
- `currentPage` - Current active page number
- `totalPages` - Total number of pages
- `onPageChange` - Callback when page changes
- `itemsPerPage` - Number of items per page
- `totalItems` - Total number of items
- `onItemsPerPageChange` - Callback when items per page changes

## Pages Updated

### Admin Pages

#### 1. Admin Tournaments (`client/src/pages/admin/Tournaments.jsx`)
- ✅ Pagination added to tournament table
- ✅ Default: 10 items per page
- ✅ Resets to page 1 when filters change
- ✅ Works with search and status filters

#### 2. Admin Teams (`client/src/pages/admin/Teams.jsx`)
- ✅ Pagination added to team table
- ✅ Default: 10 items per page
- ✅ Resets to page 1 when search changes
- ✅ Works with search filter

#### 3. Admin Users (`client/src/pages/admin/Users.jsx`)
- ✅ Pagination added to user table
- ✅ Default: 10 items per page
- ✅ Resets to page 1 when filters change
- ✅ Works with search and role filters

### Public Pages

#### 4. Public Players (`client/src/pages/public/Players.jsx`)
- ✅ Pagination added to player grid
- ✅ Default: 12 items per page (3x4 grid)
- ✅ Resets to page 1 when filters change
- ✅ Works with sport, role, and search filters
- ✅ Updated count display to show range

#### 5. Public Teams (`client/src/pages/public/Teams.jsx`)
- ✅ Pagination added to team grid
- ✅ Default: 12 items per page (3x4 grid)
- ✅ Resets to page 1 when filters change
- ✅ Works with sport, status, and search filters
- ✅ Updated count display to show range

#### 6. Public Tournaments (`client/src/pages/public/Tournaments.jsx`)
- ✅ Pagination added to each tournament section independently:
  - Live Tournaments
  - Upcoming Tournaments
  - Completed Tournaments
  - Cancelled Tournaments
- ✅ Default: 9 items per page (3x3 grid)
- ✅ Each section has its own page state
- ✅ Resets all pages to 1 when filters change
- ✅ Works with sport, registration type, and search filters

## Implementation Pattern

### 1. Import Pagination Component
```jsx
import Pagination from "../../components/ui/Pagination";
```

### 2. Add State Variables
```jsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10); // or 12 for grids
```

### 3. Calculate Pagination
```jsx
const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
```

### 4. Reset Page on Filter Change
```jsx
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, statusFilter, /* other filters */]);
```

### 5. Render Pagination
```jsx
{totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    itemsPerPage={itemsPerPage}
    totalItems={filteredData.length}
    onItemsPerPageChange={setItemsPerPage}
  />
)}
```

## Benefits

1. **Performance**: Only renders items for current page
2. **User Experience**: Easy navigation through large datasets
3. **Flexibility**: Users can choose how many items to display
4. **Responsive**: Works well on all screen sizes
5. **Consistency**: Same pagination across all pages
6. **Accessibility**: Proper ARIA labels for navigation

## Default Items Per Page

- **Tables** (Admin pages): 10 items
- **Grids** (Public pages): 9-12 items (optimal for 3-column layout)

## Features

- **Smart Page Range**: Shows up to 5 page numbers with ellipsis
- **First/Last Jump**: Quick navigation to first/last page
- **Auto-reset**: Returns to page 1 when filters change
- **Conditional Display**: Only shows when there's more than 1 page
- **Number Formatting**: Uses `font-num` class for consistent number display
