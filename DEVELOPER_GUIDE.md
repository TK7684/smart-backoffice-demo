# Developer Guide - AI Smart Backoffice Demo

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Setup & Installation](#setup--installation)
5. [Code Documentation](#code-documentation)
6. [API Reference](#api-reference)
7. [Data Flow](#data-flow)
8. [Customization Guide](#customization-guide)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Future Enhancements](#future-enhancements)

---

## System Overview

### Purpose
This is a demo website for an AI-powered backoffice system that integrates with Google Sheets. It demonstrates how small businesses (Pet Shops, Restaurants, Salons) can manage their operations using Google Sheets as a database with AI assistance.

### Key Features
- **Interactive Demo Dashboard**: Shows mock data for different business types
- **Lead Collection**: Captures business information from interested users
- **Template Generation**: Automatically creates Google Sheets templates for users
- **Email Notifications**: Sends notifications to both admin and users
- **Chart Visualization**: Displays sales trends using Chart.js
- **AI Chat Demo**: Simulates AI assistant interactions

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js 4.4.0
- **Backend**: Google Apps Script
- **Storage**: Google Sheets
- **Email**: Gmail API (via Google Apps Script)

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│   (index.html)  │
└────────┬────────┘
         │
         │ HTTP POST (JSON)
         ▼
┌─────────────────────────┐
│  Google Apps Script     │
│  (Web App Endpoint)     │
└────────┬────────────────┘
         │
         ├──► Google Sheets (Leads)
         │    └──► Saves lead data
         │
         ├──► Google Sheets (Template)
         │    └──► Creates user template
         │
         └──► Gmail API
              ├──► Admin notification
              └──► User template email
```

### Component Interaction

1. **Frontend (index.html)**
   - User fills lead form
   - JavaScript collects form data
   - Sends POST request to Google Apps Script

2. **Backend (google-apps-script.js)**
   - Receives POST request
   - Saves lead to Google Sheets
   - Creates template spreadsheet
   - Sends emails
   - Returns response with template link

3. **Google Sheets**
   - Stores lead data
   - Provides template structure
   - Acts as database

---

## File Structure

```
Web Demo/
│
├── index.html                      # Main frontend file
├── google-apps-script.js           # Demo/Lead collection script (standalone)
├── CONTAINER_BOUND_SCRIPT.js        # Production script (container-bound, per customer)
├── SETUP_INSTRUCTIONS.md           # Setup guide for deployment
├── USER_DEMO_GUIDE.md              # User-facing guide
├── DEVELOPER_GUIDE.md              # This file
├── CUSTOMER_ONBOARDING_GUIDE.md    # Production scaling guide
├── CLOUDFLARE_DEPLOYMENT.md        # Cloudflare Pages deployment guide
└── OPENSPEC.md                     # Project specification and requirements
```

### File Descriptions

#### `index.html`
- **Purpose**: Complete single-page application
- **Size**: ~1659 lines
- **Sections**:
  - CSS styles (lines 1-507)
  - HTML structure (lines 508-952)
  - JavaScript logic (lines 953-1659)

#### `google-apps-script.js`
- **Purpose**: Demo/Lead collection script (standalone Web App)
- **Size**: ~503 lines
- **Usage**: For demo system and lead collection
- **Architecture**: Standalone script with hardcoded SPREADSHEET_ID
- **Functions**:
  - `doPost()` - Handles form submissions
  - `doGet()` - Health check endpoint
  - `createTemplateSpreadsheet()` - Creates user templates
  - `sendEmailNotification()` - Sends admin emails
  - `sendTemplateEmailToUser()` - Sends user emails
  - Sheet creation functions (6 functions)

#### `CONTAINER_BOUND_SCRIPT.js`
- **Purpose**: Production script for customer-specific sheets
- **Size**: ~256 lines
- **Usage**: Embedded in each customer's Google Sheet
- **Architecture**: Container-bound script using `getActiveSpreadsheet()`
- **Benefits**: Data isolation, customer ownership, scalable
- **Functions**:
  - `doPost()` - Handles form submissions
  - `doGet()` - Health check endpoint
  - `saveDataToSheet()` - Saves data to customer's Sheet
  - `sendEmailNotification()` - Sends admin emails

---

## Setup & Installation

### Prerequisites
- Google Account
- Access to Google Apps Script
- Access to Google Sheets
- Web hosting (for index.html)

### Step-by-Step Setup

#### 1. Frontend Setup

```bash
# Clone or download the project
cd "Web Demo"
```

**Note**: The frontend now supports dynamic API endpoints via URL parameter:
- Demo mode: Use default URL (no parameter needed)
- Production mode: Use `?api=SCRIPT_URL` parameter
- See `SETUP_INSTRUCTIONS.md` for detailed setup

#### 2. Google Apps Script Setup

1. Go to [script.google.com](https://script.google.com)
2. Create new project
3. Paste `google-apps-script.js` content
4. Update configuration:
   ```javascript
   const SPREADSHEET_ID = '1AASP5TVxS_uTH0Ei13yJGUOZYYkgSxkOHYfUjLlOZ2M';
   const NOTIFICATION_EMAIL = 'tripetkk@gmail.com';
   const SHEET_NAME = 'LeadCollection';
   ```

#### 3. Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Select **Web app**
3. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the Web App URL
6. Update `GOOGLE_SCRIPT_URL` in `index.html`

#### 4. Google Sheets Setup

1. Create or use existing Google Sheet
2. Copy the Sheet ID from URL
3. Update `SPREADSHEET_ID` in Google Apps Script
4. Ensure the script has edit permissions

### Environment Variables

No environment variables needed. All configuration is in:
- `index.html`: `GOOGLE_SCRIPT_URL`
- `google-apps-script.js`: `SPREADSHEET_ID`, `NOTIFICATION_EMAIL`, `SHEET_NAME`

---

## Code Documentation

### Frontend (index.html)

#### CSS Architecture

```css
/* Color Scheme - Earth Tones */
- Background: #f5f1e8 (warm beige)
- Primary: #8b7355 (brown)
- Secondary: #6b5d4f (dark brown)
- Accent: #689f38 (warm green)
- Text: #3e2723, #5d4037 (brown shades)
```

#### Key JavaScript Functions

##### `renderShop(type)`
- **Purpose**: Updates UI when shop type changes
- **Parameters**: `type` - 'pet', 'food', or 'salon'
- **Updates**: Metrics, chart, orders table, alerts

##### `renderChart(chartData)`
- **Purpose**: Renders Chart.js line chart
- **Library**: Chart.js 4.4.0
- **Type**: Line chart with area fill
- **Colors**: Earth tone theme

##### `botReply(message)`
- **Purpose**: Simulates AI chat responses
- **Logic**: Keyword matching for different queries
- **Responses**: Context-aware based on shop type

##### Template Data Structure

```javascript
const templateData = {
  orders: {
    headers: [...],      // Array of column names
    rows: [...]          // Array of data rows
  },
  products: {...},
  customers: {...},
  analytics: {...},
  inventory: {...},
  appointments: {...}
}
```

### Backend (google-apps-script.js)

#### Main Functions

##### `doPost(e)`
- **Purpose**: Main API endpoint
- **Input**: POST request with JSON or form data
- **Process**:
  1. Parse request data
  2. Save to Leads sheet
  3. Create template spreadsheet
  4. Send emails
  5. Return response
- **Response**: JSON with success status and template URL

##### `createTemplateSpreadsheet(leadData)`
- **Purpose**: Creates complete template for user
- **Returns**: Spreadsheet ID
- **Creates**: 6 sheets with headers and sample data
- **Shares**: With user's email if provided

##### Sheet Creation Functions

Each function follows this pattern:
```javascript
function createOrdersSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('SheetName');
  const headers = [...];
  const sampleData = [...];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Set sample data
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // Format header
  formatSheetHeader(sheet, 1, headers.length);
  
  // Auto-resize
  sheet.autoResizeColumns(1, headers.length);
}
```

---

## API Reference

### Endpoint: Google Apps Script Web App

#### POST Request

**URL**: `https://script.google.com/macros/s/.../exec`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "businessName": "ร้านตัวอย่าง",
  "businessType": "pet",
  "contactName": "คุณตัวอย่าง",
  "email": "example@email.com",
  "phone": "081-234-5678",
  "lineId": "@example",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Lead saved successfully",
  "row": 2,
  "templateSpreadsheetId": "abc123...",
  "templateUrl": "https://docs.google.com/spreadsheets/d/abc123.../edit"
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Error message here"
}
```

#### GET Request (Health Check)

**URL**: Same as POST

**Response**:
```json
{
  "message": "Lead Collection API is running",
  "status": "OK"
}
```

---

## Data Flow

### Lead Submission Flow

```
1. User fills form
   ↓
2. JavaScript validates and collects data
   ↓
3. POST request to Google Apps Script
   ↓
4. Google Apps Script:
   a. Saves to Leads sheet
   b. Creates template spreadsheet
   c. Sends admin email
   d. Sends user email
   ↓
5. Response returned to frontend
   ↓
6. Frontend displays template preview + link
```

### Template Creation Flow

```
1. createTemplateSpreadsheet() called
   ↓
2. Create new Google Spreadsheet
   ↓
3. Delete default sheet
   ↓
4. Create 6 sheets:
   - ออเดอร์
   - สินค้า/บริการ
   - ลูกค้า
   - วิเคราะห์
   - สต็อก
   - นัดหมาย
   ↓
5. Add headers and sample data to each
   ↓
6. Format headers
   ↓
7. Share with user email
   ↓
8. Return spreadsheet ID
```

---

## Customization Guide

### Adding New Shop Types

#### 1. Update Frontend (index.html)

Add button in segment:
```html
<button data-shop-type="newtype">New Type</button>
```

Add data in `DATA` object:
```javascript
const DATA = {
  // ... existing types
  newtype: {
    metrics: {...},
    chartData: {...},
    orders: [...],
    alerts: [...]
  }
}
```

#### 2. Update Chat Responses

In `botReply()` function:
```javascript
if (shopType === "newtype") {
  reply = "Custom response for new type";
}
```

### Modifying Template Sheets

#### Add New Sheet

1. Create function in `google-apps-script.js`:
```javascript
function createNewSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('ชื่อ Sheet');
  // ... add headers and data
}
```

2. Call in `createTemplateSpreadsheet()`:
```javascript
createNewSheet(newSpreadsheet);
```

#### Modify Existing Sheet

Edit the corresponding function:
- `createOrdersSheet()`
- `createProductsSheet()`
- etc.

Change headers or sample data arrays.

### Changing Colors

#### Frontend Colors

Update CSS variables or direct color values:
```css
/* Primary color */
#8b7355 → #your-color

/* Background */
#f5f1e8 → #your-color
```

#### Google Sheets Header Colors

In `formatSheetHeader()`:
```javascript
range.setBackground('#8b7355'); // Change this
```

### Adding Form Fields

#### 1. Add HTML Input

```html
<div class="form-group">
  <label class="form-label">New Field *</label>
  <input type="text" class="form-input" name="newField" required />
</div>
```

#### 2. Update JavaScript Collection

```javascript
const leadData = {
  // ... existing fields
  newField: formData.get("newField")
};
```

#### 3. Update Google Apps Script

In `doPost()`:
```javascript
sheet.getRange(nextRow, 1, 1, 9).setValues([[
  // ... existing columns
  data.newField || ''
]]);
```

Update header row creation:
```javascript
sheet.getRange(1, 1, 1, 9).setValues([[
  // ... existing headers
  'New Field'
]]);
```

---

## Deployment

### Frontend Deployment

#### Option 1: Cloudflare Pages (Recommended)

**Why Cloudflare Pages?**
- ✅ Free tier with unlimited bandwidth
- ✅ Global CDN (200+ locations)
- ✅ Automatic SSL certificates
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs
- ✅ Easy rollback

**Quick Deploy**:
1. Push code to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) > Pages
3. Connect GitHub repository
4. Configure:
   - Build command: (leave empty)
   - Build output: `/`
5. Deploy!

**See detailed guide**: `CLOUDFLARE_DEPLOYMENT.md`

#### Option 2: Other Static Hosting

**GitHub Pages**:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo>
git push -u origin main
```

Enable GitHub Pages in repository settings.

**Netlify**:
1. Drag and drop `index.html`
2. Or connect GitHub repository
3. Auto-deploys on push

**Vercel**:
```bash
npm i -g vercel
vercel
```

#### Option 3: Traditional Web Hosting

1. Upload `index.html` to web server
2. Ensure HTTPS is enabled (required for Google Apps Script)
3. Update `GOOGLE_SCRIPT_URL` if needed

### Google Apps Script Deployment

1. Open script in Apps Script editor
2. Click **Deploy** > **Manage deployments**
3. Click **Edit** (pencil icon)
4. Update version or create new version
5. Click **Deploy**

**Important**: After code changes, create new deployment version.

### Testing Deployment

1. Test form submission
2. Verify lead saved to Google Sheets
3. Check email notifications
4. Verify template creation
5. Test template link access

---

## Troubleshooting

### Common Issues

#### 1. Form Not Submitting

**Symptoms**: No response, console errors

**Solutions**:
- Check `GOOGLE_SCRIPT_URL` is correct
- Verify Google Apps Script is deployed
- Check browser console for CORS errors
- Ensure HTTPS is enabled

#### 2. Template Not Created

**Symptoms**: No template spreadsheet, error in response

**Solutions**:
- Check Google Apps Script execution logs
- Verify permissions for creating spreadsheets
- Check `createTemplateSpreadsheet()` function
- Review error messages in Apps Script

#### 3. Emails Not Sending

**Symptoms**: No email received

**Solutions**:
- Check spam folder
- Verify email addresses are correct
- Check Apps Script execution logs
- Ensure MailApp permissions are granted
- Verify daily email quota (100 emails/day for free)

#### 4. CORS Errors

**Symptoms**: Browser console shows CORS errors

**Solutions**:
- Ensure Web App is deployed with "Anyone" access
- Check that `doOptions()` function exists
- Verify request method is POST
- Try redeploying the script

#### 5. Chart Not Displaying

**Symptoms**: Chart area is blank

**Solutions**:
- Check Chart.js CDN is loaded
- Verify `renderChart()` is called
- Check browser console for errors
- Ensure chart container has height

### Debugging Tips

#### Frontend Debugging

```javascript
// Add console logs
console.log("Lead data:", leadData);
console.log("Response:", result);

// Check network tab
// Inspect POST request and response
```

#### Google Apps Script Debugging

1. Open Apps Script editor
2. Click **Executions** tab
3. View execution logs
4. Add `Logger.log()` statements:
```javascript
Logger.log("Data received:", data);
Logger.log("Spreadsheet ID:", spreadsheetId);
```

#### Google Sheets Debugging

1. Check Leads sheet for new rows
2. Verify template spreadsheet was created
3. Check sharing permissions
4. Review sheet structure

---

## Future Enhancements

### Planned Features

1. **Real-time Data Sync**
   - Connect to actual business data
   - Auto-refresh dashboard
   - WebSocket or polling

2. **AI Integration**
   - Connect to actual AI API
   - Real chat responses
   - Data analysis suggestions

3. **User Authentication**
   - Login system
   - User-specific dashboards
   - Data privacy

4. **Advanced Analytics**
   - More chart types
   - Export reports
   - Custom date ranges

5. **Mobile App**
   - React Native or Flutter
   - Push notifications
   - Offline support

6. **Multi-language Support**
   - i18n implementation
   - Language switcher
   - Localized templates

### Technical Improvements

1. **Code Organization**
   - Split into modules
   - Use build tools (Webpack, Vite)
   - TypeScript migration

2. **Performance**
   - Lazy loading
   - Code splitting
   - Caching strategies

3. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

4. **Documentation**
   - API documentation
   - Code comments
   - Video tutorials

---

## Security Considerations

### Current Security Measures

1. **HTTPS Required**: All requests must use HTTPS
2. **Google Apps Script Permissions**: Script runs with user permissions
3. **Email Validation**: Basic email format validation
4. **Input Sanitization**: Google Sheets API handles sanitization

### Recommendations

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Input Validation**: Add server-side validation
3. **CSRF Protection**: Add CSRF tokens
4. **Data Encryption**: Encrypt sensitive data
5. **Access Control**: Implement user authentication
6. **Audit Logging**: Log all data access

---

## Performance Optimization

### Frontend

1. **Minify CSS/JS**: Use minified versions
2. **Image Optimization**: Compress images if added
3. **CDN**: Use CDN for Chart.js
4. **Caching**: Implement browser caching

### Backend

1. **Batch Operations**: Group Google Sheets operations
2. **Caching**: Cache frequently accessed data
3. **Async Operations**: Use asynchronous processing
4. **Error Handling**: Graceful error handling

---

## Contributing

### Code Style

- **Indentation**: 2 spaces
- **Naming**: camelCase for variables, PascalCase for functions
- **Comments**: JSDoc style for functions
- **Formatting**: Consistent spacing and line breaks

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create pull request

---

## Support & Contact

### For Developers

- **Email**: tripetkk@gmail.com
- **Documentation**: This guide
- **Issues**: Report via email or GitHub

### Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

## License

This project is proprietary. All rights reserved.

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Lead collection system
- Template generation
- Email notifications
- 6 template sheets
- Chart visualization
- AI chat demo

---

**Last Updated**: 2024-01-15
**Maintained by**: Development Team

