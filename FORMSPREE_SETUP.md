# Formspree Setup Instructions

## Step 1: Sign Up for Formspree

1. Go to https://formspree.io
2. Click "Sign Up" (you can use Google/GitHub for quick signup)
3. Create a free account

## Step 2: Create a New Form

1. Once logged in, click "New Form"
2. Give it a name like "Dollars and Dilemmas Contact"
3. Formspree will give you a form endpoint URL that looks like:
   ```
   https://formspree.io/f/YOUR_FORM_ID
   ```

## Step 3: Configure Your Form

1. In Formspree, go to your form settings
2. Set the **Email To** field to: `jared@dollarsanddilemmas.com`
3. (Optional) Customize the email subject line
4. (Optional) Add spam protection if needed

## Step 4: Update Your Website

1. Open `contact.html` in your project
2. Find this line:
   ```html
   <form class="contact-form" data-contact-form method="POST" action="https://formspree.io/f/YOUR_FORM_ID" novalidate>
   ```
3. Replace `YOUR_FORM_ID` with your actual Formspree form ID
4. Save and push to GitHub

## Step 5: Test It

1. Go to your live website's contact page
2. Fill out and submit the form
3. Check your email inbox - you should receive the submission!

## Free Tier Limits

- **50 submissions per month** (free tier)
- Unlimited forms
- Email notifications
- Spam protection

If you need more submissions, Formspree has paid plans starting at $19/month.

## Alternative: Netlify Forms

If you're hosting on Netlify, you can also use Netlify Forms (completely free, no limits):
- Just add `netlify` attribute to your form
- No signup needed if you're on Netlify
- See: https://docs.netlify.com/forms/setup/

