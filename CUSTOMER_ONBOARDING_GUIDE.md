# Customer Onboarding Guide - Production Scaling

This guide explains how to set up new customers using the distributed architecture model (1 Customer = 1 Google Sheet).

---

## Overview

**Architecture**: Each customer gets their own Google Sheet with embedded script (container-bound).

**Benefits**:
- ✅ Complete data isolation between customers
- ✅ Customer owns their data (transparent)
- ✅ Easy to manage and scale
- ✅ No additional server costs

---

## Prerequisites

1. **Master Template Sheet** - Google Sheet with all 6 template sheets already created
2. **Container-Bound Script** - Script embedded in the template (see `CONTAINER_BOUND_SCRIPT.js`)
3. **Master Admin Sheet (CRM)** - Sheet tracking all customers
4. **Frontend URL** - Your Cloudflare Pages URL

---

## Step-by-Step Customer Onboarding

### Step 1: Create Customer Sheet

1. **Open Master Template Sheet**
   - This should already have all 6 sheets: ออเดอร์, สินค้า/บริการ, ลูกค้า, วิเคราะห์, สต็อก, นัดหมาย

2. **Make a Copy**
   - Right-click on the Sheet name in Google Drive
   - Select "Make a copy"
   - Or: File > Make a copy

3. **Rename the Copy**
   - Name it: `[CustomerName]_Database` (e.g., `PetShop_A_Database`)
   - This will be the customer's database

### Step 2: Embed Container-Bound Script

1. **Open Script Editor**
   - In the customer's Sheet, click **Extensions** > **Apps Script**

2. **Paste Script**
   - Delete any default code
   - Open `CONTAINER_BOUND_SCRIPT.js` from this repository
   - Copy the entire content
   - Paste into the script editor

3. **Update Configuration** (if needed)
   ```javascript
   const NOTIFICATION_EMAIL = 'tripetkk@gmail.com'; // Your admin email
   const DATA_SHEET_NAME = 'Data'; // Sheet name for customer data
   ```

4. **Save Script**
   - Click **Save** (Ctrl+S or Cmd+S)
   - Name the project: `CustomerDatabaseAPI`

### Step 3: Deploy as Web App

1. **Deploy**
   - Click **Deploy** > **New deployment**
   - Click the gear icon ⚙️ next to **"Select type"**
   - Choose **"Web app"**

2. **Configure Deployment**
   - **Description**: `Customer Database API - [CustomerName]`
   - **Execute as**: **"Me"** (your admin account)
   - **Who has access**: **"Anyone"** (allows frontend to call it)

3. **Deploy**
   - Click **"Deploy"**
   - **Authorize** if prompted:
     - Click **"Authorize access"**
     - Choose your Google account
     - Click **"Advanced"** > **"Go to [Project Name] (unsafe)"**
     - Click **"Allow"**

4. **Copy Web App URL**
   - The URL will look like:
     ```
     https://script.google.com/macros/s/AKfycby.../exec
     ```
   - **Copy this URL** - you'll need it for Step 5

### Step 4: Share Sheet with Customer

1. **Share Sheet**
   - In the customer's Sheet, click **Share** button (top right)
   - Enter customer's email address
   - Set permission: **Editor**
   - Add message (optional): "Your database is ready! You can now view and edit your data."
   - Click **Send**

2. **Customer Access**
   - Customer will receive email notification
   - They can access their Sheet directly
   - They have full edit access to their data

### Step 5: Create Customer Link

1. **Format Customer Link**
   ```
   https://YOUR_FRONTEND_URL?api=CUSTOMER_WEB_APP_URL
   ```
   
   Example:
   ```
   https://smart-backoffice-demo.pages.dev?api=https://script.google.com/macros/s/AKfycby.../exec
   ```

2. **Optional: Use URL Shortener**
   - Use bit.ly or similar service
   - Create short link: `https://bit.ly/customerA`
   - This makes it easier to share with customers

### Step 6: Update Master Admin Sheet (CRM)

1. **Open Master Admin Sheet**
   - This is your central customer management sheet

2. **Add Customer Entry**
   - Add a new row with:
     - **Customer Name**: Name of the business
     - **Email**: Customer's email
     - **Start Date**: Today's date
     - **Sheet URL**: Link to customer's Sheet
     - **Web App URL**: The Web App URL from Step 3
     - **Customer Link**: The link from Step 5
     - **Status**: Active
     - **Notes**: Any additional information

3. **Format** (if needed):
   - Make header row bold
   - Freeze first row
   - Add filters for easy searching

### Step 7: Send Customer Link

1. **Send Link to Customer**
   - Email the customer link from Step 5
   - Include instructions:
     - How to access their database
     - How to use the frontend
     - Contact information for support

2. **Follow Up**
   - Check if customer received the link
   - Verify they can access their Sheet
   - Answer any questions

---

## Master Template Sheet Setup

### Creating the Master Template

1. **Create New Google Sheet**
   - Name: `Master_Template_Database`

2. **Add All 6 Sheets**
   - Use the functions from `google-apps-script.js`:
     - `createOrdersSheet()`
     - `createProductsSheet()`
     - `createCustomersSheet()`
     - `createAnalyticsSheet()`
     - `createInventorySheet()`
     - `createAppointmentsSheet()`

3. **Embed Script**
   - Add `CONTAINER_BOUND_SCRIPT.js` to the Sheet
   - This script will be copied with the Sheet

4. **Test**
   - Deploy and test the script
   - Verify all sheets are created correctly
   - Test data saving functionality

### Master Template Structure

The Master Template should have:
- ✅ All 6 sheets with headers and sample data
- ✅ Container-bound script embedded
- ✅ Proper formatting (earth tone colors)
- ✅ Ready to copy for new customers

---

## Master Admin Sheet (CRM) Setup

### Creating the CRM Sheet

1. **Create New Google Sheet**
   - Name: `Master_Admin_CRM`

2. **Set Up Columns**
   | Column | Description | Example |
   |--------|-------------|---------|
   | Customer Name | Business name | PetShop A |
   | Email | Customer email | customer@email.com |
   | Start Date | When customer started | 2024-01-15 |
   | Sheet URL | Link to customer's Sheet | https://docs.google.com/... |
   | Web App URL | Script Web App URL | https://script.google.com/... |
   | Customer Link | Frontend link with API param | https://app.com?api=... |
   | Status | Active/Inactive/Suspended | Active |
   | Notes | Additional info | VIP customer |

3. **Format Header**
   - Make header row bold
   - Use earth tone colors (#8b7355)
   - Freeze first row
   - Add filters

4. **Protect Sheet** (Optional)
   - Protect the header row
   - Allow only you to edit
   - This prevents accidental changes

---

## Quick Reference Checklist

For each new customer:

- [ ] Copy Master Template Sheet
- [ ] Rename to `[CustomerName]_Database`
- [ ] Verify script is embedded (should copy automatically)
- [ ] Deploy script as Web App
- [ ] Copy Web App URL
- [ ] Share Sheet with customer (Editor permission)
- [ ] Create customer link: `FRONTEND_URL?api=WEB_APP_URL`
- [ ] Add entry to Master Admin Sheet
- [ ] Send customer link via email
- [ ] Follow up with customer

---

## Troubleshooting

### Script Not Working

**Issue**: Script doesn't save data

**Solutions**:
- Verify script is deployed as Web App
- Check "Execute as: Me" is selected
- Check "Who has access: Anyone"
- Verify script is container-bound (not standalone)
- Check script uses `getActiveSpreadsheet()` not `openById()`

### Customer Can't Access Sheet

**Issue**: Customer says they can't open the Sheet

**Solutions**:
- Verify Sheet is shared with correct email
- Check permission is set to "Editor"
- Resend share invitation
- Verify customer's email is correct

### Web App URL Not Working

**Issue**: Frontend can't connect to customer's Sheet

**Solutions**:
- Verify Web App URL is correct
- Check script is deployed (not just saved)
- Test Web App URL directly in browser
- Verify CORS is handled (doOptions function exists)

### Data Not Saving

**Issue**: Data doesn't appear in customer's Sheet

**Solutions**:
- Check script execution logs in Apps Script
- Verify DATA_SHEET_NAME matches actual sheet name
- Check if sheet exists (script creates it if missing)
- Verify script has permission to edit Sheet

---

## Best Practices

1. **Naming Convention**
   - Use consistent naming: `[BusinessName]_Database`
   - Keep customer names in Master Admin Sheet consistent

2. **Documentation**
   - Keep Master Admin Sheet updated
   - Document any custom configurations
   - Note any issues or special requirements

3. **Testing**
   - Test each customer setup before sending link
   - Verify Web App URL works
   - Test data saving functionality

4. **Security**
   - Only share Sheets with authorized customers
   - Use "Editor" permission (not "Owner")
   - Keep Master Admin Sheet private

5. **Backup**
   - Regularly backup Master Template Sheet
   - Keep Master Admin Sheet backed up
   - Document all customer configurations

---

## Support

For questions or issues:
- Email: tripetkk@gmail.com
- Check: `OPENSPEC.md` for architecture details
- Review: `DEVELOPER_GUIDE.md` for technical details

---

**Last Updated**: 2024-01-15

