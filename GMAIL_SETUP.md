# Gmail Setup for Email Verification (RECOMMENDED)

## Why Gmail Instead of Outlook?

Microsoft Outlook has disabled basic authentication for security reasons, which makes it complicated to use with nodemailer. Gmail is much easier to set up and works perfectly for this project.

---

## Step-by-Step Gmail Setup

### Step 1: Create or Use a Gmail Account

You can use:
- Your personal Gmail account
- Create a new Gmail account specifically for this project (recommended)
- Example: `tsecedu.alumni@gmail.com`

### Step 2: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Sign in with your Gmail account
3. Find **"2-Step Verification"** section
4. Click **"Get Started"** or **"Turn On"**
5. Follow the setup wizard (you'll need your phone)
6. Verify with your phone number

### Step 3: Generate App Password

1. After enabling 2-Step Verification, go to: https://myaccount.google.com/apppasswords
2. You might need to sign in again
3. Under **"Select app"**, choose **"Other (Custom name)"**
4. Type: `Alumni Mentorship Platform`
5. Click **"Generate"**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - ⚠️ **Save this password! You won't see it again**

### Step 4: Update Your .env File

Open `backend/.env` and add/update these lines:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM="Alumni Mentorship Platform" <your-gmail@gmail.com>
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-gmail@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the 16-character app password (remove spaces)

### Step 5: Restart Backend Server

```bash
cd backend
npm start
```

### Step 6: Test It!

1. Go to http://localhost:5173/register
2. Register with: `yourname@tsecedu.org`
3. Check the Outlook inbox: `yourname@tsecol.onmicrosoft.com`
4. You should receive the verification email!

---

## Example Configuration

Here's a complete example .env setup:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_jwt_secret

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=tsecedu.alumni@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM="TSEC Alumni Platform" <tsecedu.alumni@gmail.com>
FRONTEND_URL=http://localhost:5173

# Email Domain
ALLOWED_EMAIL_DOMAINS=tsecedu.org
```

---

## How It Works

1. **User registers** with: `qais.khan2023@tsecedu.org`
2. **System converts** to: `qais.khan2023@tsecol.onmicrosoft.com`
3. **Gmail sends email** to: `qais.khan2023@tsecol.onmicrosoft.com`
4. **User receives email** in their Outlook inbox
5. **User clicks link** → Account verified & approved!

---

## Troubleshooting

### "Invalid login" or "Username and Password not accepted"

**Solution:**
1. Make sure 2-Step Verification is enabled
2. Use the App Password, NOT your regular Gmail password
3. Remove all spaces from the 16-character password

### "535-5.7.8 Username and Password not accepted"

**Solution:**
1. Check if you copied the App Password correctly
2. Go to https://myaccount.google.com/apppasswords and generate a new one
3. Make sure there are no quotes or spaces in .env file

### Still not working?

**Try this:**
1. Go to https://myaccount.google.com/lesssecureapps
2. Enable "Less secure app access" (only if App Password doesn't work)
3. ⚠️ Not recommended for production, but works for testing

### Test your configuration:

```bash
cd backend
node -e "
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify()
  .then(() => console.log('✅ Gmail configuration works!'))
  .catch(err => console.error('❌ Error:', err.message));
"
```

---

## Alternative: Using Your College Email

If your college provides an institutional Gmail account (like `admin@tsecedu.org` hosted on Google Workspace), you can use that too:

1. Follow the same steps above
2. Use your institutional email instead
3. Generate App Password from your Google Workspace account

---

## Security Notes

✅ **App Passwords are safe:**
- They're app-specific (if compromised, just revoke it)
- Your main Gmail password stays secure
- You can revoke them anytime at https://myaccount.google.com/apppasswords

✅ **Best Practices:**
- Don't share your .env file
- Don't commit .env to git (it's in .gitignore)
- Use a dedicated Gmail account for this project
- Revoke App Passwords you're not using

---

## Production Deployment

For production, consider using:
- **SendGrid** (100 emails/day free)
- **Mailgun** (5,000 emails free for 3 months)
- **AWS SES** (62,000 emails/month free)

But Gmail with App Password works great for development and small-scale production! 🚀
