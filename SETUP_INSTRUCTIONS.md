# Setup Instructions for Google Sheets Lead Collection

## Overview
This setup allows your lead form to automatically save submissions to Google Sheets and send email notifications.

## Step 1: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Delete the default code and paste the contents of `google-apps-script.js`
4. Update the configuration at the top of the script:
   - `SPREADSHEET_ID`: Already set to `1AASP5TVxS_uTH0Ei13yJGUOZYYkgSxkOHYfUjLlOZ2M`
   - `NOTIFICATION_EMAIL`: Already set to `tripetkk@gmail.com`
   - `SHEET_NAME`: Change if you want a different sheet name (default: "Leads")

## Step 2: Deploy as Web App

1. Click **"Deploy"** > **"New deployment"**
2. Click the gear icon ⚙️ next to **"Select type"** and choose **"Web app"**
3. Configure the deployment:
   - **Description**: "Lead Collection API" (or any name you prefer)
   - **Execute as**: **"Me"** (your account)
   - **Who has access**: **"Anyone"** (this allows your website to call it)
4. Click **"Deploy"**
5. **Authorize the script**:
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** > **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"** to grant permissions
6. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 3: Configure Frontend (Optional for Demo)

The frontend now supports dynamic API endpoints. You have two options:

### Option A: Use Default Demo URL (Recommended for Testing)
- No changes needed! The frontend uses a default demo URL automatically.
- Just deploy `index.html` and it will work.

### Option B: Use Your Own Script URL
- The frontend reads the API URL from the `?api=` URL parameter
- Users can access: `yourwebsite.com?api=YOUR_WEB_APP_URL`
- Or update the `DEMO_SCRIPT_URL` constant in `index.html` (around line 1568) if you want a different default

**Note**: For production scaling with multiple customers, see `CUSTOMER_ONBOARDING_GUIDE.md`

## Step 4: Test

1. Open your website
2. Click **"Demo Template แจกฟรี"** button
3. Fill out the form and submit
4. Check:
   - Google Sheet: The data should appear in the "LeadCollection" sheet
   - Email: You should receive a notification email at tripetkk@gmail.com

## Troubleshooting

### Data not saving to Google Sheets
- If using `?api=` parameter, verify the URL is correct
- Check that the script is deployed and set to "Anyone" can access
- Open the Apps Script editor and check "Executions" tab for errors
- Verify the Spreadsheet ID is correct (for `google-apps-script.js`)
- Check browser console for API errors

### Email not received
- Check spam folder
- Verify `NOTIFICATION_EMAIL` in the script is correct
- Check Apps Script execution logs for email errors

### CORS Errors
- Make sure the Web App is deployed with "Anyone" access
- Try redeploying the script as a new version

## Google Sheet Structure

The script will automatically create a sheet named "Leads" (or your custom name) with these columns:
- Timestamp
- Business Name
- Business Type
- Contact Name
- Email
- Phone
- LINE ID
- Date Submitted

## Security Notes

- The Web App URL is public, but only your Google account can modify the script
- Consider adding rate limiting or authentication if you expect high traffic
- The email notifications include all lead data - ensure this is acceptable for your use case

