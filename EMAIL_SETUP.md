# Email Verification Setup Guide

## Overview
The system now uses **email verification** instead of admin approval. When users register with `@tsecedu.org`, they receive a verification email at their Outlook address (`@tsecol.onmicrosoft.com`).

## How It Works

### Registration Flow:
1. User registers with `qais.khan2023@tsecedu.org`
2. System converts to Outlook: `qais.khan2023@tsecol.onmicrosoft.com`
3. Verification email sent to Outlook address
4. User clicks link in email
5. Account automatically verified and approved (no admin needed!)
6. User can login immediately

---

## Email Configuration

### Step 1: Get Outlook/Office 365 Credentials

You need an Outlook/Office 365 email account to send emails. This can be:
- Your personal Outlook account
- Institute email (e.g., `admin@tsecol.onmicrosoft.com`)
- A dedicated noreply account

### Step 2: Create App Password (Important!)

**You CANNOT use your regular Outlook password.** You need an app-specific password:

#### For Microsoft 365 / Outlook:
1. Go to https://account.microsoft.com/security
2. Sign in with your Microsoft account
3. Select **Advanced security options**
4. Under **App passwords**, select **Create a new app password**
5. Copy the generated password (you'll use this in .env)

### Step 3: Configure .env File

Add these to your `backend/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@tsecol.onmicrosoft.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM="Alumni Mentorship Platform" <your-email@tsecol.onmicrosoft.com>
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-email@tsecol.onmicrosoft.com` - Your Outlook email
- `your-app-password-here` - The app password you generated

---

## Testing Email Verification

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Start Frontend Server
```bash
cd Front-end
npm run dev
```

### 3. Test Registration
1. Go to http://localhost:5173/register
2. Register with email: `yourname@tsecedu.org`
3. Check your Outlook inbox at: `yourname@tsecol.onmicrosoft.com`
4. Click the verification link
5. You'll be redirected to login - account is now active!

---

## User Management Commands

### List All Users
```bash
cd backend
node deleteUser.js list
```

### Delete Specific User
```bash
node deleteUser.js delete qais.khan2023@tsecedu.org
```

### Delete All Users (except admins)
```bash
node deleteUser.js deleteall
```

---

## Troubleshooting

### "nodemailer.createTransporter is not a function"
**Fixed!** Make sure you restart your backend server after the fix.

### "Failed to send verification email"
**Check:**
1. EMAIL_USER and EMAIL_PASSWORD are correct in .env
2. You're using an app password, not your regular password
3. Your Outlook account allows SMTP access

### "Invalid or expired verification link"
- Links expire after 24 hours
- User needs to register again

### Email not received
**Check:**
1. Spam/Junk folder
2. Email conversion is correct (username@tsecedu.org → username@tsecol.onmicrosoft.com)
3. Backend logs for email send errors

### Can't login after verification
**Check:**
1. User's `isEmailVerified` field is `true` in database
2. User's `isApproved` field is `true` in database
3. Check backend logs during login

---

## Database Fields

Users now have these additional fields:
- `isEmailVerified` - Boolean (true after clicking verification link)
- `isApproved` - Boolean (auto-set to true after email verification)
- `emailVerificationToken` - String (verification token)
- `emailVerificationExpires` - Date (24 hours from registration)

---

## Email Templates

Two emails are sent:

### 1. Verification Email
- Sent immediately after registration
- Contains verification link
- Expires in 24 hours

### 2. Welcome Email
- Sent after successful verification
- Confirms account is active
- Links to dashboard

---

## Production Deployment

For production, update these in .env:

```env
FRONTEND_URL=https://your-production-domain.com
EMAIL_FROM="Alumni Mentorship Platform" <noreply@tsecedu.org>
```

Consider using a dedicated email service like SendGrid or AWS SES for better deliverability.

---

## Security Notes

1. ✅ Verification tokens are random 32-byte hex strings
2. ✅ Tokens expire after 24 hours
3. ✅ Tokens are deleted after successful verification
4. ✅ Email verification required before login
5. ✅ Only @tsecedu.org emails accepted

---

## Need Help?

Check backend console logs for detailed error messages.

Example log output:
```
📧 Verification email sent to qais.khan2023@tsecol.onmicrosoft.com
Message ID: <xxxxx@outlook.com>
✅ Email verified for user: qais.khan2023@tsecedu.org
```
