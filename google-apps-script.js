/**
 * Google Apps Script for Lead Collection
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Update the SPREADSHEET_ID and NOTIFICATION_EMAIL below
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Choose "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 *    - Copy the Web App URL and use it in index.html
 */

// Configuration
const SPREADSHEET_ID = '1AASP5TVxS_uTH0Ei13yJGUOZYYkgSxkOHYfUjLlOZ2M';
const NOTIFICATION_EMAIL = 'tripetkk@gmail.com';
const SHEET_NAME = 'Leads'; // Sheet name where data will be saved

// Stripe Configuration
// IMPORTANT: You need a backend server to securely handle Stripe API calls
// Google Apps Script cannot directly call Stripe API with secret keys
// Options:
// 1. Use a backend server (Node.js, Python, etc.) that calls Stripe API
// 2. Use Stripe's serverless functions (AWS Lambda, Google Cloud Functions, etc.)
// 3. Use a service like Zapier or Make.com to connect Stripe with Google Sheets
//
// For this implementation, we'll proxy requests to a backend endpoint
// Update BACKEND_URL with your backend server URL
const STRIPE_CONFIG = {
  // Your backend server URL that handles Stripe API calls
  // This backend should have your Stripe Secret Key
  BACKEND_URL: 'https://your-backend-server.com/api/stripe', // ⚠️ REPLACE WITH YOUR BACKEND URL
  
  // Alternative: If using a service like Zapier/Make.com webhook
  WEBHOOK_URL: '' // Optional: Webhook URL for payment notifications
};

/**
 * Create Stripe Checkout Session
 * This function proxies the request to your backend server
 * Your backend should:
 * 1. Create a Stripe Checkout Session using Stripe API
 * 2. Return the session ID to the frontend
 */
function createStripeCheckoutSession(packageData) {
  try {
    Logger.log('Creating Stripe Checkout Session for package: ' + packageData.package);
    
    // If no backend URL configured, return error
    if (!STRIPE_CONFIG.BACKEND_URL || STRIPE_CONFIG.BACKEND_URL === 'https://your-backend-server.com/api/stripe') {
      Logger.log('ERROR: Backend URL not configured');
      return {
        success: false,
        error: 'Stripe backend not configured. Please set up a backend server to handle Stripe API calls.'
      };
    }
    
    // Prepare request to backend
    const requestBody = {
      action: 'createCheckoutSession',
      package: packageData.package,
      packageName: packageData.packageName,
      amount: packageData.amount,
      currency: packageData.currency || 'thb',
      successUrl: packageData.successUrl || '',
      cancelUrl: packageData.cancelUrl || ''
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(requestBody)
    };
    
    const response = UrlFetchApp.fetch(STRIPE_CONFIG.BACKEND_URL + '/create-session', options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200 && responseData.sessionId) {
      Logger.log('Successfully created Stripe Checkout Session');
      return {
        success: true,
        sessionId: responseData.sessionId,
        url: responseData.url // Optional: direct checkout URL
      };
    } else {
      Logger.log('Failed to create Stripe Checkout Session. Status: ' + response.getResponseCode());
      Logger.log('Response: ' + JSON.stringify(responseData));
      return {
        success: false,
        error: responseData.error || 'Unknown error',
        status: response.getResponseCode()
      };
    }
  } catch (error) {
    Logger.log('Error creating Stripe Checkout Session: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Verify Stripe Payment
 * This function verifies payment status with your backend
 * Your backend should:
 * 1. Retrieve the Stripe Checkout Session using session ID
 * 2. Check payment status
 * 3. Return payment verification result
 */
function verifyStripePayment(sessionId, packageData) {
  try {
    Logger.log('Verifying Stripe payment for session: ' + sessionId);
    
    // If no backend URL configured, return error
    if (!STRIPE_CONFIG.BACKEND_URL || STRIPE_CONFIG.BACKEND_URL === 'https://your-backend-server.com/api/stripe') {
      Logger.log('ERROR: Backend URL not configured');
      return {
        success: false,
        error: 'Stripe backend not configured. Please set up a backend server to handle Stripe API calls.'
      };
    }
    
    // Prepare request to backend
    const requestBody = {
      action: 'verifyPayment',
      sessionId: sessionId,
      package: packageData.package || ''
    };
    
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(requestBody)
    };
    
    const response = UrlFetchApp.fetch(STRIPE_CONFIG.BACKEND_URL + '/verify-payment', options);
    const responseData = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      Logger.log('Payment verification result: ' + JSON.stringify(responseData));
      return {
        success: true,
        paid: responseData.paid || false,
        amount: responseData.amount,
        currency: responseData.currency,
        customerEmail: responseData.customerEmail
      };
    } else {
      Logger.log('Failed to verify payment. Status: ' + response.getResponseCode());
      return {
        success: false,
        error: responseData.error || 'Unknown error',
        paid: false
      };
    }
  } catch (error) {
    Logger.log('Error verifying Stripe payment: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      paid: false
    };
  }
}

/**
 * Handle POST request from the form
 */
function doPost(e) {
  Logger.log('=== doPost() called ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('Request method: POST');
  
  try {
    // Parse the data - handle both JSON and form data
    Logger.log('Parsing request data...');
    let data;
    if (e.postData && e.postData.contents) {
      // JSON POST
      Logger.log('Data format: JSON POST');
      data = JSON.parse(e.postData.contents);
      Logger.log('Parsed JSON data: ' + JSON.stringify(data));
    } else if (e.parameter && e.parameter.data) {
      // Form POST with data parameter
      Logger.log('Data format: Form POST with data parameter');
      data = JSON.parse(e.parameter.data);
      Logger.log('Parsed form data: ' + JSON.stringify(data));
    } else {
      // Form POST with individual parameters
      Logger.log('Data format: Form POST with individual parameters');
      data = {
        businessName: e.parameter.businessName || '',
        businessType: e.parameter.businessType || '',
        contactName: e.parameter.contactName || '',
        email: e.parameter.email || '',
        phone: e.parameter.phone || '',
        lineId: e.parameter.lineId || '',
        timestamp: e.parameter.timestamp || new Date().toISOString()
      };
      Logger.log('Constructed data object: ' + JSON.stringify(data));
    }
    
    // Check if this is a Stripe Checkout Session creation request
    if (data.action === 'createStripeCheckout') {
      Logger.log('Stripe Checkout Session creation request detected');
      const checkoutResult = createStripeCheckoutSession({
        package: data.package,
        packageName: data.packageName,
        amount: data.amount,
        currency: data.currency || 'thb',
        successUrl: data.successUrl || '',
        cancelUrl: data.cancelUrl || ''
      });
      
      return ContentService.createTextOutput(JSON.stringify(checkoutResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if this is a Stripe payment verification request
    if (data.action === 'verifyStripePayment') {
      Logger.log('Stripe payment verification request detected');
      const verificationResult = verifyStripePayment(data.sessionId, {
        package: data.package || ''
      });
      
      return ContentService.createTextOutput(JSON.stringify(verificationResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the spreadsheet
    Logger.log('Opening spreadsheet: ' + SPREADSHEET_ID);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Spreadsheet opened: ' + ss.getName());
    
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      Logger.log('Sheet "' + SHEET_NAME + '" does not exist, creating new sheet...');
      sheet = ss.insertSheet(SHEET_NAME);
      Logger.log('New sheet created: ' + sheet.getName());
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
      Logger.log('Headers added to sheet');
      // Format header row
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 8).setBackground('#8b7355');
      sheet.getRange(1, 1, 1, 8).setFontColor('#ffffff');
      Logger.log('Header row formatted');
    } else {
      Logger.log('Using existing sheet: ' + sheet.getName());
    }
    
    // Get the next row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    Logger.log('Last row: ' + lastRow + ', Next row: ' + nextRow);
    
    // Format timestamp
    const now = new Date();
    const dateStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    Logger.log('Formatted timestamp: ' + dateStr);
    
    // Check if this is a package order
    const isPackageOrder = data.businessType === 'package' || data.package;
    
    // Add the data - extend columns if package order
    let rowData;
    if (isPackageOrder) {
      // Package orders need more columns
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const numColumns = Math.max(headers.length, 15);
      
      // Ensure headers exist for package orders
      if (headers.length < 15 || !headers.includes('Package')) {
        const newHeaders = [
          'Timestamp', 
          'Business Name', 
          'Business Type', 
          'Contact Name', 
          'Email', 
          'Phone', 
          'LINE ID', 
          'Date Submitted', 
          'Package', 
          'Package Name', 
          'Package Price', 
          'Verified Amount',
          'Payment Status',
          'Requirements',
          'Additional Info'
        ];
        sheet.getRange(1, 1, 1, 15).setValues([newHeaders]);
        // Format header row
        formatSheetHeader(sheet, 1, 15);
        Logger.log('Created package order headers (15 columns)');
      }
      
      rowData = [
        data.timestamp || dateStr,
        data.businessName || '',
        data.businessType || '',
        data.contactName || '',
        data.email || '',
        data.phone || '',
        data.lineId || '',
        dateStr,
        data.package || '',
        data.packageName || '',
        data.packagePrice || '',
        data.verifiedAmount || '',
        data.paymentStatus || 'Pending Payment',
        data.requirements || '',
        data.additionalInfo || ''
      ];
      Logger.log('Package order row data prepared with ' + rowData.length + ' columns');
    } else {
      rowData = [
        data.timestamp || dateStr,
        data.businessName || '',
        data.businessType || '',
        data.contactName || '',
        data.email || '',
        data.phone || '',
        data.lineId || '',
        dateStr
      ];
    }
    
    Logger.log('Row data to insert: ' + JSON.stringify(rowData));
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    Logger.log('Data inserted into row ' + nextRow);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    Logger.log('Columns auto-resized');
    
    if (isPackageOrder) {
      // Handle package order
      Logger.log('Processing package order...');
      Logger.log('Package: ' + (data.package || 'N/A'));
      Logger.log('Package Name: ' + (data.packageName || 'N/A'));
      Logger.log('Package Price: ' + (data.packagePrice || 'N/A'));
      
      // Send package order notification to admin
      Logger.log('Sending package order notification to admin...');
      sendPackageOrderNotification(data);
      Logger.log('Package order notification sent');
      
      // Send confirmation email to customer
      if (data.email) {
        Logger.log('Sending package confirmation email to customer: ' + data.email);
        sendPackageConfirmationEmail(data);
        Logger.log('Package confirmation email sent');
      }
    } else {
      // Handle regular lead (template creation)
      // Create template spreadsheet for the user
      Logger.log('Creating template spreadsheet...');
      const templateSpreadsheetId = createTemplateSpreadsheet(data);
      Logger.log('Template spreadsheet ID: ' + (templateSpreadsheetId || 'null'));
      
      // Send email notification with template link
      Logger.log('Sending email notification to admin...');
      sendEmailNotification(data, templateSpreadsheetId);
      Logger.log('Admin email notification sent');
      
      // Send template link to user
      if (templateSpreadsheetId && data.email) {
        Logger.log('Sending template email to user: ' + data.email);
        sendTemplateEmailToUser(data, templateSpreadsheetId);
        Logger.log('User email sent');
      } else {
        Logger.log('Skipping user email - templateSpreadsheetId: ' + templateSpreadsheetId + ', email: ' + (data.email || 'missing'));
      }
    }
    
    // Return success response with template link
    const response = {
      success: true,
      message: 'Lead saved successfully',
      row: nextRow,
      templateSpreadsheetId: templateSpreadsheetId,
      templateUrl: `https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit`
    };
    Logger.log('Returning success response: ' + JSON.stringify(response));
    Logger.log('=== doPost() completed successfully ===');
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('=== ERROR in doPost() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    Logger.log('Error name: ' + error.name);
    // Return error response with CORS headers
    const errorResponse = {
      success: false,
      error: error.toString()
    };
    Logger.log('Returning error response: ' + JSON.stringify(errorResponse));
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions() {
  Logger.log('=== doOptions() called ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('Request method: OPTIONS (CORS preflight)');
  Logger.log('Returning empty response for CORS preflight');
  Logger.log('=== doOptions() completed ===');
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET request (for testing)
 */
function doGet(e) {
  Logger.log('=== doGet() called ===');
  Logger.log('Timestamp: ' + new Date().toISOString());
  Logger.log('Request method: GET');
  if (e && e.parameter) {
    Logger.log('Request parameters: ' + JSON.stringify(e.parameter));
  }
  
  const response = {
    message: 'Lead Collection API is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    spreadsheetId: SPREADSHEET_ID
  };
  Logger.log('Returning health check response: ' + JSON.stringify(response));
  Logger.log('=== doGet() completed ===');
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create template spreadsheet for the user
 */
function createTemplateSpreadsheet(leadData) {
  Logger.log('=== createTemplateSpreadsheet() called ===');
  Logger.log('Lead data: ' + JSON.stringify(leadData));
  
  try {
    // Create a new spreadsheet
    const spreadsheetName = `Template - ${leadData.businessName || 'Demo'} - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd')}`;
    Logger.log('Creating spreadsheet with name: ' + spreadsheetName);
    const newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    const spreadsheetId = newSpreadsheet.getId();
    Logger.log('Spreadsheet created with ID: ' + spreadsheetId);
    
    // Delete default sheet
    const defaultSheet = newSpreadsheet.getSheets()[0];
    if (defaultSheet) {
      Logger.log('Deleting default sheet: ' + defaultSheet.getName());
      newSpreadsheet.deleteSheet(defaultSheet);
      Logger.log('Default sheet deleted');
    }
    
    // Create all template sheets
    Logger.log('Creating template sheets...');
    createOrdersSheet(newSpreadsheet);
    Logger.log('Orders sheet created');
    createProductsSheet(newSpreadsheet);
    Logger.log('Products sheet created');
    createCustomersSheet(newSpreadsheet);
    Logger.log('Customers sheet created');
    createAnalyticsSheet(newSpreadsheet);
    Logger.log('Analytics sheet created');
    createInventorySheet(newSpreadsheet);
    Logger.log('Inventory sheet created');
    createAppointmentsSheet(newSpreadsheet);
    Logger.log('Appointments sheet created');
    
    // Set the first sheet as active
    const firstSheet = newSpreadsheet.getSheets()[0];
    if (firstSheet) {
      Logger.log('Setting active sheet: ' + firstSheet.getName());
      newSpreadsheet.setActiveSheet(firstSheet);
    }
    
    // Share with the user's email (if provided)
    if (leadData.email) {
      Logger.log('Sharing spreadsheet with user email: ' + leadData.email);
      try {
        newSpreadsheet.addEditor(leadData.email);
        Logger.log('Spreadsheet shared successfully with ' + leadData.email);
      } catch (e) {
        Logger.log('ERROR sharing spreadsheet: ' + e.toString());
        console.error('Error sharing spreadsheet:', e);
      }
    } else {
      Logger.log('No email provided, skipping sharing');
    }
    
    Logger.log('=== createTemplateSpreadsheet() completed successfully ===');
    return spreadsheetId;
  } catch (error) {
    Logger.log('=== ERROR in createTemplateSpreadsheet() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    console.error('Error creating template spreadsheet:', error);
    return null;
  }
}

/**
 * Create Orders sheet
 */
function createOrdersSheet(spreadsheet) {
  Logger.log('=== createOrdersSheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('ออเดอร์');
  Logger.log('Orders sheet created: ' + sheet.getName());
  const headers = ['วันที่', 'เวลา', 'เลขที่ออเดอร์', 'รหัสลูกค้า', 'ชื่อลูกค้า', 'รายการ', 'จำนวน', 'ราคาต่อหน่วย', 'ยอดรวม', 'ส่วนลด', 'ยอดสุทธิ', 'สถานะ', 'ช่องทางการขาย', 'หมายเหตุ'];
  const sampleData = [
    ['2024-01-15', '10:15', 'ORD-001', 'C001', 'คุณโบ', 'อาบน้ำ+ตัดขน', '1', '890', '890', '0', '890', 'เสร็จแล้ว', 'หน้าร้าน', ''],
    ['2024-01-15', '11:40', 'ORD-002', 'C002', 'คุณแป้ง', 'อาหารเม็ด 3 กก.', '1', '1250', '1250', '50', '1200', 'จัดส่ง', 'ออนไลน์', 'ส่งด่วน'],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Products sheet
 */
function createProductsSheet(spreadsheet) {
  Logger.log('=== createProductsSheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('สินค้า/บริการ');
  Logger.log('Products sheet created: ' + sheet.getName());
  const headers = ['รหัสสินค้า', 'ชื่อสินค้า/บริการ', 'ประเภท', 'หมวดหมู่', 'ราคาขาย', 'ต้นทุน', 'กำไรต่อหน่วย', 'กำไร%', 'สต็อกปัจจุบัน', 'สต็อกขั้นต่ำ', 'หน่วย', 'ผู้จำหน่าย', 'สถานะ', 'วันที่เพิ่ม'];
  const sampleData = [
    ['P001', 'อาบน้ำสุนัข', 'บริการ', 'บริการดูแล', '300', '100', '200', '66.7%', '-', '-', 'ครั้ง', '-', 'เปิดใช้งาน', '2024-01-01'],
    ['P002', 'อาหารเม็ดสุนัข 1 กก.', 'สินค้า', 'อาหารสัตว์', '450', '280', '170', '37.8%', '15', '5', 'ถุง', 'ABC Pet Supply', 'เปิดใช้งาน', '2024-01-01'],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Customers sheet
 */
function createCustomersSheet(spreadsheet) {
  Logger.log('=== createCustomersSheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('ลูกค้า');
  Logger.log('Customers sheet created: ' + sheet.getName());
  const headers = ['รหัสลูกค้า', 'ชื่อ-นามสกุล', 'เบอร์โทร', 'อีเมล', 'LINE ID', 'ที่อยู่', 'ประเภท', 'วันที่สมัคร', 'คะแนนสะสม', 'ยอดซื้อรวม', 'จำนวนออเดอร์', 'ออเดอร์ล่าสุด', 'สถานะ', 'หมายเหตุ'];
  const sampleData = [
    ['C001', 'คุณโบ', '081-234-5678', 'bo@email.com', '@bo123', 'กรุงเทพฯ', 'สมาชิก', '2024-01-01', '250', '3240', '5', '2024-01-15', 'ใช้งาน', 'ลูกค้าประจำ'],
    ['C002', 'คุณแป้ง', '082-345-6789', 'paeng@email.com', '-', 'นนทบุรี', 'ทั่วไป', '2024-01-10', '0', '1200', '1', '2024-01-15', 'ใช้งาน', ''],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Analytics sheet
 */
function createAnalyticsSheet(spreadsheet) {
  Logger.log('=== createAnalyticsSheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('วิเคราะห์');
  Logger.log('Analytics sheet created: ' + sheet.getName());
  const headers = ['วันที่', 'ยอดขายรวม', 'จำนวนออเดอร์', 'ลูกค้าใหม่', 'ลูกค้าเก่า', 'ออเดอร์หน้าร้าน', 'ออเดอร์ออนไลน์', 'กำไรรวม', 'ค่าใช้จ่าย', 'กำไรสุทธิ', 'อัตรากำไร%', 'ยอดขายเฉลี่ย/ออเดอร์'];
  const sampleData = [
    ['2024-01-15', '12450', '24', '5', '19', '15', '9', '4980', '1200', '3780', '30.3%', '518.75'],
    ['2024-01-14', '10500', '20', '3', '17', '12', '8', '4200', '1100', '3100', '29.5%', '525.00'],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Inventory sheet
 */
function createInventorySheet(spreadsheet) {
  Logger.log('=== createInventorySheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('สต็อก');
  Logger.log('Inventory sheet created: ' + sheet.getName());
  const headers = ['รหัสสินค้า', 'ชื่อสินค้า', 'สต็อกปัจจุบัน', 'สต็อกขั้นต่ำ', 'สต็อกสูงสุด', 'หน่วย', 'สถานะ', 'แจ้งเตือน', 'มูลค่าสต็อก', 'ยอดขาย 30 วัน', 'หมวดหมู่'];
  const sampleData = [
    ['P002', 'อาหารเม็ดสุนัข 1 กก.', '15', '5', '50', 'ถุง', 'ปกติ', 'ไม่ต้องเติม', '4200', '45', 'อาหารสัตว์'],
    ['P005', 'ขนมสุนัข', '25', '10', '100', 'ถุง', 'ปกติ', 'ไม่ต้องเติม', '3000', '60', 'อาหารสัตว์'],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Appointments sheet
 */
function createAppointmentsSheet(spreadsheet) {
  Logger.log('=== createAppointmentsSheet() called ===');
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  const sheet = spreadsheet.insertSheet('นัดหมาย');
  Logger.log('Appointments sheet created: ' + sheet.getName());
  const headers = ['วันที่', 'เวลา', 'รหัสลูกค้า', 'ชื่อลูกค้า', 'เบอร์โทร', 'บริการ', 'สถานะ', 'พนักงาน', 'หมายเหตุ', 'ยืนยัน', 'ยกเลิก'];
  const sampleData = [
    ['2024-01-16', '10:00', 'C001', 'คุณโบ', '081-234-5678', 'อาบน้ำ+ตัดขน', 'จองแล้ว', 'พี่แอน', '', '✓', ''],
    ['2024-01-16', '11:30', 'C003', 'คุณฟ้า', '083-456-7890', 'ฝากเลี้ยง', 'จองแล้ว', 'พี่มิ้ง', '2 วัน', '✓', ''],
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  formatSheetHeader(sheet, 1, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Format sheet header row
 */
function formatSheetHeader(sheet, row, numColumns) {
  Logger.log('=== formatSheetHeader() called ===');
  Logger.log('Sheet: ' + sheet.getName() + ', Row: ' + row + ', Columns: ' + numColumns);
  const range = sheet.getRange(row, 1, 1, numColumns);
  Logger.log('Setting font weight to bold');
  range.setFontWeight('bold');
  Logger.log('Setting background color: #8b7355');
  range.setBackground('#8b7355');
  Logger.log('Setting font color: #ffffff');
  range.setFontColor('#ffffff');
  Logger.log('Setting horizontal alignment to center');
  range.setHorizontalAlignment('center');
  Logger.log('=== formatSheetHeader() completed ===');
}

/**
 * Send email notification
 */
function sendEmailNotification(data, templateSpreadsheetId) {
  Logger.log('=== sendEmailNotification() called ===');
  Logger.log('Recipient: ' + NOTIFICATION_EMAIL);
  Logger.log('Business name: ' + (data.businessName || 'Unknown'));
  Logger.log('Template spreadsheet ID: ' + (templateSpreadsheetId || 'null'));
  
  try {
    const subject = '🎉 New Lead Submitted - ' + (data.businessName || 'Unknown Business');
    Logger.log('Email subject: ' + subject);
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b7355;">New Lead Submitted</h2>
        <p>You have received a new lead from your demo website:</p>
        
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
          <strong>View Lead in Google Sheets:</strong><br>
          <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit" 
             style="color: #689f38; text-decoration: none;">
            Open Leads Spreadsheet
          </a>
        </p>
        ${templateSpreadsheetId ? `
        <p style="margin-top: 20px; color: #8b7355;">
          <strong>📊 Template Spreadsheet Created for User:</strong><br>
          <a href="https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit" 
             style="color: #689f38; text-decoration: none; font-size: 16px; font-weight: bold;">
            Open User's Template Spreadsheet
          </a>
        </p>
        ` : ''}
      </div>
    `;
    
    const plainBody = `
New Lead Submitted

Business Name: ${data.businessName || 'N/A'}
Business Type: ${data.businessType || 'N/A'}
Contact Name: ${data.contactName || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}
LINE ID: ${data.lineId || 'N/A'}
Submitted: ${new Date(data.timestamp).toLocaleString('th-TH') || 'N/A'}

View Lead in Google Sheets: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit
${templateSpreadsheetId ? `
Template Spreadsheet Created for User: https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit
` : ''}
    `;
    
    Logger.log('Sending email to: ' + NOTIFICATION_EMAIL);
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    Logger.log('Email sent successfully');
    Logger.log('=== sendEmailNotification() completed successfully ===');
    
  } catch (error) {
    Logger.log('=== ERROR in sendEmailNotification() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    console.error('Error sending email:', error);
    // Don't fail the whole request if email fails
  }
}

/**
 * Send template spreadsheet link to user
 */
function sendTemplateEmailToUser(leadData, templateSpreadsheetId) {
  Logger.log('=== sendTemplateEmailToUser() called ===');
  Logger.log('Recipient: ' + (leadData.email || 'N/A'));
  Logger.log('Template spreadsheet ID: ' + templateSpreadsheetId);
  Logger.log('Contact name: ' + (leadData.contactName || 'N/A'));
  
  try {
    const subject = '📊 Template Google Sheets ของคุณพร้อมใช้งานแล้ว!';
    Logger.log('Email subject: ' + subject);
    
    const businessTypeNames = {
      'pet': 'Pet Shop',
      'food': 'ร้านอาหาร',
      'salon': 'ร้านเสริมสวย',
      'retail': 'ร้านค้าปลีก',
      'service': 'บริการ',
      'other': 'อื่นๆ'
    };
    
    const businessTypeName = businessTypeNames[leadData.businessType] || leadData.businessType || 'ธุรกิจของคุณ';
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f3; padding: 20px;">
        <h2 style="color: #8b7355;">สวัสดีค่ะ ${leadData.contactName || 'คุณลูกค้า'}</h2>
        
        <p>ขอบคุณที่สนใจระบบ AI Smart Backoffice สำหรับ${businessTypeName} ของเรา!</p>
        
        <p>เราได้สร้าง <strong>Template Google Sheets</strong> พร้อมใช้งานสำหรับคุณแล้ว ซึ่งประกอบด้วย:</p>
        
        <ul style="line-height: 1.8; color: #5d4037;">
          <li>📋 <strong>ออเดอร์</strong> - บันทึกข้อมูลการขายทั้งหมด</li>
          <li>🛍️ <strong>สินค้า/บริการ</strong> - จัดการรายการสินค้าและบริการ</li>
          <li>👥 <strong>ลูกค้า</strong> - ฐานข้อมูลลูกค้า</li>
          <li>📊 <strong>วิเคราะห์</strong> - สรุปยอดขายและกำไร</li>
          <li>📦 <strong>สต็อก</strong> - จัดการสินค้าคงคลัง</li>
          <li>📅 <strong>นัดหมาย</strong> - จัดการคิวและนัดหมาย</li>
        </ul>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #8b7355;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #5d4037;">🔗 เปิด Template ของคุณ:</p>
          <a href="https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8b7355, #6b5d4f); color: #faf8f3; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            เปิด Google Sheets Template
          </a>
        </div>
        
        <h3 style="color: #8b7355; margin-top: 30px;">ขั้นตอนต่อไป:</h3>
        <ol style="line-height: 1.8; color: #5d4037;">
          <li>เปิด Template Google Sheets ที่ลิงก์ด้านบน</li>
          <li>แก้ไขข้อมูลตัวอย่างให้เป็นข้อมูลจริงของธุรกิจคุณ</li>
          <li>เมื่อพร้อมใช้งานจริง เราจะช่วยเชื่อมต่อกับระบบ AI และ LINE OA</li>
        </ol>
        
        <p style="margin-top: 30px; color: #8b7355;">
          <strong>คำถามหรือต้องการความช่วยเหลือ?</strong><br>
          ตอบกลับอีเมลนี้หรือติดต่อเราได้ที่: <a href="mailto:${NOTIFICATION_EMAIL}" style="color: #689f38;">${NOTIFICATION_EMAIL}</a>
        </p>
        
        <p style="margin-top: 20px; color: #8b7355; font-size: 12px;">
          ขอบคุณที่ให้ความสนใจในบริการของเรา<br>
          ทีม AI Smart Backoffice
        </p>
      </div>
    `;
    
    const plainBody = `
สวัสดีค่ะ ${leadData.contactName || 'คุณลูกค้า'}

ขอบคุณที่สนใจระบบ AI Smart Backoffice สำหรับ${businessTypeName} ของเรา!

เราได้สร้าง Template Google Sheets พร้อมใช้งานสำหรับคุณแล้ว ซึ่งประกอบด้วย:
- ออเดอร์ - บันทึกข้อมูลการขายทั้งหมด
- สินค้า/บริการ - จัดการรายการสินค้าและบริการ
- ลูกค้า - ฐานข้อมูลลูกค้า
- วิเคราะห์ - สรุปยอดขายและกำไร
- สต็อก - จัดการสินค้าคงคลัง
- นัดหมาย - จัดการคิวและนัดหมาย

เปิด Template ของคุณ:
https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit

ขั้นตอนต่อไป:
1. เปิด Template Google Sheets ที่ลิงก์ด้านบน
2. แก้ไขข้อมูลตัวอย่างให้เป็นข้อมูลจริงของธุรกิจคุณ
3. เมื่อพร้อมใช้งานจริง เราจะช่วยเชื่อมต่อกับระบบ AI และ LINE OA

คำถามหรือต้องการความช่วยเหลือ?
ตอบกลับอีเมลนี้หรือติดต่อเราได้ที่: ${NOTIFICATION_EMAIL}

ขอบคุณที่ให้ความสนใจในบริการของเรา
ทีม AI Smart Backoffice
    `;
    
    Logger.log('Sending email to user: ' + leadData.email);
    MailApp.sendEmail({
      to: leadData.email,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    Logger.log('User email sent successfully');
    Logger.log('=== sendTemplateEmailToUser() completed successfully ===');
    
  } catch (error) {
    Logger.log('=== ERROR in sendTemplateEmailToUser() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    console.error('Error sending template email to user:', error);
    // Don't fail the whole request if email fails
  }
}

/**
 * Send package order notification to admin
 */
function sendPackageOrderNotification(data) {
  Logger.log('=== sendPackageOrderNotification() called ===');
  Logger.log('Package: ' + (data.package || 'N/A'));
  Logger.log('Customer: ' + (data.contactName || 'N/A'));
  Logger.log('Email: ' + (data.email || 'N/A'));
  
  try {
    const packageNames = {
      'basic': '🥉 BASIC - ระบบพื้นฐาน 1 ระบบ',
      'standard': '🥈 STANDARD - ระบบ 2–3 ระบบรวมกัน',
      'premium': '🥇 PREMIUM - ระบบครบวงจรสำหรับร้านค้า SME'
    };
    
    const packageName = data.packageName || packageNames[data.package] || data.package || 'Unknown Package';
    const packagePrice = data.packagePrice || 'N/A';
    const verifiedAmount = data.verifiedAmount || 'N/A';
    const paymentStatus = data.paymentStatus || 'Pending';
    const requirements = data.requirements || 'N/A';
    const additionalInfo = data.additionalInfo || 'N/A';
    
    const subject = '📦 New Package Order - ' + packageName;
    Logger.log('Email subject: ' + subject);
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b7355;">New Package Order Received</h2>
        <p>You have received a new package order:</p>
        
        <div style="background: #f5f1e8; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #5d4037; margin-top: 0;">Package Details</h3>
          <p style="font-size: 18px; font-weight: bold; color: #8b7355;">${packageName}</p>
          <p style="font-size: 24px; font-weight: bold; color: #689f38;">Price: ${packagePrice.toLocaleString()} ฿</p>
          <p style="font-size: 16px; color: #5d4037; margin-top: 8px;">
            <strong>Payment Status:</strong> ${paymentStatus}<br>
            <strong>Verified Amount:</strong> ${verifiedAmount.toLocaleString()} ฿
          </p>
        </div>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #689f38;">
          <h4 style="color: #5d4037; margin-top: 0;">Customer Requirements:</h4>
          <p style="color: #2e7d32; white-space: pre-wrap;">${requirements}</p>
          ${additionalInfo && additionalInfo !== 'N/A' ? `
          <h4 style="color: #5d4037; margin-top: 16px;">Additional Info:</h4>
          <p style="color: #2e7d32; white-space: pre-wrap;">${additionalInfo}</p>
          ` : ''}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold; width: 150px;">Business Name:</td>
            <td style="padding: 10px;">${data.businessName || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Contact Name:</td>
            <td style="padding: 10px;">${data.contactName || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;"><a href="mailto:${data.email || ''}">${data.email || 'N/A'}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Phone:</td>
            <td style="padding: 10px;">${data.phone || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f5f1e8;">
            <td style="padding: 10px; font-weight: bold;">LINE ID:</td>
            <td style="padding: 10px;">${data.lineId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Submitted:</td>
            <td style="padding: 10px;">${new Date(data.timestamp).toLocaleString('th-TH') || 'N/A'}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px; color: #8b7355;">
          <strong>View Order in Google Sheets:</strong><br>
          <a href="https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit" 
             style="color: #689f38; text-decoration: none;">
            Open Leads Spreadsheet
          </a>
        </p>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f57c00;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Action Required:</strong> Please contact the customer to confirm payment and proceed with the package setup.
          </p>
        </div>
      </div>
    `;
    
    const plainBody = `
New Package Order Received

Package: ${packageName}
Price: ${packagePrice.toLocaleString()} ฿
Payment Status: ${paymentStatus}
Verified Amount: ${verifiedAmount.toLocaleString()} ฿

Customer Requirements:
${requirements}

${additionalInfo && additionalInfo !== 'N/A' ? `Additional Info:\n${additionalInfo}\n\n` : ''}
Customer Details:
Business Name: ${data.businessName || 'N/A'}
Contact Name: ${data.contactName || 'N/A'}
Email: ${data.email || 'N/A'}
Phone: ${data.phone || 'N/A'}
LINE ID: ${data.lineId || 'N/A'}
Submitted: ${new Date(data.timestamp).toLocaleString('th-TH') || 'N/A'}

View Order in Google Sheets: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit

Action Required: Please contact the customer to confirm payment and proceed with the package setup.
    `;
    
    Logger.log('Sending package order notification email to: ' + NOTIFICATION_EMAIL);
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    Logger.log('Package order notification email sent successfully');
    Logger.log('=== sendPackageOrderNotification() completed successfully ===');
    
  } catch (error) {
    Logger.log('=== ERROR in sendPackageOrderNotification() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    console.error('Error sending package order notification:', error);
    // Don't fail the whole request if email fails
  }
}

/**
 * Send package confirmation email to customer
 */
function sendPackageConfirmationEmail(data) {
  Logger.log('=== sendPackageConfirmationEmail() called ===');
  Logger.log('Recipient: ' + (data.email || 'N/A'));
  Logger.log('Package: ' + (data.package || 'N/A'));
  
  try {
    const packageNames = {
      'basic': '🥉 BASIC - ระบบพื้นฐาน 1 ระบบ',
      'standard': '🥈 STANDARD - ระบบ 2–3 ระบบรวมกัน',
      'premium': '🥇 PREMIUM - ระบบครบวงจรสำหรับร้านค้า SME'
    };
    
    const packageName = data.packageName || packageNames[data.package] || data.package || 'Unknown Package';
    const packagePrice = data.packagePrice || 'N/A';
    const verifiedAmount = data.verifiedAmount || packagePrice;
    
    const subject = '📦 ยืนยันการสั่งซื้อแพ็กเกจ - ' + packageName;
    Logger.log('Email subject: ' + subject);
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf8f3; padding: 20px;">
        <h2 style="color: #8b7355;">สวัสดีค่ะ ${data.contactName || 'คุณลูกค้า'}</h2>
        
        <p>ขอบคุณสำหรับการสั่งซื้อแพ็กเกจบริการของเรา!</p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #8b7355;">
          <h3 style="color: #5d4037; margin-top: 0;">รายละเอียดการสั่งซื้อ</h3>
          <p style="font-size: 18px; font-weight: bold; color: #8b7355; margin-bottom: 8px;">${packageName}</p>
          <p style="font-size: 24px; font-weight: bold; color: #689f38; margin: 0;">ราคา: ${packagePrice.toLocaleString()} ฿</p>
          <p style="font-size: 14px; color: #689f38; margin-top: 8px;">✓ ยืนยันการชำระเงิน: ${verifiedAmount.toLocaleString()} ฿</p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f57c00;">
          <p style="margin: 0; color: #856404;">
            <strong>📋 ขั้นตอนต่อไป:</strong><br>
            1. เราได้รับข้อมูลการสั่งซื้อของคุณแล้ว<br>
            2. ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง<br>
            3. หลังจากยืนยันการชำระเงินแล้ว จะเริ่มดำเนินการตั้งค่าระบบให้คุณ
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #5d4037;">
            <strong>📞 ติดต่อสอบถาม:</strong><br>
            อีเมล: <a href="mailto:${NOTIFICATION_EMAIL}" style="color: #689f38;">${NOTIFICATION_EMAIL}</a>
          </p>
        </div>
        
        <p style="margin-top: 20px; color: #8b7355; font-size: 12px;">
          ขอบคุณที่ให้ความสนใจในบริการของเรา<br>
          ทีม AI Smart Backoffice
        </p>
      </div>
    `;
    
    const plainBody = `
สวัสดีค่ะ ${data.contactName || 'คุณลูกค้า'}

ขอบคุณสำหรับการสั่งซื้อแพ็กเกจบริการของเรา!

รายละเอียดการสั่งซื้อ:
${packageName}
ราคา: ${packagePrice.toLocaleString()} ฿

ขั้นตอนต่อไป:
1. เราได้รับข้อมูลการสั่งซื้อของคุณแล้ว
2. ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง
3. หลังจากยืนยันการชำระเงินแล้ว จะเริ่มดำเนินการตั้งค่าระบบให้คุณ

ติดต่อสอบถาม:
อีเมล: ${NOTIFICATION_EMAIL}

ขอบคุณที่ให้ความสนใจในบริการของเรา
ทีม AI Smart Backoffice
    `;
    
    Logger.log('Sending package confirmation email to: ' + data.email);
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    Logger.log('Package confirmation email sent successfully');
    Logger.log('=== sendPackageConfirmationEmail() completed successfully ===');
    
  } catch (error) {
    Logger.log('=== ERROR in sendPackageConfirmationEmail() ===');
    Logger.log('Error message: ' + error.toString());
    Logger.log('Error stack: ' + (error.stack || 'No stack trace'));
    console.error('Error sending package confirmation email:', error);
    // Don't fail the whole request if email fails
  }
}

