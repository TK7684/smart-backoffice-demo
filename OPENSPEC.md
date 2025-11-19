# Open Specification - AI Smart Backoffice Demo

**Version**: 1.2.0  
**Last Updated**: 2024-01-15  
**Purpose**: This specification ensures all code changes and development efforts remain aligned with the program's main objectives.

**Current Implementation Status**: 
- ✅ Demo System: Fully implemented and operational
- ⚠️ Production Scaling: Specified but not yet implemented in code
- 📋 See [Implementation Status](#implementation-status) section for details

---

## Table of Contents

1. [Core Objectives](#core-objectives)
2. [Architecture Principles](#architecture-principles)
3. [Scaling Strategy](#scaling-strategy)
4. [Functional Requirements](#functional-requirements)
5. [Technical Constraints](#technical-constraints)
6. [Success Criteria](#success-criteria)
7. [Development Guidelines](#development-guidelines)
8. [Implementation Status](#implementation-status)
9. [Alignment Checklist](#alignment-checklist)
10. [Change Management](#change-management)

---

## Core Objectives

### Primary Mission
**Enable small businesses (Pet Shops, Restaurants, Salons) to manage operations using Google Sheets as a database with AI assistance through an automated lead-to-template pipeline.**

### Core Objectives (Must Always Be Maintained)

#### 1. Lead Collection & Management
- ✅ **MUST** capture complete business information from interested users
- ✅ **MUST** store all leads in Google Sheets for admin tracking
- ✅ **MUST** validate all form inputs before submission
- ✅ **MUST** provide clear user feedback on submission status

#### 2. Automated Template Generation
- ✅ **MUST** automatically create Google Sheets templates for each lead
- ✅ **MUST** include all 6 required sheets: ออเดอร์, สินค้า/บริการ, ลูกค้า, วิเคราะห์, สต็อก, นัดหมาย
- ✅ **MUST** populate templates with proper headers and sample data
- ✅ **MUST** format templates with consistent styling (earth tone colors)
- ✅ **MUST** share templates with user's email address

#### 3. Communication & Notifications
- ✅ **MUST** send email notification to admin (tripetkk@gmail.com) for each lead
- ✅ **MUST** send email to user with template link and instructions
- ✅ **MUST** include all relevant lead information in notifications
- ✅ **MUST** provide clear next steps in user emails

#### 4. Demo Experience
- ✅ **MUST** display interactive demo dashboard for 3 business types (pet, food, salon)
- ✅ **MUST** show mock data that demonstrates system capabilities
- ✅ **MUST** include chart visualization using Chart.js
- ✅ **MUST** provide AI chat demo simulation
- ✅ **MUST** maintain earth tone color scheme (#f5f1e8, #8b7355, #689f38)

#### 5. User Experience
- ✅ **MUST** be accessible and easy to use for non-technical users
- ✅ **MUST** provide clear instructions and guidance
- ✅ **MUST** work on mobile and desktop devices
- ✅ **MUST** handle errors gracefully with user-friendly messages

---

## Architecture Principles

### 1. Simplicity First
- **Principle**: Keep the system simple and maintainable
- **Rule**: Prefer vanilla JavaScript over complex frameworks
- **Rule**: Use single-file structure where possible (index.html)
- **Rule**: Avoid unnecessary dependencies

### 2. Google Sheets as Database (Distributed Model)
- **Principle**: Google Sheets is the primary data storage using distributed architecture
- **Rule**: All lead data MUST be stored in Google Sheets
- **Rule**: Templates MUST be created as Google Spreadsheets
- **Rule**: **1 Customer = 1 Google Sheet** (distributed, not centralized)
- **Rule**: Each customer has their own isolated Google Sheet database
- **Rule**: No external databases should be introduced
- **Rule**: Master Admin Sheet tracks all customers (CRM)

### 3. Serverless Backend (Container-Bound Scripts)
- **Principle**: Use Google Apps Script for all backend operations
- **Rule**: Each customer's Google Sheet contains its own container-bound script
- **Rule**: Script is embedded directly in customer's Sheet (not standalone)
- **Rule**: Deploy as Web App with "Execute as: Me" and "Anyone" access
- **Rule**: Each customer has unique Web App URL pointing to their Sheet
- **Rule**: No traditional server infrastructure required
- **Rule**: Frontend logic should be maximized; backend should be minimal (receive -> save)

### 4. Zero-Cost Infrastructure
- **Principle**: Use free tier services where possible
- **Rule**: Frontend hosted on free static hosting (Cloudflare Pages, GitHub Pages)
- **Rule**: Backend uses Google Apps Script (free tier)
- **Rule**: Storage uses Google Sheets (free tier)

### 5. Separation of Concerns
- **Principle**: Clear separation between frontend and backend
- **Rule**: Frontend (index.html) handles UI, user interactions, and business logic
- **Rule**: Backend (google-apps-script.js) handles minimal operations: receive data -> save to Sheet
- **Rule**: Communication via REST API (POST/GET requests)
- **Rule**: **Maximize frontend logic, minimize backend logic** for easier updates across all customers

### 6. Multi-Tenant Architecture (1 Frontend, N Backends)
- **Principle**: Single frontend deployment serves multiple customers
- **Rule**: Frontend MUST support dynamic API endpoint via URL parameter
- **Rule**: Each customer receives unique link: `myapp.com?api=CUSTOMER_SCRIPT_URL`
- **Rule**: Frontend reads `api` parameter from URL to determine which Sheet to connect to
- **Rule**: One Cloudflare Pages deployment serves all customers
- **Rule**: No hardcoded API URLs in frontend code

---

## Scaling Strategy

### Overview: From Demo to Production

**Concept**: Transform from centralized demo system to distributed production system while maintaining zero-cost infrastructure.

**Architecture Model**: **"1 Customer = 1 Google Sheet, but 1 Frontend"**

### Phase 1: Demo System (Current)
- Single Google Sheet for all leads
- Single Google Apps Script Web App
- Single frontend deployment
- Purpose: Lead collection and template generation

### Phase 2: Production System (Scaled)
- **Frontend**: Single Cloudflare Pages deployment (shared by all customers)
- **Backend**: Each customer has their own Google Sheet with embedded script
- **Database**: Each customer's data isolated in their own Sheet
- **Purpose**: Full operational system for paying customers

### Key Principles for Scaling

#### 1. Distributed Database Architecture
- ✅ Each customer gets their own Google Sheet
- ✅ Data is completely isolated between customers
- ✅ No shared database that could cause conflicts
- ✅ Customer owns their data (Sheet is shared with them)

#### 2. Dynamic API Endpoint
- ✅ Frontend MUST read API URL from URL parameter: `?api=SCRIPT_URL`
- ✅ No hardcoded API URLs in frontend code
- ✅ Each customer receives unique link with their script URL
- ✅ Allows single frontend deployment to serve unlimited customers

#### 3. Container-Bound Scripts
- ✅ Script is embedded in customer's Google Sheet (not standalone)
- ✅ Each Sheet has its own script instance
- ✅ Script deployment is per-customer, not global
- ✅ Updates to one customer don't affect others

#### 4. Logic Distribution Strategy
- ✅ **Frontend Logic**: Business rules, validation, calculations, UI
  - Reason: Update once, all customers get update immediately
- ✅ **Backend Logic**: Minimal - receive data, save to Sheet, return response
  - Reason: Backend updates require updating each customer's Sheet individually

#### 5. Master Admin Sheet (CRM)
- ✅ Admin maintains one Sheet tracking all customers
- ✅ Columns: Customer Name, Email, Start Date, Sheet URL, Web App URL, Status
- ✅ Used for customer management and support
- ✅ Quick access to any customer's Sheet

### Implementation Workflow

#### For New Customer Onboarding (Managed Service Model)

1. **Create Customer Sheet**
   - Copy Master Template Sheet
   - Rename to customer's business name (e.g., "PetShop_A_Database")
   - Sheet already contains all 6 required sheets with structure

2. **Embed Script**
   - Copy script from `google-apps-script.js` into customer's Sheet
   - Update configuration (if needed)
   - Script is now container-bound to customer's Sheet

3. **Deploy Web App**
   - Deploy script as Web App from customer's Sheet
   - Execute as: "Me" (admin account)
   - Access: "Anyone"
   - Copy the Web App URL

4. **Share Sheet**
   - Share Sheet with customer's email
   - Grant "Editor" permission
   - Customer can now view and edit their data

5. **Create Customer Link**
   - Format: `myapp.pages.dev?api=CUSTOMER_WEB_APP_URL`
   - Optionally use URL shortener: `myapp.com/customerA`
   - Send link to customer

6. **Update Admin CRM**
   - Add customer entry to Master Admin Sheet
   - Record: Name, Email, Sheet URL, Web App URL, Date

### Scalability Benefits

#### For 10-100 Customers
- ✅ Single frontend deployment (update once, all customers benefit)
- ✅ Each customer isolated (no data conflicts)
- ✅ Easy customer management via Admin Sheet
- ✅ No server costs (all free tier)
- ✅ Customer owns their data (transparency)

#### Maintenance Efficiency
- ✅ Frontend updates: Deploy once, all customers updated
- ✅ Backend updates: Only update if necessary (minimize backend logic)
- ✅ Bug fixes: Fix in frontend, all customers fixed immediately
- ✅ New features: Add to frontend, all customers get feature

### Technical Implementation Details

#### Frontend Changes Required

**Current Implementation** (Demo Mode):
```javascript
// Current: Hardcoded URL (line 1564 in index.html)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/.../exec';
```

**Required Implementation** (Production Mode):
```javascript
// MUST: Read API URL from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const scriptUrl = urlParams.get('api') || 'DEFAULT_DEMO_URL';

// Use scriptUrl for all API calls
fetch(scriptUrl, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**Migration Path**:
1. Replace hardcoded `GOOGLE_SCRIPT_URL` with dynamic URL reading
2. Keep fallback to current demo URL if no parameter provided
3. Test with multiple different API URLs
4. Update all fetch calls to use dynamic `scriptUrl`

#### Backend Script Requirements

- ✅ MUST be container-bound (embedded in Sheet)
- ✅ MUST handle POST requests for data submission
- ✅ MUST handle GET requests for health checks
- ✅ MUST save data to the Sheet it's bound to
- ✅ MUST return JSON responses
- ✅ MUST handle errors gracefully

#### Admin Sheet Structure

| Customer Name | Email | Start Date | Sheet URL | Web App URL | Status | Notes |
|--------------|-------|------------|-----------|-------------|--------|-------|
| PetShop A | ... | ... | ... | ... | Active | ... |

---

## Implementation Status

### Current State (Version 1.2.0)

#### ✅ Fully Implemented (Demo System)

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Lead Collection Form | ✅ Complete | `index.html` lines 1567-1659 | All fields validated, working |
| Google Sheets Integration | ✅ Complete | `google-apps-script.js` | Saves to "Leads" sheet |
| Template Generation | ✅ Complete | `google-apps-script.js` | Creates 6 sheets with data |
| Email Notifications | ✅ Complete | `google-apps-script.js` | Admin + User emails |
| Demo Dashboard | ✅ Complete | `index.html` | 3 business types, charts |
| Frontend UI | ✅ Complete | `index.html` | Earth tone theme, responsive |

#### ⚠️ Specified but Not Implemented (Production Scaling)

| Feature | Status | Priority | Implementation Required |
|---------|--------|----------|----------------------|
| Dynamic API Endpoint | ✅ **IMPLEMENTED** | CRITICAL | ✅ Completed - reads from `?api=` parameter with demo fallback |
| Container-Bound Scripts | ✅ **IMPLEMENTED** | CRITICAL | ✅ Script created (CONTAINER_BOUND_SCRIPT.js), ready for deployment |
| Customer Isolation | ✅ **DOCUMENTED** | CRITICAL | ✅ Architecture documented, ready for implementation |
| Master Admin Sheet (CRM) | ✅ **DOCUMENTED** | HIGH | ✅ Setup guide created (CUSTOMER_ONBOARDING_GUIDE.md) |
| Multi-Tenant Support | ✅ **READY** | CRITICAL | ✅ Frontend + Backend ready, needs testing |

### Code Locations

**Frontend API Configuration**:
- **File**: `index.html`
- **Line**: 1566-1576
- **Status**: ✅ **IMPLEMENTED**
- **Implementation**: Reads from `?api=` URL parameter, falls back to demo URL
- **Usage**: `myapp.com?api=https://script.google.com/.../exec`

**Backend Script**:
- **File**: `CONTAINER_BOUND_SCRIPT.js` (NEW)
- **Status**: ✅ **CREATED**
- **Implementation**: Container-bound script using `getActiveSpreadsheet()`
- **Usage**: Embed in each customer's Sheet
- **Documentation**: See `CUSTOMER_ONBOARDING_GUIDE.md`

### Migration Checklist

To transition from Demo to Production:

- [x] **Frontend**: Update `index.html` line 1564 to read from URL parameter ✅ **COMPLETED**
- [x] **Frontend**: Add fallback logic for demo URL ✅ **COMPLETED**
- [ ] **Frontend**: Test with multiple API URLs (Ready for testing)
- [x] **Backend**: Create Master Template Sheet with embedded script ✅ **DOCUMENTED**
- [ ] **Backend**: Test container-bound script deployment (Ready for testing)
- [x] **Admin**: Create Master Admin Sheet (CRM) ✅ **DOCUMENTED**
- [x] **Admin**: Document customer onboarding workflow ✅ **COMPLETED** (CUSTOMER_ONBOARDING_GUIDE.md)
- [ ] **Testing**: Test with 2-3 dummy customers
- [ ] **Testing**: Verify data isolation
- [ ] **Documentation**: Update setup instructions

### Implementation Priority

1. **Phase 1** (Critical for Production):
   - Implement dynamic API endpoint in frontend
   - Create Master Template Sheet
   - Test container-bound script deployment

2. **Phase 2** (Customer Management):
   - Create Master Admin Sheet
   - Document onboarding workflow
   - Test complete customer setup

3. **Phase 3** (Optimization):
   - Test with multiple customers
   - Optimize deployment process
   - Create automation tools (if needed)

---

## Functional Requirements

### FR1: Lead Collection Form
**Priority**: CRITICAL  
**Description**: System must collect business information from users

**Requirements**:
- Form fields: Business Name, Business Type, Contact Name, Email, Phone, LINE ID
- All fields except LINE ID are required
- Form validation before submission
- Clear error messages for invalid inputs
- Success confirmation after submission

**Acceptance Criteria**:
- ✅ Form cannot be submitted with missing required fields
- ✅ Email format is validated
- ✅ Phone number format is validated
- ✅ User sees loading state during submission
- ✅ User sees success/error message after submission

### FR2: Lead Storage
**Priority**: CRITICAL  
**Description**: All leads must be stored in Google Sheets

**Requirements**:
- Save to "LeadCollection" sheet in specified spreadsheet
- Include timestamp of submission
- Store all form fields in separate columns
- Handle duplicate submissions gracefully

**Acceptance Criteria**:
- ✅ Every submission creates a new row in Google Sheets
- ✅ All data fields are correctly mapped to columns
- ✅ Timestamp is accurate and in ISO format
- ✅ Admin can view all leads in Google Sheets

### FR3: Template Creation
**Priority**: CRITICAL  
**Description**: Automatically create Google Sheets template for each lead

**Requirements**:
- Create new Google Spreadsheet
- Include 6 sheets with Thai names: ออเดอร์, สินค้า/บริการ, ลูกค้า, วิเคราะห์, สต็อก, นัดหมาย
- Each sheet has proper headers (14 columns for most sheets)
- Include sample data rows
- Format headers with earth tone colors (#8b7355)
- Auto-resize columns
- Share with user's email address

**Acceptance Criteria**:
- ✅ Template is created within 10 seconds of lead submission
- ✅ All 6 sheets are present and correctly named
- ✅ Headers match specification exactly
- ✅ Sample data is relevant to business type
- ✅ User receives edit access via email

### FR4: Email Notifications
**Priority**: CRITICAL  
**Description**: Send emails to both admin and user

**Requirements**:
- Admin email includes: all lead data, timestamp, template link
- User email includes: welcome message, template link, next steps
- Emails are sent in Thai language
- Handle email sending errors gracefully

**Acceptance Criteria**:
- ✅ Admin receives email within 30 seconds of submission
- ✅ User receives email within 30 seconds of submission
- ✅ Both emails contain correct information
- ✅ Template link in emails is clickable and functional

### FR5: Demo Dashboard
**Priority**: HIGH  
**Description**: Interactive demo showing system capabilities

**Requirements**:
- Display metrics for selected business type
- Show sales chart using Chart.js
- Display orders table with sample data
- Show alerts/notifications
- AI chat demo simulation
- Switch between business types (pet, food, salon)

**Acceptance Criteria**:
- ✅ Dashboard updates when business type changes
- ✅ Chart displays correctly with sample data
- ✅ All metrics are visible and formatted properly
- ✅ AI chat responds to user messages (simulated)

### FR6: Template Preview
**Priority**: HIGH  
**Description**: Show template preview after submission

**Requirements**:
- Display template link after successful submission
- Show template structure overview
- Provide instructions for next steps
- Link to template must be functional

**Acceptance Criteria**:
- ✅ Template link is displayed after submission
- ✅ Link opens template in new tab
- ✅ User can access template immediately

### FR7: Dynamic API Endpoint (Multi-Tenant Support)
**Priority**: CRITICAL (for production scaling)  
**Description**: Frontend must support dynamic API endpoint via URL parameter

**Current Status**: ✅ **IMPLEMENTED** - Now reads from URL parameter with fallback

**Requirements**:
- Read `api` parameter from URL: `?api=SCRIPT_URL`
- Use parameter value for all API calls
- Fallback to default demo URL if parameter missing
- Support URL shorteners (bit.ly, etc.)
- No hardcoded API URLs in frontend code

**Implementation Location**:
- **File**: `index.html`
- **Line**: ~1564 (currently hardcoded)
- **Change Required**: Replace `const GOOGLE_SCRIPT_URL = '...'` with dynamic reading

**Acceptance Criteria**:
- ✅ Frontend reads `api` parameter correctly
- ✅ API calls use dynamic URL from parameter
- ✅ Works with full Google Apps Script URLs
- ✅ Works with shortened URLs
- ✅ Falls back to demo URL when parameter missing
- ✅ Multiple customers can use same frontend with different API URLs

**Code Example**:
```javascript
// Replace current hardcoded URL with:
const urlParams = new URLSearchParams(window.location.search);
const GOOGLE_SCRIPT_URL = urlParams.get('api') || 'https://script.google.com/.../exec'; // fallback to demo URL
```

### FR8: Container-Bound Script Architecture
**Priority**: CRITICAL (for production scaling)  
**Description**: Each customer's Sheet must have embedded script

**Current Status**: ⚠️ **NOT IMPLEMENTED** - Script is currently standalone

**Requirements**:
- Script is embedded in customer's Google Sheet (not standalone)
- Script is bound to the Sheet it's deployed from
- Each Sheet has independent script instance
- Script can access its own Sheet directly
- Script deployment is per-customer

**Implementation Steps**:
1. Create Master Template Sheet with all 6 sheets
2. Copy `google-apps-script.js` content into Sheet's script editor
3. Update script to use `SpreadsheetApp.getActiveSpreadsheet()` instead of `SpreadsheetApp.openById()`
4. Deploy from Sheet (not standalone script)
5. Each customer gets their own Sheet with embedded script

**Acceptance Criteria**:
- ✅ Script is container-bound (not standalone)
- ✅ Script can read/write to its own Sheet
- ✅ Each customer has independent script
- ✅ Script deployment doesn't affect other customers
- ✅ Script URL is unique per customer

### FR9: Customer Isolation
**Priority**: CRITICAL (for production scaling)  
**Description**: Each customer's data must be completely isolated

**Requirements**:
- Each customer has their own Google Sheet
- No shared data between customers
- Customer can only access their own Sheet
- Admin can access all Sheets via Master Admin Sheet
- Data privacy maintained

**Acceptance Criteria**:
- ✅ Customer A cannot access Customer B's data
- ✅ Each customer Sheet is independent
- ✅ Customer owns their Sheet (has edit access)
- ✅ Admin can access any customer Sheet via CRM
- ✅ No data leakage between customers

### FR10: Master Admin Sheet (CRM)
**Priority**: HIGH (for customer management)  
**Description**: Admin must have centralized customer management

**Requirements**:
- Single Google Sheet tracking all customers
- Columns: Customer Name, Email, Start Date, Sheet URL, Web App URL, Status
- Quick access to any customer's Sheet
- Easy customer lookup and management
- Support for customer notes and status tracking

**Acceptance Criteria**:
- ✅ Admin Sheet exists and is maintained
- ✅ All customer information is recorded
- ✅ Links to customer Sheets are functional
- ✅ Easy to find and access customer information
- ✅ Supports customer status tracking (Active, Inactive, etc.)

---

## Technical Constraints

### TC1: Technology Stack
**Constraint**: Must use specified technologies only

**Allowed Technologies**:
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Charts: Chart.js 4.4.0 (via CDN)
- Backend: Google Apps Script
- Storage: Google Sheets API
- Email: Gmail API (via Google Apps Script)

**Prohibited**:
- ❌ No JavaScript frameworks (React, Vue, Angular)
- ❌ No build tools or bundlers (Webpack, Vite)
- ❌ No external databases (MySQL, MongoDB, Firebase)
- ❌ No payment processing libraries
- ❌ No authentication frameworks

### TC2: File Structure
**Constraint**: Maintain current file structure

**Required Files**:
- `index.html` - Frontend application (single file)
- `google-apps-script.js` - Backend logic
- Documentation files (MD format)

**Rules**:
- ✅ Keep index.html as single-file application
- ✅ Do not split into multiple HTML/JS files
- ✅ Keep all CSS inline in index.html
- ✅ Keep all JavaScript inline in index.html

### TC3: API Endpoints
**Constraint**: Use only Google Apps Script Web App with dynamic routing

**Rules**:
- ✅ Endpoint: Google Apps Script Web App URL (dynamic via URL parameter)
- ✅ Frontend MUST read API URL from `?api=SCRIPT_URL` parameter
- ✅ POST method for form submissions
- ✅ GET method for health checks
- ✅ Each customer has unique Web App URL
- ❌ No hardcoded API URLs in frontend code
- ❌ No additional API endpoints
- ❌ No third-party API integrations (except Google services)

### TC4: Data Format
**Constraint**: Use JSON for all API communication

**Rules**:
- ✅ Request body: JSON format
- ✅ Response: JSON format
- ✅ All timestamps: ISO 8601 format
- ✅ All text: UTF-8 encoding

### TC5: Color Scheme
**Constraint**: Maintain earth tone color palette

**Required Colors**:
- Background: #f5f1e8 (warm beige)
- Primary: #8b7355 (brown)
- Secondary: #6b5d4f (dark brown)
- Accent: #689f38 (warm green)
- Text: #3e2723, #5d4037 (brown shades)

**Rules**:
- ✅ Use these colors consistently
- ✅ Do not introduce new color schemes
- ✅ Maintain color harmony across all UI elements

### TC6: Language Support
**Constraint**: Primary language is Thai

**Rules**:
- ✅ All user-facing text in Thai
- ✅ All emails in Thai
- ✅ All sheet names in Thai
- ✅ Error messages in Thai
- ✅ Documentation can be in English for developers

---

## Success Criteria

### SC1: Lead Collection Success Rate
**Target**: 100% of valid form submissions are saved to Google Sheets

**Measurement**:
- Count successful submissions in Google Sheets
- Compare with form submission attempts
- Success rate = (Saved leads / Total submissions) × 100%

**Threshold**: ≥ 99%

### SC2: Template Creation Success Rate
**Target**: 100% of leads receive a template

**Measurement**:
- Verify template spreadsheet exists for each lead
- Check that template has all 6 sheets
- Verify template is shared with user email

**Threshold**: ≥ 99%

### SC3: Email Delivery Rate
**Target**: 100% of submissions trigger email notifications

**Measurement**:
- Admin receives email for each submission
- User receives email for each submission
- Check email delivery logs in Google Apps Script

**Threshold**: ≥ 95% (accounting for email service limitations)

### SC4: User Experience
**Target**: Users can complete form submission in < 2 minutes

**Measurement**:
- Time from page load to successful submission
- Form completion rate
- Error rate during submission

**Threshold**: 
- Average completion time: < 2 minutes
- Error rate: < 5%

### SC5: System Availability
**Target**: System is accessible 99% of the time

**Measurement**:
- Frontend page loads successfully
- Google Apps Script responds to requests
- Google Sheets is accessible

**Threshold**: ≥ 99% uptime

### SC6: Code Quality
**Target**: Code remains maintainable and aligned with objectives

**Measurement**:
- Code follows architecture principles
- No violations of technical constraints
- Documentation is up to date

**Threshold**: 100% compliance with this specification

---

## Development Guidelines

### Guideline 1: Before Making Changes
**Checklist**:
1. ✅ Read this specification document
2. ✅ Identify which core objectives are affected
3. ✅ Verify change doesn't violate technical constraints
4. ✅ Check if change requires updating documentation
5. ✅ Test change against success criteria

### Guideline 2: Code Changes
**Rules**:
- ✅ All code changes must maintain core objectives
- ✅ Follow architecture principles
- ✅ Respect technical constraints
- ✅ Update relevant documentation
- ✅ Test thoroughly before deployment

**Prohibited Actions**:
- ❌ Remove or disable core features
- ❌ Change technology stack without justification
- ❌ Break existing functionality
- ❌ Remove error handling
- ❌ Skip validation steps

### Guideline 3: Adding Features
**Process**:
1. Verify feature aligns with core objectives
2. Check if feature violates any constraints
3. Update this specification if needed
4. Implement feature following architecture principles
5. Test against success criteria
6. Update documentation

**Questions to Ask**:
- Does this feature support lead collection?
- Does this improve template generation?
- Does this enhance user experience?
- Does this maintain simplicity?
- Does this require new infrastructure?

### Guideline 4: Bug Fixes
**Process**:
1. Identify root cause
2. Fix without changing core functionality
3. Ensure fix doesn't break other features
4. Test thoroughly
5. Document the fix

**Rules**:
- ✅ Fix bugs that prevent core objectives
- ✅ Maintain existing behavior for working features
- ✅ Don't use bug fixes as excuse to refactor unnecessarily

### Guideline 5: Performance Optimization
**Rules**:
- ✅ Optimize only if it improves user experience
- ✅ Don't optimize at the cost of simplicity
- ✅ Maintain all functionality during optimization
- ✅ Measure before and after

**Allowed Optimizations**:
- Code minification (if needed)
- Image optimization (if images added)
- Caching strategies (if needed)
- Reducing API calls (if possible)

**Prohibited**:
- ❌ Removing features for performance
- ❌ Changing architecture for minor performance gains
- ❌ Adding complexity for optimization

### Guideline 6: Multi-Tenant Development
**Rules for Scaling to Multiple Customers**:

**Frontend Development**:
- ✅ Always use dynamic API endpoint (read from URL parameter)
- ✅ Never hardcode API URLs
- ✅ Maximize business logic in frontend (easier to update)
- ✅ Test with multiple API URLs
- ✅ Ensure frontend works with any valid Google Apps Script URL

**Backend Development**:
- ✅ Minimize backend logic (only receive -> save -> return)
- ✅ Keep scripts container-bound (embedded in Sheet)
- ✅ Ensure scripts are independent (no shared state)
- ✅ Test script in isolation before deploying to customer Sheet

**Customer Onboarding**:
- ✅ Follow standardized workflow (create Sheet -> embed script -> deploy -> share)
- ✅ Update Master Admin Sheet for each customer
- ✅ Test customer link before sending
- ✅ Provide clear instructions to customer

**Maintenance**:
- ✅ Frontend updates: Deploy once, all customers benefit
- ✅ Backend updates: Only if necessary, update each customer Sheet
- ✅ Prefer frontend solutions over backend solutions
- ✅ Document all customer-specific configurations

**Questions to Ask Before Adding Backend Logic**:
- Can this be done in the frontend instead?
- Will this require updating all customer Sheets?
- Is this logic customer-specific or universal?
- Can we avoid this by changing frontend behavior?

---

## Alignment Checklist

Use this checklist before deploying any changes to ensure code remains aligned with objectives:

### Core Objectives Alignment
- [ ] Lead collection functionality is intact
- [ ] Template generation works correctly
- [ ] Email notifications are sent
- [ ] Demo dashboard displays properly
- [ ] User experience is maintained

### Architecture Principles Alignment
- [ ] Code remains simple and maintainable
- [ ] Google Sheets is used as database
- [ ] Google Apps Script handles backend
- [ ] No new infrastructure dependencies
- [ ] Separation of concerns is maintained

### Technical Constraints Compliance
- [ ] Only allowed technologies are used
- [ ] File structure is maintained
- [ ] API endpoints are unchanged
- [ ] Data format is correct
- [ ] Color scheme is preserved
- [ ] Language support is maintained

### Functional Requirements Verification
- [ ] FR1: Lead collection form works
- [ ] FR2: Leads are saved to Google Sheets
- [ ] FR3: Templates are created correctly
- [ ] FR4: Emails are sent successfully
- [ ] FR5: Demo dashboard functions
- [ ] FR6: Template preview displays
- [ ] FR7: Dynamic API endpoint works (if in production mode)
- [ ] FR8: Container-bound scripts function correctly (if in production mode)
- [ ] FR9: Customer isolation is maintained (if in production mode)
- [ ] FR10: Master Admin Sheet is maintained (if in production mode)

### Success Criteria Check
- [ ] Lead collection success rate maintained
- [ ] Template creation success rate maintained
- [ ] Email delivery rate maintained
- [ ] User experience is acceptable
- [ ] System availability is maintained
- [ ] Code quality is preserved

### Documentation Update
- [ ] DEVELOPER_GUIDE.md updated (if needed)
- [ ] SETUP_INSTRUCTIONS.md updated (if needed)
- [ ] USER_DEMO_GUIDE.md updated (if needed)
- [ ] This OPENSPEC.md updated (if needed)

---

## Change Management

### When to Update This Specification

**Update Required When**:
1. Core objectives change (rare, requires approval)
2. New functional requirements are added
3. Technical constraints are modified
4. Architecture principles are updated
5. Success criteria are adjusted

**Update Process**:
1. Document the change reason
2. Update relevant sections
3. Update version number
4. Update "Last Updated" date
5. Notify all developers
6. Archive previous version

### Version History

**Version 1.2.0** (2024-01-15)
- Added Implementation Status section tracking current vs required state
- Updated FR7 and FR8 with current implementation status
- Added code location references for required changes
- Added migration checklist for Demo to Production transition
- Clarified implementation priority phases
- Added code examples for required changes

**Version 1.1.0** (2024-01-15)
- Added Scaling Strategy section
- Updated Architecture Principles for multi-tenant support
- Added Functional Requirements FR7-FR10 for production scaling
- Updated Technical Constraints for dynamic API endpoints
- Added Guideline 6: Multi-Tenant Development
- Documented "1 Customer = 1 Sheet" distributed architecture model
- Added Master Admin Sheet (CRM) requirements

**Version 1.0.0** (2024-01-15)
- Initial specification
- Defined core objectives
- Established architecture principles
- Set functional requirements
- Defined technical constraints
- Created success criteria
- Established development guidelines

---

## Quick Reference

### Core Objectives (TL;DR)
1. Collect leads from users
2. Save leads to Google Sheets
3. Create Google Sheets templates automatically
4. Send email notifications
5. Provide interactive demo experience

### Architecture (TL;DR)
- Frontend: Single HTML file (index.html) - shared by all customers
- Backend: Google Apps Script (container-bound in each customer's Sheet)
- Storage: Google Sheets (1 Sheet per customer, distributed)
- No external dependencies beyond Google services
- Scaling: 1 Frontend, N Backends (1 per customer)

### Critical Rules (TL;DR)
- ✅ Always save leads to Google Sheets
- ✅ Always create templates for leads
- ✅ Always send email notifications
- ✅ Keep code simple (vanilla JS)
- ✅ Use earth tone colors
- ✅ Maintain Thai language support
- ✅ Use dynamic API endpoint (read from URL parameter)
- ✅ 1 Customer = 1 Google Sheet (distributed model)
- ✅ Maximize frontend logic, minimize backend logic

### Red Flags (Stop and Review)
- 🚩 Removing lead collection functionality
- 🚩 Changing from Google Sheets to another database
- 🚩 Removing template generation
- 🚩 Adding complex frameworks
- 🚩 Breaking email notifications
- 🚩 Changing core color scheme
- 🚩 Removing demo dashboard
- 🚩 Hardcoding API URLs in frontend
- 🚩 Using centralized database for multiple customers
- 🚩 Moving business logic to backend unnecessarily
- 🚩 Breaking customer data isolation

---

## Enforcement

### For Developers
- **Before coding**: Read this specification
- **While coding**: Follow guidelines and constraints
- **Before committing**: Complete alignment checklist
- **Before deploying**: Verify success criteria

### For Code Reviews
- Check against alignment checklist
- Verify core objectives are maintained
- Ensure technical constraints are respected
- Confirm documentation is updated

### For Project Management
- Use this specification to guide decisions
- Reference when evaluating feature requests
- Use success criteria to measure progress
- Update specification when objectives change

---

## Contact & Questions

**For Questions About This Specification**:
- Email: tripetkk@gmail.com
- Reference: This document (OPENSPEC.md)

**For Technical Issues**:
- See: DEVELOPER_GUIDE.md
- See: SETUP_INSTRUCTIONS.md

**For User Support**:
- See: USER_DEMO_GUIDE.md

---

**Remember**: This specification exists to keep the project on track. When in doubt, refer back to the Core Objectives. If a change doesn't support the core objectives, question whether it's necessary.

---

**Last Updated**: 2024-01-15  
**Version**: 1.2.0  
**Status**: Active

**Implementation Status Summary**:
- ✅ Demo System: Fully operational
- ⚠️ Production Scaling: Specified, implementation required
- 📋 See Implementation Status section for detailed tracking

---

## Scaling Implementation Checklist

### For Transitioning from Demo to Production

#### Frontend Updates Required
- [x] Add code to read `api` parameter from URL ✅ **COMPLETED**
- [x] Replace hardcoded `GOOGLE_SCRIPT_URL` with dynamic variable ✅ **COMPLETED**
- [ ] Test with multiple different API URLs (Ready for testing)
- [x] Ensure fallback to demo URL works ✅ **COMPLETED** (uses DEMO_SCRIPT_URL as fallback)
- [ ] Test URL shortener compatibility (Ready for testing)

#### Backend Preparation
- [x] Create Master Template Sheet with all 6 sheets ✅ **DOCUMENTED** (see CUSTOMER_ONBOARDING_GUIDE.md)
- [x] Embed script in Master Template Sheet ✅ **COMPLETED** (CONTAINER_BOUND_SCRIPT.js created)
- [ ] Test script deployment from container-bound script (Ready for testing)
- [ ] Verify script can read/write to its own Sheet (Ready for testing)
- [x] Document deployment process ✅ **COMPLETED** (CUSTOMER_ONBOARDING_GUIDE.md)

#### Admin Tools
- [x] Create Master Admin Sheet (CRM) ✅ **DOCUMENTED** (see CUSTOMER_ONBOARDING_GUIDE.md)
- [x] Set up columns: Name, Email, Date, Sheet URL, Web App URL, Status ✅ **DOCUMENTED**
- [x] Create workflow documentation for customer onboarding ✅ **COMPLETED** (CUSTOMER_ONBOARDING_GUIDE.md)
- [ ] Test complete onboarding process (Ready for testing)

#### Testing
- [ ] Test with 2-3 dummy customers
- [ ] Verify data isolation between customers
- [ ] Test frontend with different API URLs
- [ ] Verify customer links work correctly
- [ ] Test admin access to all customer Sheets

---

**Remember**: The scaling strategy maintains zero-cost infrastructure while enabling unlimited customers. Always prioritize frontend solutions over backend solutions for easier maintenance.

