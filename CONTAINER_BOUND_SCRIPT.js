/**
 * Container-Bound Google Apps Script for Customer Database
 * 
 * SETUP INSTRUCTIONS FOR CUSTOMER SHEETS:
 * 1. Create a new Google Sheet (or use existing customer Sheet)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete default code and paste this entire file
 * 4. Update NOTIFICATION_EMAIL below (optional, defaults to admin email)
 * 5. Save the script
 * 6. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Click gear icon ⚙️ next to "Select type" > Choose "Web app"
 *    - Description: "Customer Database API"
 *    - Execute as: "Me" (your admin account)
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 *    - Copy the Web App URL
 * 7. Share Sheet with customer's email (Editor permission)
 * 
 * IMPORTANT: This script is container-bound, meaning it's embedded in the Sheet.
 * It uses getActiveSpreadsheet() to access the Sheet it's bound to.
 * Each customer gets their own Sheet with this script embedded.
 */

// Configuration
const NOTIFICATION_EMAIL = 'tripetkk@gmail.com'; // Admin email for notifications
const DATA_SHEET_NAME = 'Data'; // Sheet name where customer data will be saved

/**
 * Handle POST request from the frontend
 * Saves data to the Sheet this script is bound to
 */
function doPost(e) {
  try {
    // Parse the data - handle both JSON and form data
    let data;
    if (e.postData && e.postData.contents) {
      // JSON POST
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      // Form POST with data parameter
      data = JSON.parse(e.parameter.data);
    } else {
      // Form POST with individual parameters
      data = {
        businessName: e.parameter.businessName || '',
        businessType: e.parameter.businessType || '',
        contactName: e.parameter.contactName || '',
        email: e.parameter.email || '',
        phone: e.parameter.phone || '',
        lineId: e.parameter.lineId || '',
        timestamp: e.parameter.timestamp || new Date().toISOString()
      };
    }
    
    // Get the active spreadsheet (the Sheet this script is bound to)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(DATA_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(DATA_SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 8).setValues([[
        'Timestamp',
        'Business Name',
        'Business Type',
        'Contact Name',
        'Email',
        'Phone',
        'LINE ID',
        'Date Submitted'
      ]]);
      // Format header row
      formatSheetHeader(sheet, 1, 8);
    }
    
    // Get the next row
    const nextRow = sheet.getLastRow() + 1;
    
    // Format timestamp
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    
    // Add the data
    sheet.getRange(nextRow, 1, 1, 8).setValues([[
      data.timestamp || dateStr,
      data.businessName || '',
      data.businessType || '',
      data.contactName || '',
      data.email || '',
      data.phone || '',
      data.lineId || '',
      dateStr
    ]]);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 8);
    
    // Send email notification to admin
    sendEmailNotification(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        row: nextRow,
        spreadsheetId: ss.getId(),
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${ss.getId()}/edit`
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET request (for testing/health check)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return ContentService
      .createTextOutput(JSON.stringify({
        message: 'Customer Database API is running',
        status: 'OK',
        spreadsheetId: ss.getId(),
        spreadsheetName: ss.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        message: 'Error',
        status: 'ERROR',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Format sheet header row
 */
function formatSheetHeader(sheet, row, numColumns) {
  const range = sheet.getRange(row, 1, 1, numColumns);
  range.setFontWeight('bold');
  range.setBackground('#8b7355');
  range.setFontColor('#ffffff');
  range.setHorizontalAlignment('center');
}

/**
 * Send email notification to admin
 */
function sendEmailNotification(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const spreadsheetName = ss.getName();
    const spreadsheetId = ss.getId();
    
    const subject = '📊 New Data Entry - ' + (data.businessName || spreadsheetName);
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b7355;">New Data Entry</h2>
        <p>A new entry has been added to: <strong>${spreadsheetName}</strong></p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold; width: 150px;">Business Name:</td>
            <td style="padding: 10px;">${data.businessName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Business Type:</td>
            <td style="padding: 10px;">${data.businessType || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold;">Contact Name:</td>
            <td style="padding: 10px;">${data.contactName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;"><a href="mailto:${data.email || ''}">${data.email || 'N/A'}</a></td>
          </tr>
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold;">Phone:</td>
            <td style="padding: 10px;">${data.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">LINE ID:</td>
            <td style="padding: 10px;">${data.lineId || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold;">Submitted:</td>
            <td style="padding: 10px;">${new Date(data.timestamp).toLocaleString('th-TH') || 'N/A'}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px; color: #8b7355;">
          <strong>View Spreadsheet:</strong><br>
          <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit" 
             style="color: #689f38; text-decoration: none;">
            Open ${spreadsheetName}
          </a>
        </p>
      </div>
    `;
    
    const plainBody = `
New Data Entry

Spreadsheet: ${spreadsheetName}

Business Name: ${data.businessName || 'N/A'}
Business Type: ${data.businessType || 'N/A'}
Contact Name: ${data.contactName || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}
LINE ID: ${data.lineId || 'N/A'}
Submitted: ${new Date(data.timestamp).toLocaleString('th-TH') || 'N/A'}

View Spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit
    `;
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't fail the whole request if email fails
  }
}

