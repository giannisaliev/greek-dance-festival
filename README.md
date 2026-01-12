# Greek Dance Festival Application

A modern, full-stack web application for managing registrations and check-ins for the Greek Dance Festival.

## Features

### 🎭 Public Features
- **Homepage**: Beautiful landing page with festival information, dates, and call-to-action buttons
- **Pricing Page**: Card-based package display with three tiers (Day Pass, Weekend Pass, VIP Pass)
- **Registration Form**: Complete registration with:
  - First name and last name fields
  - Email validation
  - Phone number input with country code selection
  - Package selection dropdown
  - Form validation and error handling

### 👨‍💼 Admin Features
- **Admin Dashboard**: Comprehensive participant management
  - Real-time statistics (total participants, checked-in, pending)
  - Search functionality by name, email, or phone number
  - Quick check-in/check-out buttons
  - Responsive table view of all participants

### 📧 Email Notifications
- Automated email notifications sent to admin when new participants register
- Includes participant details (name, email, phone, package)

### 🎨 Design
- Modern gradient blue theme inspired by Greek colors
- Fully responsive design for mobile, tablet, and desktop
- Glassmorphism effects with backdrop blur
- Smooth transitions and hover effects

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Email**: Nodemailer
- **Phone Input**: react-phone-number-input

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
   ```bash
   cd "Greek Dance Festival"
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Set up environment variables:
   Edit the `.env` file and configure your email settings:
   ```env
   DATABASE_URL="file:./dev.db"
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ADMIN_EMAIL=admin@greekdancefestival.com
   ```

4. Database is already set up and migrated.

5. Start the development server:

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Pages

### Public Pages
- `/` - Homepage with festival information
- `/pricing` - Package pricing and details
- `/register` - Registration form

### Admin Pages
- `/admin` - Admin dashboard for participant management

## Database Schema

### Participant Model
```prisma
model Participant {
  id          String   @id @default(cuid())
  firstName   String
  lastName    String
  email       String   @unique
  phone       String
  packageType String
  checkedIn   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## API Routes

### POST `/api/register`
Register a new participant
- **Body**: `{ firstName, lastName, email, phone, packageType }`
- **Response**: Participant data or error message

### GET `/api/participants?q=search`
Search and retrieve participants
- **Query**: `q` (optional) - search term
- **Response**: Array of matching participants

### PATCH `/api/participants`
Update participant check-in status
- **Body**: `{ id, checkedIn }`
- **Response**: Updated participant data

## Festival Packages

### Day Pass - €45
- Access to all performances
- One workshop session
- Festival program
- Traditional Greek refreshments

### Weekend Pass - €120 (Most Popular)
- All Day Pass benefits
- Access to all 3 days
- Unlimited workshop sessions
- Festival merchandise
- Priority seating
- Welcome reception

### VIP Pass - €250
- All Weekend Pass benefits
- Meet & greet with performers
- Exclusive VIP lounge access
- Professional photo package
- Private dance lesson
- Festival dinner invitation
- Premium gift bag

## Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in the `.env` file

## Development

### Project Structure
```
Greek Dance Festival/
├── app/
│   ├── api/
│   │   ├── participants/route.ts
│   │   └── register/route.ts
│   ├── admin/page.tsx
│   ├── pricing/page.tsx
│   ├── register/page.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   └── email.ts
├── prisma/
│   └── schema.prisma
└── .env
```

## Learn More

### About the Application
- Homepage with festival dates and information
- Three pricing tiers for different participant needs  
- Full registration system with email notifications
- Admin dashboard for check-ins during the festival

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

---

**Greek Dance Festival 2025** - Experience the magic of traditional Greek dance, music, and culture! 🎭🎵

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
