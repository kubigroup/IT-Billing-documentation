# Troubleshooting

## Overview

This section provides comprehensive troubleshooting guidance for common issues encountered in the IT Billing application. Issues are organized by category with step-by-step resolution procedures, diagnostic tools, and preventive measures.

## System Issues

### Login and Authentication Problems

#### Issue: Users Cannot Log In
**Symptoms:**
- Login page loads but credentials are rejected
- "Invalid username or password" messages
- User account appears locked

**Diagnostic Steps:**
1. **Verify User Account Status**
   ```sql
   SELECT username, account_status, lock_date, expiry_date
   FROM dba_users 
   WHERE username = 'BILLING_USER';
   ```

2. **Check Apex User Status**
   ```sql
   SELECT user_name, is_admin, is_application_developer, account_locked
   FROM apex_workspace_apex_users 
   WHERE workspace_name = 'BILLING_WS'
   AND user_name = 'username';
   ```

3. **Review Authentication Logs**
   ```bash
   tail -f /opt/ords/logs/ords.log | grep authentication
   ```

**Resolution Steps:**
1. **Unlock User Account**
   ```sql
   ALTER USER billing_user ACCOUNT UNLOCK;
   ```

2. **Reset Password**
   ```sql
   BEGIN
     APEX_UTIL.SET_WORKSPACE('BILLING_WS');
     APEX_UTIL.RESET_PASSWORD(
       p_user_name => 'USERNAME',
       p_web_password => 'NewPassword123!'
     );
   END;
   /
   ```

3. **Clear Session Cache**
   ```sql
   BEGIN
     APEX_UTIL.CLEAR_USER_CACHE('USERNAME');
   END;
   /
   ```

#### Issue: Authentication Service Unavailable
**Symptoms:**
- Complete login failure for all users
- Authentication service errors in logs
- Database connectivity issues

**Diagnostic Steps:**
1. **Check Database Connectivity**
   ```bash
   tnsping FREEPDB1
   sqlplus billing/password@FREEPDB1
   ```

2. **Verify ORDS Status**
   ```bash
   curl -i http://localhost:8080/ords/
   systemctl status tomcat
   ```

3. **Check Authentication Configuration**
   ```sql
   SELECT name, value FROM apex_instance_parameters
   WHERE name LIKE '%AUTH%';
   ```

**Resolution Steps:**
1. **Restart Services**
   ```bash
   systemctl restart tomcat
   systemctl restart oracle-database
   ```

2. **Reconfigure Authentication**
   ```sql
   BEGIN
     APEX_INSTANCE_ADMIN.SET_PARAMETER(
       p_parameter => 'REQUIRE_HTTPS',
       p_value => 'N'
     );
   END;
   /
   ```

### Performance Issues

#### Issue: Slow Application Response
**Symptoms:**
- Pages load slowly (>10 seconds)
- Timeouts during operations
- High resource utilization

**Diagnostic Steps:**
1. **Check System Resources**
   ```bash
   top
   iostat 5
   df -h
   ```

2. **Analyze Database Performance**
   ```sql
   SELECT event, total_waits, time_waited
   FROM v$system_event
   WHERE wait_class != 'Idle'
   ORDER BY time_waited DESC;
   ```

3. **Identify Slow Queries**
   ```sql
   SELECT sql_text, elapsed_time, executions, 
          elapsed_time/executions avg_elapsed
   FROM v$sql 
   WHERE parsing_schema_name = 'BILLING'
   ORDER BY elapsed_time DESC;
   ```

**Resolution Steps:**
1. **Optimize Database**
   ```sql
   -- Gather fresh statistics
   BEGIN
     DBMS_STATS.GATHER_SCHEMA_STATS('BILLING');
   END;
   /
   
   -- Rebuild fragmented indexes
   SELECT 'ALTER INDEX ' || index_name || ' REBUILD;'
   FROM user_indexes 
   WHERE pct_free > 20;
   ```

2. **Clear Application Cache**
   ```sql
   BEGIN
     APEX_UTIL.CLEAR_PAGE_CACHE;
     APEX_UTIL.CLEAR_APP_CACHE(100); -- Application ID
   END;
   /
   ```

3. **Increase Memory Allocation**
   ```sql
   ALTER SYSTEM SET sga_target = '4G';
   ALTER SYSTEM SET pga_aggregate_target = '2G';
   ```

#### Issue: Database Connectivity Timeouts
**Symptoms:**
- Connection timeout errors
- "TNS: could not resolve service name" errors
- Intermittent connectivity issues

**Diagnostic Steps:**
1. **Test Network Connectivity**
   ```bash
   ping database-server
   telnet database-server 1521
   ```

2. **Check Listener Status**
   ```bash
   lsnrctl status
   lsnrctl services
   ```

3. **Verify Connection Pool Settings**
   ```bash
   # Check ORDS connection settings
   cat /opt/ords/config/databases/default/pool.xml
   ```

**Resolution Steps:**
1. **Restart Listener**
   ```bash
   lsnrctl stop
   lsnrctl start
   ```

2. **Adjust Connection Pool**
   ```xml
   <!-- Edit pool.xml -->
   <pool-config>
     <initial-limit>5</initial-limit>
     <max-limit>20</max-limit>
     <min-limit>2</min-limit>
     <connection-harvest-timeout>300</connection-harvest-timeout>
   </pool-config>
   ```

3. **Update TNS Configuration**
   ```bash
   # Edit tnsnames.ora
   FREEPDB1 = 
     (DESCRIPTION =
       (ADDRESS_LIST =
         (ADDRESS = (PROTOCOL = TCP)(HOST = database-server)(PORT = 1521))
       )
       (CONNECT_DATA =
         (SERVICE_NAME = freepdb1)
       )
     )
   ```

## Application Issues

### Invoice Processing Problems

#### Issue: Invoice Cannot Be Saved
**Symptoms:**
- Save button appears inactive
- Validation errors on form submission
- Data not persisting to database

**Diagnostic Steps:**
1. **Check Form Validation**
   - Review required field highlighting
   - Check data format requirements
   - Verify business rule compliance

2. **Review Database Constraints**
   ```sql
   SELECT constraint_name, constraint_type, search_condition
   FROM user_constraints 
   WHERE table_name = 'INVOICES'
   AND status = 'ENABLED';
   ```

3. **Check for Trigger Errors**
   ```sql
   SELECT trigger_name, status, trigger_body
   FROM user_triggers 
   WHERE table_name = 'INVOICES';
   ```

**Resolution Steps:**
1. **Validate Required Fields**
   - Ensure all mandatory fields are completed
   - Check date format (DD-MON-YYYY)
   - Verify numeric field formats

2. **Check Duplicate Constraints**
   ```sql
   -- Check for duplicate invoice numbers
   SELECT supplier_id, invoice_number, COUNT(*)
   FROM invoices 
   GROUP BY supplier_id, invoice_number
   HAVING COUNT(*) > 1;
   ```

3. **Review Audit Trail**
   ```sql
   SELECT operation, timestamp, error_message
   FROM billing_audit_log 
   WHERE table_name = 'INVOICES'
   AND timestamp > SYSDATE - 1
   ORDER BY timestamp DESC;
   ```

#### Issue: Allocation Totals Don't Match Invoice Amount
**Symptoms:**
- Allocation total ≠ 100%
- Amount calculations incorrect
- Cannot complete allocation process

**Diagnostic Steps:**
1. **Check Allocation Calculations**
   ```sql
   SELECT invoice_id, 
          SUM(allocation_percentage) total_percentage,
          SUM(allocated_amount) total_amount
   FROM allocations 
   WHERE invoice_id = :invoice_id
   GROUP BY invoice_id;
   ```

2. **Verify Rounding Issues**
   ```sql
   SELECT allocation_id, 
          allocation_percentage,
          allocated_amount,
          ROUND(invoice_total * allocation_percentage / 100, 2) calculated_amount
   FROM allocations a
   JOIN invoices i ON a.invoice_id = i.id
   WHERE a.invoice_id = :invoice_id;
   ```

**Resolution Steps:**
1. **Recalculate Allocations**
   ```sql
   UPDATE allocations 
   SET allocated_amount = ROUND(
     (SELECT total_amount FROM invoices WHERE id = allocations.invoice_id) 
     * allocation_percentage / 100, 2
   )
   WHERE invoice_id = :invoice_id;
   ```

2. **Adjust for Rounding Differences**
   ```sql
   -- Find the largest allocation and adjust for rounding
   UPDATE allocations 
   SET allocated_amount = allocated_amount + (
     SELECT i.total_amount - SUM(a.allocated_amount)
     FROM invoices i, allocations a
     WHERE i.id = a.invoice_id
     AND i.id = :invoice_id
   )
   WHERE allocation_id = (
     SELECT allocation_id 
     FROM allocations 
     WHERE invoice_id = :invoice_id
     AND allocated_amount = (
       SELECT MAX(allocated_amount) 
       FROM allocations 
       WHERE invoice_id = :invoice_id
     )
     AND ROWNUM = 1
   );
   ```

### Report Generation Issues

#### Issue: Reports Not Generating
**Symptoms:**
- Report generation hangs or fails
- Empty reports when data exists
- Error messages during report execution

**Diagnostic Steps:**
1. **Check Report SQL**
   ```sql
   -- Test underlying query manually
   SELECT COUNT(*) FROM invoices 
   WHERE invoice_date BETWEEN :start_date AND :end_date;
   ```

2. **Review Report Region Settings**
   - Verify data source configuration
   - Check parameter binding
   - Validate date range parameters

3. **Check System Resources**
   ```bash
   # Monitor during report generation
   top -p $(pgrep -f tomcat)
   ```

**Resolution Steps:**
1. **Optimize Report Query**
   ```sql
   -- Add indexes for report performance
   CREATE INDEX idx_invoices_date_status 
   ON invoices(invoice_date, status);
   
   CREATE INDEX idx_allocations_cost_center 
   ON allocations(cost_center_id, allocation_date);
   ```

2. **Adjust Report Settings**
   - Reduce date range for large reports
   - Add pagination for large result sets
   - Implement progressive loading

3. **Clear Report Cache**
   ```sql
   BEGIN
     APEX_UTIL.CLEAR_PAGE_CACHE(page_id => 50); -- Report page
   END;
   /
   ```

## Integration Issues

### Priority ERP Integration Problems

#### Issue: Data Synchronization Failures
**Symptoms:**
- Cost centers not updating from Priority
- Employee information out of sync
- Integration error messages

**Diagnostic Steps:**
1. **Check Integration Service Status**
   ```bash
   systemctl status billing-integration
   journalctl -u billing-integration -f
   ```

2. **Review Integration Logs**
   ```bash
   tail -f /var/log/billing/integration.log
   grep ERROR /var/log/billing/integration.log
   ```

3. **Test API Connectivity**
   ```bash
   curl -X GET "http://priority-server/api/cost-centers" \
        -H "Authorization: Bearer token"
   ```

**Resolution Steps:**
1. **Restart Integration Service**
   ```bash
   systemctl restart billing-integration
   ```

2. **Refresh Authentication Tokens**
   ```bash
   # Run token refresh script
   /opt/billing/scripts/refresh_tokens.sh
   ```

3. **Manual Data Sync**
   ```sql
   -- Trigger manual synchronization
   BEGIN
     billing_integration.sync_cost_centers;
     billing_integration.sync_employees;
   END;
   /
   ```

#### Issue: Invoice Export to Priority Failing
**Symptoms:**
- Invoices not appearing in Priority
- Export process hangs or errors
- File transfer failures

**Diagnostic Steps:**
1. **Check Export File Generation**
   ```bash
   ls -la /opt/billing/exports/
   tail /opt/billing/exports/latest_export.log
   ```

2. **Verify File Transfer**
   ```bash
   # Test SFTP connection
   sftp priority-user@priority-server
   ```

3. **Check Priority Import Status**
   ```sql
   -- Check Priority import tables
   SELECT * FROM priority.import_status 
   WHERE import_date = TRUNC(SYSDATE);
   ```

**Resolution Steps:**
1. **Regenerate Export File**
   ```sql
   BEGIN
     billing_export.generate_priority_export(
       p_start_date => TRUNC(SYSDATE-1),
       p_end_date => TRUNC(SYSDATE)
     );
   END;
   /
   ```

2. **Manual File Transfer**
   ```bash
   scp /opt/billing/exports/invoices_$(date +%Y%m%d).xml \
       priority-user@priority-server:/import/
   ```

3. **Trigger Priority Import**
   ```bash
   ssh priority-user@priority-server "cd /priority && ./import_invoices.sh"
   ```

## Data Issues

### Data Integrity Problems

#### Issue: Missing or Orphaned Records
**Symptoms:**
- References to non-existent records
- Allocation records without invoices
- Employees without departments

**Diagnostic Steps:**
1. **Check Referential Integrity**
   ```sql
   -- Find orphaned allocations
   SELECT a.allocation_id, a.invoice_item_id
   FROM allocations a
   LEFT JOIN invoice_items ii ON a.invoice_item_id = ii.id
   WHERE ii.id IS NULL;
   
   -- Find employees without departments
   SELECT e.id, e.name, e.department_id
   FROM employees e
   LEFT JOIN departments d ON e.department_id = d.id
   WHERE d.id IS NULL;
   ```

2. **Validate Foreign Key Constraints**
   ```sql
   SELECT constraint_name, table_name, status
   FROM user_constraints 
   WHERE constraint_type = 'R'
   AND status = 'DISABLED';
   ```

**Resolution Steps:**
1. **Clean Up Orphaned Records**
   ```sql
   -- Remove orphaned allocations
   DELETE FROM allocations 
   WHERE invoice_item_id NOT IN (SELECT id FROM invoice_items);
   
   -- Update employee departments
   UPDATE employees 
   SET department_id = (SELECT id FROM departments WHERE name = 'Unassigned')
   WHERE department_id NOT IN (SELECT id FROM departments);
   ```

2. **Re-enable Constraints**
   ```sql
   ALTER TABLE allocations ENABLE CONSTRAINT fk_allocations_invoice_items;
   ALTER TABLE employees ENABLE CONSTRAINT fk_employees_departments;
   ```

#### Issue: Data Corruption or Inconsistency
**Symptoms:**
- Calculated fields don't match stored values
- Negative amounts where not allowed
- Invalid status combinations

**Diagnostic Steps:**
1. **Check Data Consistency**
   ```sql
   -- Find invoices with inconsistent totals
   SELECT i.id, i.total_amount, SUM(ii.line_total) calculated_total
   FROM invoices i
   JOIN invoice_items ii ON i.id = ii.invoice_id
   GROUP BY i.id, i.total_amount
   HAVING i.total_amount != SUM(ii.line_total);
   ```

2. **Validate Business Rules**
   ```sql
   -- Find negative amounts
   SELECT 'INVOICES' table_name, id, total_amount
   FROM invoices WHERE total_amount < 0
   UNION ALL
   SELECT 'ALLOCATIONS', allocation_id, allocated_amount
   FROM allocations WHERE allocated_amount < 0;
   ```

**Resolution Steps:**
1. **Recalculate Derived Fields**
   ```sql
   -- Recalculate invoice totals
   UPDATE invoices i
   SET total_amount = (
     SELECT SUM(line_total)
     FROM invoice_items ii
     WHERE ii.invoice_id = i.id
   );
   ```

2. **Apply Business Rule Corrections**
   ```sql
   -- Fix negative amounts
   UPDATE allocations 
   SET allocated_amount = 0 
   WHERE allocated_amount < 0;
   
   -- Fix invalid statuses
   UPDATE invoices 
   SET status = 'DRAFT' 
   WHERE status NOT IN ('DRAFT', 'PENDING', 'APPROVED', 'PAID', 'CANCELLED');
   ```

## Error Message Reference

### Common Error Messages

#### "ORA-00001: unique constraint violated"
**Cause**: Attempting to insert duplicate values in unique fields
**Resolution**: 
- Check for existing records with same values
- Verify business logic for uniqueness requirements
- Update existing record instead of inserting new one

#### "ORA-02291: integrity constraint violated - parent key not found"
**Cause**: Foreign key reference to non-existent parent record
**Resolution**:
- Verify parent record exists
- Check foreign key field values
- Create parent record if legitimate

#### "APEX: Page not found"
**Cause**: Invalid page reference or security restriction
**Resolution**:
- Verify page exists and is published
- Check user permissions for page access
- Review authentication requirements

#### "APEX: Session state protection violation"
**Cause**: Session tampering or expired session
**Resolution**:
- Clear browser cache and cookies
- Re-authenticate user
- Check session timeout settings

### SQL Error Codes

| Error Code | Description | Common Resolution |
|------------|-------------|-------------------|
| ORA-00001 | Unique constraint | Check for duplicates |
| ORA-00904 | Invalid identifier | Verify column names |
| ORA-00942 | Table or view does not exist | Check object names |
| ORA-01017 | Invalid username/password | Verify credentials |
| ORA-01400 | Cannot insert NULL | Provide required values |
| ORA-02291 | Parent key not found | Create parent record |
| ORA-12541 | TNS: no listener | Start listener service |

## Preventive Measures

### Regular Maintenance Tasks

#### Daily Checks
- Monitor system logs for errors
- Verify backup completion
- Check integration status
- Review user access issues

#### Weekly Tasks
- Analyze performance metrics
- Review data quality reports
- Update database statistics
- Check security settings

#### Monthly Reviews
- Comprehensive system health check
- User access audit
- Performance optimization
- Capacity planning review

### Monitoring Setup

#### Automated Alerts
```bash
# Create monitoring script
#!/bin/bash
# /opt/billing/scripts/monitor.sh

# Check database connectivity
if ! sqlplus -s billing/password@FREEPDB1 <<< "SELECT 1 FROM dual;" > /dev/null 2>&1; then
  echo "Database connection failed" | mail -s "BILLING ALERT" admin@company.com
fi

# Check application availability
if ! curl -s http://localhost:8080/ords/r/billing_ws/it-billing/ > /dev/null; then
  echo "Application not responding" | mail -s "BILLING ALERT" admin@company.com
fi
```

#### Performance Monitoring
```sql
-- Create performance monitoring view
CREATE OR REPLACE VIEW v_performance_metrics AS
SELECT 
  'Response Time' metric,
  AVG(elapsed_time/1000) value,
  'ms' unit
FROM v$sql 
WHERE parsing_schema_name = 'BILLING'
UNION ALL
SELECT 
  'Error Rate',
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM billing_audit_log),
  '%'
FROM billing_audit_log 
WHERE error_message IS NOT NULL
AND timestamp > SYSDATE - 1;
```

---

*End of Documentation*
