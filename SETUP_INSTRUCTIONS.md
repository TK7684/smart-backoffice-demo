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

## Step 3: Update HTML File

1. Open `index.html`
2. Find this line (around line 1539):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` with your actual Web App URL from Step 2
4. Save the file

## Step 4: Test

1. Open your website
2. Click **"Demo Template แจกฟรี"** button
3. Fill out the form and submit
4. Check:
   - Google Sheet: The data should appear in the "LeadCollection" sheet
   - Email: You should receive a notification email at tripetkk@gmail.com

## Troubleshooting

### Data not saving to Google Sheets
- Verify the Web App URL is correct in `index.html`
- Check that the script is deployed and set to "Anyone" can access
- Open the Apps Script editor and check "Executions" tab for errors
- Verify the Spreadsheet ID is correct

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

