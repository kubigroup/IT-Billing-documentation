# Supplier Procedures

## Overview

This section contains specific procedures and workflows for different suppliers. Each supplier may have unique requirements for invoice processing, data formats, approval workflows, and integration methods.

## General Supplier Guidelines

### Supplier Onboarding Process
1. **Supplier Registration**
   - Complete supplier information form
   - Provide tax identification documents
   - Set up payment terms and methods
   - Configure invoice delivery preferences

2. **System Setup**
   - Create supplier record in system
   - Configure approval workflows
   - Set up allocation plans (if applicable)
   - Test invoice processing procedures

3. **Integration Setup**
   - API connectivity (if supported)
   - Email processing rules
   - Document format specifications
   - Automated validation rules

### Standard Supplier Information Required
- **Business Details**: Legal name, address, tax ID
- **Contact Information**: Primary contact, email, phone
- **Financial Details**: Payment terms, banking information
- **Technical Details**: Invoice format, delivery method
- **Approval Requirements**: Approval levels, required documentation

## Supplier-Specific Procedures

### Microsoft (Software Licenses)

#### Invoice Characteristics
- **Invoice Type**: Software licensing and support
- **Frequency**: Monthly/Annual
- **Format**: PDF via email
- **Typical Amount Range**: $10,000 - $100,000

#### Processing Procedure
1. **Receipt**: Invoices received via licensing@company.com
2. **Validation**: 
   - Verify license counts against inventory
   - Confirm pricing matches Enterprise Agreement
   - Check for any new services or changes
3. **Allocation**: 
   - Use "Software Licenses" allocation plan
   - Allocate based on department user counts
   - IT department handles admin licenses
4. **Approval**: Requires IT Manager and Finance approval for amounts > $25,000

#### Special Considerations
- Volume licensing agreements affect pricing
- Mid-term adjustments for user count changes
- Annual true-up invoices require detailed review
- Coordinate with IT asset management team

### Amazon Web Services (Cloud Services)

#### Invoice Characteristics
- **Invoice Type**: Cloud infrastructure and services
- **Frequency**: Monthly
- **Format**: CSV/JSON via API, PDF via email
- **Typical Amount Range**: $5,000 - $50,000

#### Processing Procedure
1. **Automated Import**: 
   - API integration pulls monthly usage data
   - System creates draft invoice automatically
   - Detailed breakdown by service and resource tags
2. **Validation**:
   - Review against budgeted cloud spend
   - Verify resource tags for proper allocation
   - Check for unusual usage spikes
3. **Allocation**:
   - Automatic allocation based on resource tags
   - Default allocation for untagged resources
   - Special handling for shared services
4. **Review Process**:
   - IT infrastructure team reviews technical details
   - Finance approves budget variances
   - Department heads approve their allocations

#### Special Considerations
- Resource tagging strategy critical for allocation
- Reserved instances affect monthly calculations
- Support charges allocated to IT department
- Data transfer charges may require special allocation

### Office Depot (Office Supplies)

#### Invoice Characteristics
- **Invoice Type**: Office supplies and equipment
- **Frequency**: Weekly
- **Format**: PDF with detailed line items
- **Typical Amount Range**: $500 - $5,000

#### Processing Procedure
1. **Receipt**: Invoices received from procurement system
2. **Validation**:
   - Match against purchase orders
   - Verify delivery confirmations
   - Check pricing against contract terms
3. **Allocation**:
   - Direct allocation to requesting department
   - Shared items allocated proportionally
   - Equipment items may require asset registration
4. **Approval**: Department manager approval required

#### Special Considerations
- Purchase order matching required
- Delivery confirmation needed
- Bulk order discounts may affect allocation
- Equipment items need asset tag assignment

### Telecommunications Providers

#### Invoice Characteristics
- **Invoice Type**: Phone, internet, and data services
- **Frequency**: Monthly
- **Format**: PDF with usage details
- **Typical Amount Range**: $2,000 - $15,000

#### Processing Procedure
1. **Receipt**: Direct from telecom provider
2. **Validation**:
   - Compare against service contracts
   - Review usage charges for anomalies
   - Verify new installations/disconnections
3. **Allocation**:
   - Fixed costs allocated per allocation plan
   - Variable costs by usage tracking
   - Employee mobile phones to individuals
4. **Approval**: IT Manager and affected department heads

#### Special Considerations
- International charges require special review
- New service installations need approval trail
- Employee departures affect mobile allocations
- Contract changes may require allocation updates

## Supplier Integration Methods

### Email-Based Processing
**Applicable to**: Most traditional suppliers
**Process**:
1. Dedicated email inbox for invoice receipt
2. Automated email parsing for key data
3. Manual review for complex invoices
4. Standard approval workflow

### API Integration
**Applicable to**: Major cloud and software providers
**Process**:
1. Automated data retrieval via API
2. Real-time invoice generation
3. Automatic validation against usage data
4. Exception handling for anomalies

### EDI (Electronic Data Interchange)
**Applicable to**: Large volume suppliers
**Process**:
1. Structured data exchange
2. Automated invoice creation
3. Exception-based review process
4. Bulk approval capabilities

### Portal Access
**Applicable to**: Suppliers with customer portals
**Process**:
1. Manual download from supplier portal
2. Standardized data import process
3. Validation against portal data
4. Normal approval workflow

## Supplier Performance Metrics

### Key Performance Indicators
- **Invoice Accuracy**: Percentage of invoices requiring correction
- **Processing Time**: Average time from receipt to payment
- **Compliance Rate**: Adherence to format and timing requirements
- **Cost per Invoice**: Processing cost analysis
- **Error Rate**: Frequency of invoice errors or disputes

### Monthly Supplier Scorecard
| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Invoice Accuracy | 95% | 92% | ↑ |
| Processing Time | 5 days | 7 days | ↓ |
| Format Compliance | 90% | 88% | → |
| Error Rate | <5% | 8% | ↑ |

### Supplier Review Process
- **Monthly**: Performance metrics review
- **Quarterly**: Supplier business review meetings
- **Annually**: Contract and terms negotiation
- **As needed**: Issue resolution and process improvement

## Special Handling Procedures

### High-Value Invoices (>$50,000)
1. Additional approval level required
2. Supporting documentation mandatory
3. Finance director review
4. Board notification for amounts >$100,000

### International Suppliers
1. Currency conversion handling
2. Tax withholding requirements
3. Extended payment terms
4. Additional documentation requirements

### New Suppliers
1. Complete onboarding process
2. Test transaction processing
3. Approval workflow validation
4. First invoice manual review

### Contract Suppliers
1. Verify against contract terms
2. Milestone and deliverable confirmation
3. Progress billing validation
4. Change order processing

## Troubleshooting Common Issues

### Invoice Format Problems
- Work with supplier to standardize format
- Implement parsing rules for variations
- Manual override procedures
- Regular format compliance review

### Allocation Disputes
- Clear allocation methodology documentation
- Regular communication with cost center managers
- Dispute resolution process
- Appeal mechanism for disagreements

### Payment Delays
- Monitor payment processing status
- Proactive communication with suppliers
- Exception handling procedures
- Escalation paths for urgent payments

### Data Quality Issues
- Supplier data validation rules
- Regular data cleanup procedures
- Error reporting and correction
- Continuous improvement process

---

*Next: [Priority ERP Integration](07-priority-erp-integration.md)*
