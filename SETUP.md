# Greek Dance Festival - Quick Setup Guide

## ✅ Setup Complete!

Your Greek Dance Festival application is now ready and running!

## 🌐 Access the Application

The application is currently running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.68.110:3000

## 📄 Available Pages

### For Participants:
1. **Homepage** - http://localhost:3000
   - View festival information and dates
   - Navigate to other sections

2. **Pricing** - http://localhost:3000/pricing
   - View all package options (Day Pass, Weekend Pass, VIP Pass)
   - Compare features and prices
   - Direct links to registration

3. **Register** - http://localhost:3000/register
   - Fill out the registration form
   - Select your preferred package
   - Submit registration

### For Administrators:
4. **Admin Dashboard** - http://localhost:3000/admin
   - View all registered participants
   - Search by name, email, or phone
   - Check in participants during the festival
   - View statistics

## 🔧 Important Configuration

### Email Setup (Required for Notifications)
Before receiving email notifications, you need to configure your email settings in the `.env` file:

1. Open the `.env` file in the root directory
2. Update these values:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com        # Your Gmail address
   EMAIL_PASSWORD=your-app-password        # Gmail app password (not your regular password)
   ADMIN_EMAIL=admin@greekdancefestival.com  # Where to receive notifications
   ```

### How to Get Gmail App Password:
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Copy this password to the `.env` file

## 📊 Database

The SQLite database is already set up at:
- Location: `prisma/dev.db`
- Schema: Participant model with check-in functionality

## 🧪 Testing the Application

### Test Registration Flow:
1. Go to http://localhost:3000
2. Click "Register Now" or "View Packages"
3. Select a package and click "Select [Package Name]"
4. Fill out the registration form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +30 210 123 4567
   - Package: (pre-selected or choose one)
5. Click "Complete Registration"
6. You should see a success message

### Test Admin Dashboard:
1. Go to http://localhost:3000/admin
2. View the registered participant
3. Use the search bar to find participants
4. Click "Check In" to mark participant as checked in
5. See statistics update in real-time

## 📦 Festival Packages

### Day Pass - €45
Perfect for one day of festival fun

### Weekend Pass - €120 ⭐ Most Popular
Full festival experience across 3 days

### VIP Pass - €250
Ultimate festival experience with exclusive perks

## 🎨 Customization

### Update Festival Dates:
Edit `app/page.tsx` and change the dates in the Festival Dates section.

### Modify Packages:
- **Pricing page**: `app/pricing/page.tsx`
- **Registration form**: `app/register/page.tsx`

### Change Colors/Styling:
All pages use Tailwind CSS classes. You can modify the gradient colors and styling in each page component.

## 🛠️ Development Commands

```bash
# Start development server (already running)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 📱 Features Summary

✅ Modern, responsive design
✅ Homepage with festival information
✅ Three-tier pricing system
✅ Registration form with validation
✅ Phone number with country codes
✅ Email notifications (configure .env)
✅ Admin dashboard with search
✅ Participant check-in system
✅ Real-time statistics
✅ SQLite database
✅ Full TypeScript support

## 🐛 Troubleshooting

### Database Issues:
```bash
npx prisma generate
npx prisma migrate reset
```

### Port Already in Use:
Kill the process using port 3000 or change the port:
```bash
npm run dev -- -p 3001
```

### Email Not Sending:
1. Check your .env file configuration
2. Verify Gmail app password is correct
3. Ensure 2FA is enabled on Gmail
4. Check firewall/antivirus settings

## 📧 Support

For any issues or questions:
- Check the README.md for detailed documentation
- Review the code comments in each file
- Consult Next.js documentation at https://nextjs.org/docs

---

**🎉 Congratulations! Your Greek Dance Festival application is ready to use!**

Navigate to http://localhost:3000 to get started!
