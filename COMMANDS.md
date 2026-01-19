# Quick Commands Reference

## Email Verification System

### User Management
```bash
# List all users
cd backend
node deleteUser.js list

# Delete specific user
node deleteUser.js delete email@tsecedu.org

# Delete all users (keeps admins)
node deleteUser.js deleteall
```

### Manual Database Operations
```bash
# Verify a user manually (if email fails)
node -e "
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  return User.updateOne(
    { email: 'user@tsecedu.org' },
    { isEmailVerified: true, isApproved: true }
  );
}).then(result => {
  console.log('User verified:', result);
  process.exit(0);
});
"

# Check user verification status
node -e "
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  return User.findOne({ email: 'user@tsecedu.org' });
}).then(user => {
  console.log('Email Verified:', user.isEmailVerified);
  console.log('Approved:', user.isApproved);
  process.exit(0);
});
"
```

### Server Commands
```bash
# Backend
cd backend
npm start              # Production
npm run dev           # Development with auto-reload

# Frontend
cd Front-end
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
```

### Test Email Configuration
```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify().then(() => {
  console.log('✅ Email configuration is valid!');
}).catch(err => {
  console.error('❌ Email configuration error:', err);
});
"
```

### Environment Variables Needed
```env
# In backend/.env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@tsecol.onmicrosoft.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Alumni Mentorship Platform" <your-email@tsecol.onmicrosoft.com>
FRONTEND_URL=http://localhost:5173
```

### Common Issues & Fixes

**Issue:** "User already exists"
```bash
node deleteUser.js delete user@tsecedu.org
```

**Issue:** "nodemailer is not a function"
```bash
cd backend
npm install nodemailer
# Then restart server
```

**Issue:** Need to manually verify user
```bash
node deleteUser.js list  # Find user email
# Then use manual verification command above
```

**Issue:** Check if email was sent
```bash
# Check backend console logs for:
# ✅ Verification email sent to: user@tsecol.onmicrosoft.com
```

### Database Reset (Development Only)
```bash
# Delete all non-admin users
node deleteUser.js deleteall

# Or delete everything including admins (careful!)
node -e "
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
  return User.deleteMany({});
}).then(result => {
  console.log('Deleted all users:', result.deletedCount);
  process.exit(0);
});
"
```
