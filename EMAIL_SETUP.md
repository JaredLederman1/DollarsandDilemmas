# Email Setup Instructions for Namecheap

## Step 1: Get Your Namecheap Email Password

1. Log into your **Namecheap account** at https://www.namecheap.com
2. Go to **Domain List** → Select `dollarsanddilemmas.com`
3. Click on **Private Email** (or **Email** tab)
4. Find the email account `jared@dollarsanddilemmas.com`
5. You'll need the **password** for this email account (the one you use to log into webmail)

> **Note:** If you don't remember the password, you can reset it in the Namecheap dashboard.

## Step 2: Configure the Server

### Option A: Using the Helper Script (Easiest)

1. Open the file `start-with-email.sh` in a text editor
2. Replace `YOUR_EMAIL_PASSWORD_HERE` with your actual email password:
   ```bash
   export SMTP_PASS="your-actual-password-here"
   ```
3. Save the file
4. Run the server:
   ```bash
   ./start-with-email.sh
   ```

### Option B: Using Command Line (Manual)

Stop your current server (Ctrl+C), then run:

```bash
SMTP_HOST="dollarsanddilemmas.com" \
SMTP_PORT="465" \
SMTP_SECURE="true" \
SMTP_USER="jared@dollarsanddilemmas.com" \
SMTP_PASS="your-email-password" \
node server.js
```

### Option C: Using a .env File (Recommended for Production)

1. Create a file named `.env` in the project root:
   ```bash
   SMTP_HOST=dollarsanddilemmas.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=jared@dollarsanddilemmas.com
   SMTP_PASS=your-email-password
   ```

2. Install dotenv package:
   ```bash
   npm install dotenv
   ```

3. Update `server.js` to load the .env file (add at the top):
   ```javascript
   require('dotenv').config();
   ```

> **Security Note:** Add `.env` to your `.gitignore` file so you don't accidentally commit your password!

## Step 3: Verify It's Working

1. Start the server with email credentials
2. You should see: `✓ SMTP transport configured — emails will be sent.`
3. Go to http://localhost:3000/contact
4. Fill out and submit the contact form
5. Check your email inbox (jared@dollarsanddilemmas.com or your forwarded Gmail)
6. You should receive the form submission

## Troubleshooting

### "Authentication failed" error
- Double-check your email password in Namecheap
- Make sure you're using the password for `jared@dollarsanddilemmas.com`, not your Namecheap account password

### "Connection timeout" error
- Make sure you're using port `465` with `SMTP_SECURE="true"`
- Verify your firewall isn't blocking port 465

### Emails not arriving
- Check your spam/junk folder
- Verify the email is forwarding correctly in Namecheap settings
- Check the server console for error messages

## Namecheap SMTP Settings Reference

- **SMTP Host:** `dollarsanddilemmas.com`
- **SMTP Port:** `465` (SSL - Secure)
- **SMTP Secure:** `true` (required for port 465)
- **Username:** `jared@dollarsanddilemmas.com`
- **Password:** Your email account password
- **Authentication:** Required

