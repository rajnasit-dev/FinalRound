# Form Validations Analysis - SportsHub

## Complete Entity-wise Form Validation List

---

## 1. AUTHENTICATION FORMS

### 1.1 Login Form (`/auth/login`)
**File**: `client/src/pages/auth/Login.jsx`

| Field | Validations |
|-------|------------|
| **role** | • Required: "Role is required" |
| **email** | • Required: "Email is required"<br>• Pattern: `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` ("Invalid email address")<br>• Max Length: 120 characters |
| **password** | • Required: "Password is required"<br>• Min Length: 6 characters ("Password must be at least 6 characters")<br>• Max Length: 50 characters |

---

### 1.2 Register Form (`/auth/register`)
**File**: `client/src/pages/auth/Register.jsx`

#### Common Fields (All Roles)
| Field | Validations |
|-------|------------|
| **fullName** | • Required: "Full name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters<br>• Pattern: Letters and spaces only |
| **email** | • Required: "Email is required"<br>• Pattern: `/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i` ("Invalid email address") |
| **password** | • Required: "Password is required"<br>• Min Length: 8 characters<br>• Pattern: Must contain uppercase, lowercase, number, special char |
| **confirmPassword** | • Required: "Please confirm password"<br>• Match: Must match password field |
| **phone** | • Required: "Phone number is required"<br>• Pattern: `/^[0-9]{10}$/` ("Phone number must be 10 digits") |
| **city** | • Required: "City is required"<br>• Min Length: 2 characters<br>• Max Length: 50 characters |
| **avatar** | • File Type: image/jpeg, image/png, image/webp<br>• Max Size: 5MB |

#### Player-Specific Fields
| Field | Validations |
|-------|------------|
| **dateOfBirth** | • Required: "Date of birth is required" |
| **gender** | • Required: "Gender is required"<br>• Options: Male, Female, Other |
| **sports** | • Required: At least one sport with role<br>• Validation: validateAtLeastOneSport() |
| **coverImage** | • File Type: image/jpeg, image/png, image/webp<br>• Max Size: 5MB |

#### Organizer-Specific Fields
| Field | Validations |
|-------|------------|
| **orgName** | • Required: "Organization name is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |

---

### 1.3 Change Password Form (`/change-password`)
**File**: `client/src/pages/auth/ChangePassword.jsx`

| Field | Validations |
|-------|------------|
| **currentPassword** | • Required: "Current password is required"<br>• Min Length: 6 characters |
| **newPassword** | • Required: "New password is required"<br>• Min Length: 8 characters<br>• Pattern: Must contain uppercase, lowercase, number, special char<br>• Different from current password |
| **confirmPassword** | • Required: "Please confirm new password"<br>• Match: Must match newPassword |

---

## 2. PLAYER FORMS

### 2.1 Edit Player Profile Form (`/player/profile/edit`)
**File**: `client/src/pages/Player/EditPlayerProfile.jsx`

| Field | Validations |
|-------|------------|
| **fullName** | • Required: "Full name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **email** | • Required: "Email is required"<br>• Pattern: Valid email format |
| **phone** | • Pattern: `/^[0-9]{10}$/` (10 digits)<br>• Optional field |
| **city** | • Min Length: 2 characters<br>• Max Length: 50 characters<br>• Optional field |
| **bio** | • Max Length: 500 characters<br>• Optional field |
| **dateOfBirth** | • Valid date format<br>• Must be in past<br>• Age must be reasonable (5-100 years) |
| **gender** | • Options: Male, Female, Other<br>• Optional field |
| **height** | • Min: 1 ft<br>• Max: 8 ft<br>• Optional field |
| **weight** | • Min: 30 kg<br>• Max: 200 kg<br>• Optional field |
| **sports** | • At least one sport required<br>• Each sport must have a role selected<br>• Validation: validateAtLeastOneSport() |
| **achievements** | • Array of objects {title, year}<br>• Year: 4 digits, not in future<br>• Title: Max 100 characters |

---

## 3. TEAM MANAGER FORMS

### 3.1 Create Team Form (`/manager/teams/create`)
**File**: `client/src/pages/Manager/CreateTeam.jsx`

| Field | Validations |
|-------|------------|
| **name** | • Required: "Team name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **sport** | • Required: "Please select a sport" |
| **city** | • Required: "City is required"<br>• Min Length: 2 characters<br>• Max Length: 50 characters |
| **description** | • Max Length: 500 characters<br>• Optional field |
| **gender** | • Required: "Gender is required"<br>• Options: Male, Female, Mixed |
| **openToJoin** | • Required<br>• Options: "true" (Open), "false" (Closed) |
| **logoUrl** | • File Type: image/jpeg, image/png, image/webp<br>• Max Size: 5MB<br>• Validation: validateImageFile(), validateFileSize() |
| **bannerUrl** | • File Type: image/jpeg, image/png, image/webp<br>• Max Size: 5MB<br>• Validation: validateImageFile(), validateFileSize() |

---

### 3.2 Edit Team Form (`/manager/teams/:id/edit`)
**File**: `client/src/pages/Manager/EditTeam.jsx`

| Field | Validations |
|-------|------------|
| **name** | • Required: "Team name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **city** | • Required: "City is required"<br>• Min Length: 2 characters<br>• Max Length: 50 characters |
| **description** | • Max Length: 500 characters |
| **gender** | • Required: "Gender is required"<br>• Options: Male, Female, Mixed |
| **openToJoin** | • Required<br>• Options: "true", "false" |
| **players** | • Validation: validateAtLeastOnePlayer() for team submission<br>• Players can be added/removed |

---

### 3.3 Add Player to Team Form (`/manager/teams/:id/add-player`)
**File**: `client/src/pages/Manager/AddPlayer.jsx`

| Field | Validations |
|-------|------------|
| **playerId** | • Required: "Please select a player" |
| **role** | • Required: "Please select a role"<br>• Must match sport-specific roles |

---

### 3.4 Edit Manager Profile Form (`/manager/profile/edit`)
**File**: `client/src/pages/Manager/EditManagerProfile.jsx`

| Field | Validations |
|-------|------------|
| **fullName** | • Required: "Full name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **email** | • Required: "Email is required"<br>• Pattern: Valid email format |
| **phone** | • Pattern: `/^[0-9]{10}$/`<br>• Optional field |
| **city** | • Min Length: 2 characters<br>• Max Length: 50 characters<br>• Optional field |

---

## 4. TOURNAMENT ORGANIZER FORMS

### 4.1 Organizer Authorization Form (`/organizer/authorization`)
**File**: `client/src/pages/Organizer/OrganizerAuthorization.jsx`

| Field | Validations |
|-------|------------|
| **verificationDocument** | • Required: "Verification document is required"<br>• File Type: PDF, DOC, DOCX, JPG, PNG<br>• Max Size: 10MB<br>• File validation for document upload |

---

### 4.2 Create Tournament Form (`/organizer/tournaments/create`)
**File**: `client/src/pages/Organizer/CreateTournament.jsx`

| Field | Validations |
|-------|------------|
| **name** | • Required: "Tournament name is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |
| **sport** | • Required: "Please select a sport" |
| **format** | • Required: "Format is required"<br>• Options: League, Knockout |
| **registrationType** | • Auto-derived from sport's `teamBased` field (not user input) |
| **description** | • Max Length: 500 characters<br>• Optional field |
| **teamLimit** | • Required: "Team limit is required"<br>• Min: 2 teams<br>• Max: 1000 teams |
| **playersPerTeam** | • Required (if Team-based)<br>• Min: 1 player<br>• Max: 50 players |
| **registrationStart** | • Required: "Registration start date is required"<br>• Must be future date<br>• Validation: validateFutureDate() |
| **registrationEnd** | • Required: "Registration end date is required"<br>• Must be after registrationStart<br>• Validation: validateEndDate() |
| **startDate** | • Required: "Start date is required"<br>• Must be after registrationEnd |
| **endDate** | • Required: "End date is required"<br>• Must be after startDate<br>• Validation: validateEndDate() |
| **entryFee** | • Min: 0 (cannot be negative)<br>• Max: 1,000,000<br>• Optional field |
| **prizePool** | • Min: 0 (cannot be negative)<br>• Optional field |
| **groundName** | • Optional<br>• Max Length: 100 characters |
| **groundCity** | • Optional<br>• Max Length: 50 characters |
| **groundAddress** | • Optional<br>• Max Length: 200 characters |
| **rules** | • Array of strings<br>• Each rule: Max 200 characters<br>• Optional field |
| **banner** | • File Type: image/jpeg, image/png, image/webp<br>• Max Size: 5MB<br>• Validation: validateImageFile(), validateFileSize() |

---

### 4.3 Edit Tournament Form (`/organizer/tournaments/:id/edit`)
**File**: `client/src/pages/Organizer/EditTournament.jsx`

| Field | Validations |
|-------|------------|
| **name** | • Required: "Tournament name is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |
| **description** | • Max Length: 500 characters |
| **teamLimit** | • Required<br>• Min: 2<br>• Max: 1000 |
| **registrationEnd** | • Required<br>• Must be after registrationStart<br>• Validation: validateEndDate() |
| **startDate** | • Required<br>• Must be after registrationEnd |
| **endDate** | • Required<br>• Must be after startDate<br>• Validation: validateEndDate() |
| **entryFee** | • Min: 0<br>• Max: 1,000,000 |
| **prizePool** | • Min: 0 |
| **rules** | • Array of strings<br>• Max 200 chars per rule |

---

### 4.4 Create Match Form (`/organizer/matches/create`)
**File**: `client/src/pages/Organizer/CreateMatch.jsx`

| Field | Validations |
|-------|------------|
| **tournament** | • Required: "Please select a tournament" |
| **team1/player1** | • Required: "Please select team/player 1" |
| **team2/player2** | • Required: "Please select team/player 2"<br>• Must be different from team1/player1 |
| **matchDate** | • Required: "Match date is required"<br>• Must be within tournament dates<br>• Validation: validateFutureDate() |
| **matchTime** | • Required: "Match time is required"<br>• Format: HH:MM |
| **venue** | • Required: "Venue is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |
| **round** | • Required: "Round is required"<br>• Options: Quarterfinal, Semifinal, Final, etc. |

---

### 4.5 Edit Match Form (`/organizer/matches/:id/edit`)
**File**: `client/src/pages/Organizer/EditMatch.jsx`

| Field | Validations |
|-------|------------|
| **matchDate** | • Required: "Match date is required"<br>• Validation: validateFutureDate() |
| **matchTime** | • Required: "Match time is required" |
| **venue** | • Required: "Venue is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |
| **status** | • Required<br>• Options: Scheduled, Live, Completed, Cancelled |
| **winner** | • Optional (for completed matches)<br>• Must be one of the participating teams |

---

### 4.6 Edit Organizer Profile Form (`/organizer/profile/edit`)
**File**: `client/src/pages/Organizer/EditOrganizerProfile.jsx`

| Field | Validations |
|-------|------------|
| **fullName** | • Required: "Full name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **email** | • Required: "Email is required"<br>• Pattern: Valid email format |
| **phone** | • Pattern: `/^[0-9]{10}$/`<br>• Optional field |
| **city** | • Min Length: 2 characters<br>• Max Length: 50 characters<br>• Optional field |
| **orgName** | • Required: "Organization name is required"<br>• Min Length: 3 characters<br>• Max Length: 100 characters |

---

## 5. ADMIN FORMS

### 5.1 Update User Form (Admin Panel)
**File**: `client/src/pages/admin/AdminUsers.jsx`

| Field | Validations |
|-------|------------|
| **fullName** | • Required: "Full name is required"<br>• Min Length: 3 characters<br>• Max Length: 50 characters |
| **email** | • Required: "Email is required"<br>• Pattern: Valid email format |
| **isActive** | • Boolean (true/false)<br>• Toggle for account status |

---

### 5.2 Website Settings Form (Admin Panel)
**File**: `client/src/pages/admin/AdminWebsiteSettings.jsx`

| Field | Validations |
|-------|------------|
| **platformFee** | • Required: "Platform fee is required"<br>• Min: 0<br>• Max: 10000<br>• Number format |
| **heroVideo** | • File Type: video/mp4, video/webm, video/ogg<br>• Max Size: 50MB<br>• Optional upload |

---

## 6. COMMON VALIDATION UTILITIES

### File Upload Validations
```javascript
validateImageFile(file)
- Valid Types: image/jpeg, image/png, image/gif, image/webp
- Error: "Please select a valid image file"

validateFileSize(file, maxSizeInMB)
- Default Max: 5MB
- Error: "File size must be less than {maxSizeInMB}MB"
```

### Date Validations
```javascript
validateFutureDate(date)
- Date must be >= today
- Error: "Date must be in the future"

validateEndDate(endDate, startDate)
- End date must be > start date
- Error: "End date must be after start date"
```

### Array Validations
```javascript
validateAtLeastOneSport(sports)
- sports.length must be > 0
- Error: "Please select at least one sport"

validateAtLeastOnePlayer(players)
- players.length must be > 0
- Error: "Please select at least one player"
```

---

## 7. VALIDATION PATTERN SUMMARY

### Email Pattern
```regex
/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
```

### Phone Pattern (Indian)
```regex
/^[0-9]{10}$/
```

### Password Pattern (Strong)
```regex
- Min 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)
```

---

## 8. FIELD-WISE VALIDATION RULES (Quick Reference)

| Field Type | Min Length | Max Length | Pattern | Other Rules |
|-----------|-----------|-----------|---------|-------------|
| **Full Name** | 3 | 50 | Letters + spaces | Required |
| **Email** | - | 120 | Email regex | Required, Unique |
| **Password** | 8 | 50 | Strong password | Required, Uppercase + Lowercase + Number + Special |
| **Phone** | 10 | 10 | Numbers only | Required for registration |
| **City** | 2 | 50 | - | Required for most entities |
| **Team Name** | 3 | 50 | - | Required |
| **Tournament Name** | 3 | 100 | - | Required |
| **Description** | - | 500 | - | Optional |
| **Height** | 1 ft | 8 ft | - | Optional |
| **Weight** | 30 kg | 200 kg | - | Optional |
| **Entry Fee** | 0 | 1,000,000 | - | Optional, non-negative |
| **Team Limit** | 2 | 1000 | - | Required for tournaments |
| **Venue** | 3 | 100 | - | Required for matches |

---

## 9. FORM FLOW BY USER JOURNEY

### Player Journey
1. **Register** → Email, Password, Phone, City, DOB, Gender, Sports
2. **Edit Profile** → Update personal info, sports, achievements
3. **Join Tournament** → Auto-validation based on tournament requirements
4. **Change Password** → Old password verification + new password rules

### Team Manager Journey
1. **Register** → Email, Password, Phone, City
2. **Create Team** → Team name, sport, city, gender, logo, banner
3. **Add Players** → Select players matching team sport
4. **Edit Team** → Update team details
5. **Register for Tournament** → Team validation based on tournament rules
6. **Change Password** → Security validation

### Tournament Organizer Journey
1. **Register** → Email, Password, Phone, City, Organization Name
2. **Authorization** → Upload verification documents
3. **Create Tournament** → Comprehensive tournament setup with dates, fees, rules
4. **Create Matches** → Schedule matches within tournament
5. **Edit Tournament** → Update tournament details (restricted once started)
6. **Change Password** → Security validation

### Admin Journey
1. **Login** → Email, Password, Role
2. **Manage Users** → Update user details, activate/deactivate
3. **Website Settings** → Platform fee, hero video upload
4. **Authorize Organizers** → Review verification documents

---

## 10. CRITICAL VALIDATION CHECKPOINTS

### Registration Forms
- ✅ Email uniqueness check (backend)
- ✅ Password strength validation
- ✅ Phone number format (10 digits)
- ✅ File upload size and type validation
- ✅ Role-specific field requirements

### Tournament Creation
- ✅ Date sequence validation (registration → start → end)
- ✅ Platform fee payment verification
- ✅ Banner image upload validation
- ✅ Rules array validation
- ✅ Team/player limit validation

### Match Creation
- ✅ Date within tournament period
- ✅ Unique team/player selection
- ✅ Venue validation
- ✅ Time format validation

### Profile Updates
- ✅ Email cannot be changed to existing email
- ✅ Sports array validation for players
- ✅ Achievement year validation (not in future)
- ✅ Bio/description length limits

---

## Notes
- All forms use **React Hook Form** for validation
- Validation messages are user-friendly and specific
- File uploads have both client-side and server-side validation
- Dates are validated for logical sequences (start < end)
- Required fields are marked with asterisks (*) in UI
- Real-time validation feedback is provided
- Form submission is disabled during API calls (isSubmitting state)
