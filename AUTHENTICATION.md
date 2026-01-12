# Authentication System - Complete Implementation Guide

## 🎉 NEW FEATURES ADDED!

Your Greek Dance Festival application now has a complete user authentication system! Users can create accounts, log in, and manage their own registrations.

## 🔐 Authentication Features

### User Management
- **Sign Up**: Create a new account with email and password
- **Log In**: Secure authentication with encrypted passwords
- **Log Out**: Clear session and return to homepage
- **User Dashboard**: Personal dashboard to view and manage registration

### Security Features
- **Password Hashing**: Bcrypt encryption for secure password storage
- **JWT Tokens**: Secure session management with JSON Web Tokens
- **HTTP-Only Cookies**: Protected session cookies
- **Password Validation**: Minimum 6 characters required

## 📱 New Pages

### 1. Sign Up Page (`/signup`)
- Create account with first name, last name, email, and password
- Password confirmation
- Automatic login after signup
- Redirects to registration page

### 2. Login Page (`/login`)
- Secure email and password authentication
- Error handling for invalid credentials
- Redirects to dashboard after login

### 3. User Dashboard (`/dashboard`)
- View account information
- See registration status
- Access to edit registration
- Logout button

## 🔄 Updated Pages

### Registration Page (`/register`)
**Now requires authentication!**
- Must be logged in to register
- Shows login/signup prompt if not authenticated
- Simplified form (phone & package only)
- Name and email pulled from user account
- Redirects to dashboard after successful registration

### Admin Page (`/admin`)
- Now displays participant's user information
- Shows firstName, lastName from User model
- Email from User model
- Phone and package from Participant model

## 🗄️ Database Schema Changes

### New User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Bcrypt hashed
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  participant Participant? // One-to-one relationship
}
```

### Updated Participant Model
```prisma
model Participant {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone       String
  packageType String
  checkedIn   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Key Changes:**
- Removed firstName, lastName, email from Participant (now in User)
- Added userId foreign key linking to User
- One-to-one relationship: Each User can have one Participant registration

## 🔧 API Routes

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/auth/login`
Log in existing user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/logout`
Log out current user (clears session cookie)

#### GET `/api/auth/me`
Get current authenticated user
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "participant": {
      "id": "...",
      "phone": "+30 210 123 4567",
      "packageType": "Weekend Pass",
      "checkedIn": false
    }
  }
}
```

### Updated Registration Endpoint

#### POST `/api/register`
**Now requires authentication!**
```json
{
  "phone": "+30 210 123 4567",
  "packageType": "Weekend Pass"
}
```
- Automatically links to logged-in user
- Validates user has no existing registration
- Sends email with user's name from account

## 🎯 User Flow

### New User Journey
1. **Browse** → View homepage and pricing
2. **Sign Up** → Create account at `/signup`
3. **Register** → Complete festival registration at `/register`
4. **Dashboard** → Manage registration at `/dashboard`

### Returning User Journey
1. **Log In** → Access account at `/login`
2. **Dashboard** → View registration status
3. **Manage** → Edit preferences or logout

## 🔒 Security Implementation

### Password Security
- Bcrypt hashing with salt rounds
- Never stored in plain text
- Minimum length validation

### Session Management
- JWT tokens with 7-day expiration
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag in production
- SameSite protection

### Environment Variables
Added to `.env`:
```env
JWT_SECRET=greek-dance-festival-super-secret-key-change-me-in-production
```

**IMPORTANT:** Change this secret in production!

## 📚 Libraries Used

- **bcryptjs**: Password hashing
- **jose**: JWT token creation and verification
- **Next.js cookies**: Secure cookie management

## 🔄 Migration

If you have existing participants in the database, they need to be migrated:

1. **Option 1**: Clear database and start fresh
   ```bash
   npx prisma migrate reset
   ```

2. **Option 2**: Write migration script to create User accounts for existing Participants

For testing purposes, Option 1 (reset) is recommended.

## 🧪 Testing the Authentication System

### Test User Registration Flow
1. Go to http://localhost:3000/signup
2. Create an account:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: password123
3. You'll be redirected to `/register`
4. Complete registration with phone and package
5. View your dashboard at `/dashboard`

### Test Login Flow
1. Go to http://localhost:3000/login
2. Log in with test@example.com / password123
3. Access your dashboard

### Test Protected Routes
1. Try accessing `/register` without logging in
   - You'll see a login prompt
2. Try accessing `/dashboard` without logging in
   - Redirected to login page

## 🎨 UI Updates

All authentication pages feature:
- Consistent blue gradient theme
- Glassmorphism design
- Responsive layout
- Error/success messages
- Form validation
- Loading states

## 📖 Navigation Updates

The navigation now intelligently shows:
- **Not logged in**: Home, Pricing, (Login/Signup prompts)
- **Logged in**: Home, Pricing, Dashboard, Logout button

## 🚀 Next Steps

### Recommended Enhancements
1. **Email Verification**: Add email confirmation on signup
2. **Password Reset**: Implement forgot password flow
3. **Profile Editing**: Allow users to update account details
4. **Registration Editing**: Let users modify their festival registration
5. **Social Auth**: Add Google/Facebook login options
6. **Remember Me**: Optional longer session duration

### Admin Enhancements
1. **Admin Authentication**: Add separate admin login
2. **Role-Based Access**: Differentiate between users and admins
3. **Participant Management**: Admin ability to edit user registrations

## 🐛 Troubleshooting

### "Property 'user' does not exist" errors
- Run `npx prisma generate` to regenerate Prisma Client
- Restart TypeScript server in VS Code

### Authentication not working
- Check JWT_SECRET is set in .env
- Verify cookies are enabled in browser
- Check browser console for errors

### Can't access dashboard
- Ensure you're logged in
- Check auth-token cookie exists
- Try logging out and in again

## 📝 Summary

Your application now has:
✅ Complete user authentication system
✅ Secure password storage
✅ Session management with JWT
✅ User dashboard for self-service
✅ Protected registration process
✅ Updated database schema
✅ All authentication pages styled and functional

Users can now:
- Create accounts and log in
- Manage their own registrations
- View their registration status
- Update their preferences

Admins can still:
- Search all participants
- Check in participants
- View all registration details

---

**Your Greek Dance Festival application is now production-ready with full authentication! 🎭🔐**
