# Database Schema

## Overview

The IT Billing application uses a normalized Oracle database schema with 21 main tables. The schema is designed to support flexible invoice processing, cost allocation, and billing operations with full audit capabilities.

## Entity Relationship Diagram

```
Suppliers ──┬── Invoices ──┬── Invoice_Items ──┬── Allocations ──┬── Bills
            │              │                   │                 │
            │              └── Invoice_Attachments              │
            │                                                   │
Cost_Centers ──┬── Departments ──┬── Employees ──┬── Bill_Employees
               │                  │              │
               └── Groups ────────┤              └── Allocations
                                  │
                     Group_Members ┘

Allocation_Plans ──┬── Allocation_Plan_Parts
                   │
                   └── Allocations

Currencies ──┬── Exchange_Rates
             │
             └── Invoices

Transfers ──── Cost_Centers

Periodic_Invoices ──── Invoices
```

## Core Tables

### Suppliers Table
**Purpose**: Manage vendor information and payment details

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| NAME | VARCHAR2(1020) | Supplier name |
| EMAIL | VARCHAR2(1020) | Contact email |
| PHONE | VARCHAR2(100) | Contact phone |
| ADDRESS | VARCHAR2(2000) | Full address |
| TAX_ID | VARCHAR2(50) | Tax identification number |
| PAYMENT_TERMS | NUMBER | Payment terms in days |
| IS_ACTIVE | VARCHAR2(4) | Active status (Y/N) |
| CREATED | DATE | Record creation date |
| CREATED_BY | VARCHAR2(1020) | Creator username |
| UPDATED | DATE | Last update date |
| UPDATED_BY | VARCHAR2(1020) | Last updater username |
| ROW_VERSION | NUMBER | Optimistic locking version |

### Invoices Table
**Purpose**: Store invoice header information

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| SUPPLIER_ID | NUMBER | Foreign key to Suppliers |
| INVOICE_NUMBER | VARCHAR2(100) | Supplier invoice number |
| INVOICE_DATE | DATE | Invoice date |
| DUE_DATE | DATE | Payment due date |
| TOTAL_AMOUNT | NUMBER | Total invoice amount |
| CURRENCY_ID | NUMBER | Foreign key to Currencies |
| STATUS | VARCHAR2(20) | Invoice status |
| DESCRIPTION | VARCHAR2(2000) | Invoice description |
| REFERENCE_NUMBER | VARCHAR2(100) | Internal reference |
| APPROVAL_DATE | DATE | Approval date |
| APPROVED_BY | VARCHAR2(1020) | Approver username |
| PAYMENT_DATE | DATE | Payment date |
| NOTES | CLOB | Additional notes |

### Invoice_Items Table
**Purpose**: Store line-item details for each invoice

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| INVOICE_ID | NUMBER | Foreign key to Invoices |
| LINE_NUMBER | NUMBER | Line sequence number |
| DESCRIPTION | VARCHAR2(2000) | Item description |
| QUANTITY | NUMBER | Quantity (default 1) |
| UNIT_PRICE | NUMBER | Price per unit |
| LINE_TOTAL | NUMBER | Total for this line |
| COST_CENTER_ID | NUMBER | Initial cost center assignment |
| CATEGORY | VARCHAR2(100) | Service category |
| GL_ACCOUNT | VARCHAR2(50) | General ledger account |

### Cost_Centers Table
**Purpose**: Define organizational cost centers

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| CODE | VARCHAR2(20) | Cost center code |
| NAME | VARCHAR2(200) | Cost center name |
| DESCRIPTION | VARCHAR2(1000) | Detailed description |
| MANAGER_ID | NUMBER | Foreign key to Employees |
| PARENT_ID | NUMBER | Parent cost center (hierarchy) |
| BUDGET_AMOUNT | NUMBER | Annual budget |
| IS_ACTIVE | VARCHAR2(4) | Active status |
| GL_ACCOUNT | VARCHAR2(50) | Associated GL account |

### Departments Table
**Purpose**: Organizational department structure

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| NAME | VARCHAR2(200) | Department name |
| CODE | VARCHAR2(20) | Department code |
| MANAGER_ID | NUMBER | Department manager |
| COST_CENTER_ID | NUMBER | Default cost center |
| DESCRIPTION | VARCHAR2(1000) | Department description |

### Employees Table
**Purpose**: Staff information and cost center assignments

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| DEPARTMENT_ID | NUMBER | Foreign key to Departments |
| EMAIL | VARCHAR2(1020) | Employee email |
| NAME | VARCHAR2(1020) | Full name |
| IS_ACTIVE | VARCHAR2(4) | Active status |
| ENTRA_ID | VARCHAR2(36) | Azure AD identifier |
| EMPLOYEE_NUMBER | VARCHAR2(50) | Employee ID |
| MANAGER_ID | NUMBER | Direct manager |
| COST_CENTER_ID | NUMBER | Default cost center |

## Allocation Tables

### Allocations Table
**Purpose**: Store cost allocation records

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| INVOICE_ITEM_ID | NUMBER | Foreign key to Invoice_Items |
| COST_CENTER_ID | NUMBER | Target cost center |
| EMPLOYEE_ID | NUMBER | Target employee (optional) |
| ALLOCATION_PERCENTAGE | NUMBER | Percentage of total |
| ALLOCATED_AMOUNT | NUMBER | Calculated amount |
| ALLOCATION_DATE | DATE | Allocation date |
| ALLOCATION_METHOD | VARCHAR2(50) | Method used |
| NOTES | VARCHAR2(2000) | Allocation notes |
| APPROVED_BY | VARCHAR2(1020) | Approver |
| APPROVAL_DATE | DATE | Approval date |

### Allocation_Plans Table
**Purpose**: Predefined allocation rules

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| NAME | VARCHAR2(200) | Plan name |
| DESCRIPTION | VARCHAR2(1000) | Plan description |
| SERVICE_TYPE | VARCHAR2(100) | Applicable service type |
| EFFECTIVE_DATE | DATE | Plan effective date |
| EXPIRY_DATE | DATE | Plan expiry date |
| IS_ACTIVE | VARCHAR2(4) | Active status |
| DEFAULT_PLAN | VARCHAR2(4) | Default plan flag |

### Allocation_Plan_Parts Table
**Purpose**: Detailed allocation rules within plans

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| ALLOCATION_PLAN_ID | NUMBER | Foreign key to Allocation_Plans |
| COST_CENTER_ID | NUMBER | Target cost center |
| ALLOCATION_PERCENTAGE | NUMBER | Percentage allocation |
| PRIORITY | NUMBER | Allocation priority |
| CONDITIONS | VARCHAR2(1000) | Allocation conditions |
| MINIMUM_AMOUNT | NUMBER | Minimum allocation |
| MAXIMUM_AMOUNT | NUMBER | Maximum allocation |

## Billing Tables

### Bills Table
**Purpose**: Monthly bill generation

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| COST_CENTER_ID | NUMBER | Target cost center |
| BILLING_PERIOD | VARCHAR2(7) | Period (YYYY-MM) |
| TOTAL_AMOUNT | NUMBER | Total bill amount |
| CURRENCY_ID | NUMBER | Bill currency |
| GENERATION_DATE | DATE | Bill generation date |
| STATUS | VARCHAR2(20) | Bill status |
| APPROVED_BY | VARCHAR2(1020) | Approver |
| APPROVAL_DATE | DATE | Approval date |
| NOTES | CLOB | Bill notes |

### Bill_Items Table
**Purpose**: Detailed bill line items

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| BILL_ID | NUMBER | Foreign key to Bills |
| INVOICE_ITEM_ID | NUMBER | Source invoice item |
| ALLOCATION_ID | NUMBER | Source allocation |
| TRANSFER_ID | NUMBER | Source transfer |
| EMPLOYEE_ID | NUMBER | Assigned employee |
| COST_CENTER_ID | NUMBER | Target cost center |
| CHARGE | NUMBER | Charge amount |
| DESCRIPTION | VARCHAR2(1020) | Charge description |

### Bill_Employees Table
**Purpose**: Employee-specific billing details

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| BILL_ID | NUMBER | Foreign key to Bills |
| EMPLOYEE_ID | NUMBER | Foreign key to Employees |
| TOTAL_CHARGES | NUMBER | Total employee charges |
| ITEM_COUNT | NUMBER | Number of items |
| NOTES | VARCHAR2(1000) | Employee notes |

## Support Tables

### Currencies Table
**Purpose**: Multi-currency support

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| CODE | VARCHAR2(3) | ISO currency code |
| NAME | VARCHAR2(100) | Currency name |
| SYMBOL | VARCHAR2(10) | Currency symbol |
| IS_BASE | VARCHAR2(4) | Base currency flag |
| IS_ACTIVE | VARCHAR2(4) | Active status |

### Exchange_Rates Table
**Purpose**: Currency conversion rates

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| FROM_CURRENCY_ID | NUMBER | Source currency |
| TO_CURRENCY_ID | NUMBER | Target currency |
| RATE | NUMBER | Exchange rate |
| EFFECTIVE_DATE | DATE | Rate effective date |
| SOURCE | VARCHAR2(100) | Rate source |

### Transfers Table
**Purpose**: Inter-cost center transfers

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| FROM_COST_CENTER_ID | NUMBER | Source cost center |
| TO_COST_CENTER_ID | NUMBER | Target cost center |
| AMOUNT | NUMBER | Transfer amount |
| TRANSFER_DATE | DATE | Transfer date |
| REASON | VARCHAR2(1000) | Transfer reason |
| APPROVED_BY | VARCHAR2(1020) | Approver |
| STATUS | VARCHAR2(20) | Transfer status |

### Groups and Group_Members Tables
**Purpose**: User group management

#### Groups Table
| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| NAME | VARCHAR2(200) | Group name |
| DESCRIPTION | VARCHAR2(1000) | Group description |
| IS_ACTIVE | VARCHAR2(4) | Active status |

#### Group_Members Table
| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| GROUP_ID | NUMBER | Foreign key to Groups |
| EMPLOYEE_ID | NUMBER | Foreign key to Employees |
| ROLE | VARCHAR2(50) | Member role |
| ADDED_DATE | DATE | Membership date |

### Periodic_Invoices Table
**Purpose**: Recurring invoice management

| Column | Data Type | Description |
|--------|-----------|-------------|
| ID | NUMBER | Primary key, auto-generated |
| SUPPLIER_ID | NUMBER | Foreign key to Suppliers |
| DESCRIPTION | VARCHAR2(1000) | Service description |
| AMOUNT | NUMBER | Invoice amount |
| FREQUENCY | VARCHAR2(20) | Recurrence frequency |
| NEXT_INVOICE_DATE | DATE | Next expected invoice |
| LAST_GENERATED | DATE | Last generation date |
| IS_ACTIVE | VARCHAR2(4) | Active status |

## Indexes and Constraints

### Primary Keys
All tables have auto-generated primary keys using Oracle sequences.

### Foreign Key Constraints
- Invoice_Items.INVOICE_ID → Invoices.ID
- Invoices.SUPPLIER_ID → Suppliers.ID
- Allocations.COST_CENTER_ID → Cost_Centers.ID
- Bills.COST_CENTER_ID → Cost_Centers.ID
- And all other referential relationships

### Unique Constraints
- Suppliers: (NAME) - Unique supplier names
- Cost_Centers: (CODE) - Unique cost center codes
- Invoices: (SUPPLIER_ID, INVOICE_NUMBER) - Unique per supplier
- Currencies: (CODE) - Unique currency codes

### Check Constraints
- Percentage fields: 0 <= value <= 100
- Status fields: Limited to defined values
- Amount fields: >= 0
- IS_ACTIVE: 'Y' or 'N' only

### Indexes
- Foreign key columns
- Frequently queried date columns
- Status and code columns
- Search columns (names, descriptions)

## Audit and Security

### Audit Columns
All tables include:
- CREATED: Record creation timestamp
- CREATED_BY: Creating user
- UPDATED: Last update timestamp
- UPDATED_BY: Last updating user
- ROW_VERSION: Optimistic locking

### Security Features
- Row-level security based on cost center access
- Audit trails for all changes
- Encrypted sensitive data
- Regular backup procedures

---

*Next: [Reports and Analytics](05-reports-analytics.md)*
