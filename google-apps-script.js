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

/**
 * Handle POST request from the form
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
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
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
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 8).setBackground('#8b7355');
      sheet.getRange(1, 1, 1, 8).setFontColor('#ffffff');
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
    
    // Create template spreadsheet for the user
    const templateSpreadsheetId = createTemplateSpreadsheet(data);
    
    // Send email notification with template link
    sendEmailNotification(data, templateSpreadsheetId);
    
    // Send template link to user
    if (templateSpreadsheetId && data.email) {
      sendTemplateEmailToUser(data, templateSpreadsheetId);
    }
    
    // Return success response with template link
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Lead saved successfully',
        row: nextRow,
        templateSpreadsheetId: templateSpreadsheetId,
        templateUrl: `https://docs.google.com/spreadsheets/d/${templateSpreadsheetId}/edit`
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response with CORS headers
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
 * Handle GET request (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Lead Collection API is running',
      status: 'OK'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create template spreadsheet for the user
 */
function createTemplateSpreadsheet(leadData) {
  try {
    // Create a new spreadsheet
    const spreadsheetName = `Template - ${leadData.businessName || 'Demo'} - ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd')}`;
    const newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    const spreadsheetId = newSpreadsheet.getId();
    
    // Delete default sheet
    const defaultSheet = newSpreadsheet.getSheets()[0];
    if (defaultSheet) {
      newSpreadsheet.deleteSheet(defaultSheet);
    }
    
    // Create all template sheets
    createOrdersSheet(newSpreadsheet);
    createProductsSheet(newSpreadsheet);
    createCustomersSheet(newSpreadsheet);
    createAnalyticsSheet(newSpreadsheet);
    createInventorySheet(newSpreadsheet);
    createAppointmentsSheet(newSpreadsheet);
    
    // Set the first sheet as active
    const firstSheet = newSpreadsheet.getSheets()[0];
    if (firstSheet) {
      newSpreadsheet.setActiveSheet(firstSheet);
    }
    
    // Share with the user's email (if provided)
    if (leadData.email) {
      try {
        newSpreadsheet.addEditor(leadData.email);
      } catch (e) {
        console.error('Error sharing spreadsheet:', e);
      }
    }
    
    return spreadsheetId;
  } catch (error) {
    console.error('Error creating template spreadsheet:', error);
    return null;
  }
}

/**
 * Create Orders sheet
 */
function createOrdersSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('ออเดอร์');
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
  const sheet = spreadsheet.insertSheet('สินค้า/บริการ');
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
  const sheet = spreadsheet.insertSheet('ลูกค้า');
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
  const sheet = spreadsheet.insertSheet('วิเคราะห์');
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
  const sheet = spreadsheet.insertSheet('สต็อก');
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
  const sheet = spreadsheet.insertSheet('นัดหมาย');
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
  const range = sheet.getRange(row, 1, 1, numColumns);
  range.setFontWeight('bold');
  range.setBackground('#8b7355');
  range.setFontColor('#ffffff');
  range.setHorizontalAlignment('center');
}

/**
 * Send email notification
 */
function sendEmailNotification(data, templateSpreadsheetId) {
  try {
    const subject = '🎉 New Lead Submitted - ' + (data.businessName || 'Unknown Business');
    
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

/**
 * Send template spreadsheet link to user
 */
function sendTemplateEmailToUser(leadData, templateSpreadsheetId) {
  try {
    const subject = '📊 Template Google Sheets ของคุณพร้อมใช้งานแล้ว!';
    
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
    
    MailApp.sendEmail({
      to: leadData.email,
      subject: subject,
      htmlBody: htmlBody,
      body: plainBody
    });
    
  } catch (error) {
    console.error('Error sending template email to user:', error);
    // Don't fail the whole request if email fails
  }
}

