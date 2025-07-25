# User Guide

## Table of Contents
- [Getting Started](#getting-started)
- [Invoice Entry](#invoice-entry)
- [Cost Allocation](#cost-allocation)
- [Bill Generation](#bill-generation)
- [Reports and Queries](#reports-and-queries)
- [Common Tasks](#common-tasks)

## Getting Started

### Accessing the System
1. Navigate to: https://apex.electrokubi.com/ords/r/production/it-billing/
2. Enter your credentials
3. The main dashboard displays key metrics and navigation options

### Dashboard Overview
The main dashboard provides:
- Quick access to all major functions
- Summary cards for Cost Centers, Departments, and Suppliers
- Navigation menu with all application modules
- Recent activity and pending tasks

### Navigation Structure
- **Home**: Main dashboard and overview
- **Cost Centers**: Manage cost center information
- **Departments**: Department structure and assignments
- **Groups**: User groups and permissions
- **Employees**: Staff information and assignments
- **Suppliers**: Vendor management
- **Allocation Plans**: Predefined allocation rules
- **Periodic Invoices**: Recurring invoice management
- **Invoices**: Invoice entry and management
- **Available Inventory**: Current allocation status
- **Transfers**: Inter-cost center transfers
- **Administration**: System configuration

## Invoice Entry

### Creating a New Invoice

#### Step 1: Access Invoice Module
1. Click **Invoices** from the main navigation menu
2. Click **Create** or **Add New Invoice** button

#### Step 2: Enter Invoice Header Information
**Required Fields:**
- **Supplier**: Select from dropdown list
- **Invoice Number**: Supplier's invoice number
- **Invoice Date**: Date on supplier invoice
- **Due Date**: Payment due date
- **Currency**: Invoice currency
- **Status**: Draft/Pending/Approved

**Optional Fields:**
- **Description**: Brief invoice description
- **Reference Number**: Internal reference
- **Notes**: Additional comments

#### Step 3: Add Invoice Items
For each line item on the invoice:
1. Click **Add Item** button
2. Enter item details:
   - **Description**: Service or product description
   - **Amount**: Line item amount
   - **Cost Center**: Initial cost center assignment (can be changed during allocation)
   - **Category**: Service category (if applicable)

#### Step 4: Attach Supporting Documents
1. Click **Attachments** tab
2. Upload relevant documents:
   - Original invoice PDF
   - Purchase orders
   - Approval emails
   - Service agreements

#### Step 5: Save and Submit
1. Review all entered information
2. Click **Save** to save as draft
3. Click **Submit** to move to approval workflow

### Invoice Validation Rules
- Total amount must equal sum of line items
- All required fields must be completed
- Supplier must be active
- Invoice number must be unique per supplier
- Due date cannot be in the past

### Invoice Status Workflow
1. **Draft**: Initial entry, can be edited
2. **Pending**: Submitted for approval
3. **Approved**: Ready for allocation
4. **Allocated**: Cost allocation completed
5. **Paid**: Payment processed
6. **Closed**: Invoice lifecycle complete

## Cost Allocation

### Understanding Allocation Methods

#### Direct Allocation
- Assign entire invoice amount to a specific cost center
- Used for department-specific services
- Requires cost center approval

#### Proportional Allocation
- Split invoice across multiple cost centers
- Based on predefined percentages or usage metrics
- Uses allocation plans for consistency

#### Employee-Based Allocation
- Allocate costs to individual employees
- Roll up to employee's assigned cost center
- Used for personal services (mobile phones, laptops)

### Creating Allocations

#### Step 1: Access Allocation Module
1. Go to **Invoices** → **Approved Invoices**
2. Select invoice requiring allocation
3. Click **Allocate** button

#### Step 2: Choose Allocation Method
Select appropriate method:
- **Use Allocation Plan**: Apply predefined rules
- **Manual Allocation**: Enter specific percentages
- **Employee Assignment**: Assign to individuals

#### Step 3: Apply Allocation Rules
**For Allocation Plans:**
1. Select relevant allocation plan
2. Review calculated percentages
3. Adjust if necessary
4. Apply allocation

**For Manual Allocation:**
1. Enter cost center and percentage for each line
2. Ensure total equals 100%
3. Add justification comments
4. Save allocation

**For Employee Assignment:**
1. Select employees from list
2. Enter allocation amount or percentage
3. System assigns to employee's cost center
4. Add assignment notes

#### Step 4: Review and Approve
1. Verify allocation totals match invoice amount
2. Check cost center assignments
3. Add approval comments
4. Submit for final approval

### Allocation Plans

#### Creating Allocation Plans
1. Navigate to **Allocation Plans**
2. Click **Create New Plan**
3. Enter plan details:
   - **Plan Name**: Descriptive name
   - **Service Type**: Type of service covered
   - **Effective Date**: When plan becomes active
   - **Description**: Plan purpose and rules

#### Plan Components
1. **Allocation Parts**: Individual allocation rules
   - Cost center
   - Percentage
   - Priority level
   - Conditions

2. **Validation Rules**:
   - Total percentages must equal 100%
   - All cost centers must be active
   - Effective dates must be logical

#### Example Allocation Plans
- **Internet Service**: 40% IT, 30% Finance, 20% HR, 10% Marketing
- **Security Service**: 50% IT, 25% Finance, 25% Operations
- **Software Licenses**: Based on user count per department

## Bill Generation

### Monthly Billing Process

#### Step 1: Period Preparation
1. Navigate to **Administration** → **Period Close**
2. Verify all invoices for the period are allocated
3. Run allocation completeness report
4. Resolve any pending allocations

#### Step 2: Generate Bills
1. Go to **Bills** → **Generate Monthly Bills**
2. Select billing period (month/year)
3. Choose cost centers to include
4. Set generation parameters:
   - Include transfers
   - Apply exchange rates
   - Include employee details

#### Step 3: Review Generated Bills
1. Review bill summaries by cost center
2. Check allocation accuracy
3. Verify calculated amounts
4. Review employee assignments

#### Step 4: Bill Approval Process
1. Send bills to cost center managers
2. Allow for review period (typically 5 business days)
3. Address any disputes or questions
4. Obtain formal approval

#### Step 5: Bill Distribution
1. Export bills to required formats (PDF, Excel)
2. Send to finance department
3. Update bill status to "Distributed"
4. Archive copies for record keeping

### Bill Components

#### Bill Header
- Cost center information
- Billing period
- Total amount
- Currency
- Generation date
- Approval status

#### Bill Items
- Service description
- Original invoice reference
- Allocation percentage
- Amount
- Responsible employee (if applicable)

#### Supporting Details
- Allocation breakdown
- Transfer adjustments
- Currency conversion details
- Approval trail

## Reports and Queries

### Standard Reports

#### 1. Invoice Summary Report
**Purpose**: Overview of invoice activity by period
**Filters**: Date range, supplier, status, amount range
**Output**: List of invoices with key details

#### 2. Cost Center Analysis
**Purpose**: Cost breakdown by cost center
**Filters**: Period, cost center, service type
**Output**: Allocation summary with percentages

#### 3. Supplier Performance
**Purpose**: Supplier activity and payment analysis
**Filters**: Supplier, date range, status
**Output**: Invoice volume and payment metrics

#### 4. Allocation Accuracy Report
**Purpose**: Verification of allocation completeness
**Filters**: Period, allocation method
**Output**: Allocation status and exceptions

#### 5. Monthly Bill Summary
**Purpose**: Generated bill overview
**Filters**: Billing period, cost center
**Output**: Bill totals and status

### Custom Queries

#### Available Data Sources
- All invoice data
- Allocation history
- Cost center information
- Employee assignments
- Bill generation details

#### Query Builder
1. Navigate to **Reports** → **Custom Queries**
2. Select data sources
3. Choose columns to include
4. Set filter criteria
5. Define sorting and grouping
6. Save query for reuse

### Export Options
- **PDF**: Formatted reports for distribution
- **Excel**: Data analysis and manipulation
- **CSV**: Integration with external systems
- **API**: Programmatic data access

## Common Tasks

### Updating Supplier Information
1. Navigate to **Suppliers**
2. Search for supplier
3. Click **Edit**
4. Update required fields
5. Save changes

### Managing Cost Centers
1. Go to **Cost Centers**
2. Add new or edit existing
3. Set hierarchy relationships
4. Assign managers and users
5. Configure allocation rules

### Handling Invoice Corrections
1. Locate original invoice
2. Create correction entry
3. Link to original invoice
4. Process through approval workflow
5. Update allocations as needed

### Transfer Processing
1. Navigate to **Transfers**
2. Create new transfer
3. Specify source and target cost centers
4. Enter amount and justification
5. Submit for approval

### User Management
1. Access **Administration** → **Users**
2. Add new users or modify existing
3. Assign roles and permissions
4. Set cost center access rights
5. Configure notification preferences

### Troubleshooting Common Issues

#### Invoice Won't Save
- Check all required fields are completed
- Verify invoice number is unique
- Ensure supplier is active
- Check amount format and currency

#### Allocation Doesn't Total 100%
- Review all allocation percentages
- Check for rounding errors
- Verify all cost centers are included
- Recalculate if necessary

#### Bill Generation Fails
- Ensure all invoices are allocated
- Check period dates are correct
- Verify cost center selections
- Review error logs for details

---

*Next: [Administration Guide](03-administration-guide.md)*
