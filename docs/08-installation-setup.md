# Installation and Setup

## Overview

This guide provides step-by-step instructions for installing and configuring the IT Billing application in a production environment. The installation includes database setup, application deployment, security configuration, and initial data setup.

## System Requirements

### Hardware Requirements

#### Production Environment
- **CPU**: 8 cores, 2.4 GHz minimum
- **RAM**: 32 GB minimum, 64 GB recommended
- **Storage**: 
  - Application: 100 GB SSD
  - Database: 2 TB SSD (with 50% free space)
  - Backup: 4 TB (twice database size)
- **Network**: 1 Gbps dedicated connection

#### Development Environment
- **CPU**: 4 cores, 2.0 GHz minimum
- **RAM**: 16 GB minimum, 32 GB recommended
- **Storage**: 500 GB SSD
- **Network**: 100 Mbps connection

### Software Requirements

#### Oracle Database
- **Version**: Oracle Database 19c Enterprise Edition or higher
- **Features**: Partitioning, Advanced Security, Multitenant
- **Character Set**: AL32UTF8
- **National Character Set**: AL16UTF16

#### Oracle Application Express (Apex)
- **Version**: Oracle Apex 20.2 or higher
- **Components**: Application Builder, SQL Workshop, Team Development
- **Plugins**: Required for advanced functionality

#### Oracle REST Data Services (ORDS)
- **Version**: ORDS 21.4 or higher
- **Java**: JDK 11 or higher
- **Web Server**: Apache Tomcat 9.0 or higher

#### Operating System
- **Production**: Oracle Linux 8 or Red Hat Enterprise Linux 8
- **Development**: Windows 10/11 or Linux distributions
- **Virtualization**: VMware vSphere 7.0 or higher

## Pre-Installation Checklist

### Infrastructure Preparation
- [ ] Database server provisioned and configured
- [ ] Application server deployed
- [ ] Network connectivity established
- [ ] Firewall rules configured
- [ ] SSL certificates obtained
- [ ] Backup storage configured
- [ ] Monitoring tools installed

### Security Preparation
- [ ] Service accounts created
- [ ] Database schemas planned
- [ ] Access control matrix defined
- [ ] Network security configured
- [ ] Encryption keys generated
- [ ] Audit logging enabled

### Data Preparation
- [ ] Master data sources identified
- [ ] Data migration plan prepared
- [ ] Integration endpoints configured
- [ ] Test data sets prepared
- [ ] Backup and recovery procedures tested

## Database Installation

### Step 1: Create Database Schema

#### Connect to Database
```sql
-- Connect as SYSTEM or DBA user
sqlplus system/password@//database-server:1521/FREEPDB1
```

#### Create Billing Schema
```sql
-- Create tablespace for billing data
CREATE TABLESPACE BILLING_DATA
DATAFILE '/opt/oracle/oradata/FREEPDB1/billing_data01.dbf' 
SIZE 1G AUTOEXTEND ON NEXT 100M MAXSIZE 10G;

-- Create tablespace for indexes
CREATE TABLESPACE BILLING_INDEXES
DATAFILE '/opt/oracle/oradata/FREEPDB1/billing_indexes01.dbf' 
SIZE 500M AUTOEXTEND ON NEXT 50M MAXSIZE 5G;

-- Create billing user
CREATE USER billing IDENTIFIED BY "SecurePassword123!"
DEFAULT TABLESPACE BILLING_DATA
TEMPORARY TABLESPACE TEMP
QUOTA UNLIMITED ON BILLING_DATA
QUOTA UNLIMITED ON BILLING_INDEXES;

-- Grant necessary privileges
GRANT CONNECT, RESOURCE TO billing;
GRANT CREATE VIEW TO billing;
GRANT CREATE MATERIALIZED VIEW TO billing;
GRANT CREATE PROCEDURE TO billing;
GRANT CREATE TRIGGER TO billing;
GRANT CREATE SEQUENCE TO billing;
GRANT CREATE SYNONYM TO billing;
```

### Step 2: Install Database Objects

#### Run DDL Scripts
```bash
# Navigate to installation directory
cd /opt/it-billing/database

# Execute DDL scripts in order
sqlplus billing/password@//database-server:1521/FREEPDB1 @01_tables.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @02_sequences.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @03_indexes.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @04_constraints.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @05_triggers.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @06_packages.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @07_views.sql
sqlplus billing/password@//database-server:1521/FREEPDB1 @08_initial_data.sql
```

#### Verify Installation
```sql
-- Check table creation
SELECT table_name FROM user_tables ORDER BY table_name;

-- Verify data integrity
SELECT COUNT(*) FROM currencies;
SELECT COUNT(*) FROM invoice_statuses;

-- Test sequences
SELECT billing.seq_suppliers.NEXTVAL FROM dual;
```

### Step 3: Configure Database Security

#### Create Application Users
```sql
-- Create Apex workspace user
CREATE USER apex_billing IDENTIFIED BY "ApexSecurePass123!"
DEFAULT TABLESPACE BILLING_DATA
TEMPORARY TABLESPACE TEMP;

GRANT CONNECT TO apex_billing;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing.* TO apex_billing;

-- Create integration user
CREATE USER billing_integration IDENTIFIED BY "IntegrationPass123!"
DEFAULT TABLESPACE BILLING_DATA
TEMPORARY TABLESPACE TEMP;

GRANT CONNECT TO billing_integration;
GRANT SELECT, INSERT, UPDATE ON billing.invoices TO billing_integration;
GRANT SELECT, INSERT, UPDATE ON billing.invoice_items TO billing_integration;
GRANT SELECT ON billing.cost_centers TO billing_integration;
```

#### Configure Row Level Security
```sql
-- Enable RLS on sensitive tables
ALTER TABLE billing.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.allocations ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE OR REPLACE FUNCTION billing.cost_center_access_policy(
  schema_var IN VARCHAR2,
  table_var IN VARCHAR2
) RETURN VARCHAR2
AS
BEGIN
  RETURN 'cost_center_id IN (
    SELECT cost_center_id 
    FROM billing.user_cost_center_access 
    WHERE username = USER
  )';
END;
/

-- Apply policies
BEGIN
  DBMS_RLS.ADD_POLICY(
    object_schema => 'BILLING',
    object_name => 'INVOICES',
    policy_name => 'COST_CENTER_ACCESS',
    function_schema => 'BILLING',
    policy_function => 'COST_CENTER_ACCESS_POLICY'
  );
END;
/
```

## Application Installation

### Step 1: Install Oracle Apex

#### Download and Install Apex
```bash
# Download Apex from Oracle
wget https://download.oracle.com/otn_software/apex/apex_22.2.zip

# Extract files
unzip apex_22.2.zip
cd apex

# Install Apex
sqlplus sys/password@//database-server:1521/FREEPDB1 as sysdba @apexins.sql BILLING BILLING TEMP /i/
```

#### Configure Apex Instance
```sql
-- Set Apex admin password
BEGIN
  APEX_UTIL.SET_SECURITY_GROUP_ID(10);
  APEX_UTIL.CREATE_USER(
    p_user_name => 'ADMIN',
    p_email_address => 'admin@company.com',
    p_first_name => 'System',
    p_last_name => 'Administrator',
    p_description => 'System Administrator',
    p_web_password => 'AdminPassword123!'
  );
  COMMIT;
END;
/
```

### Step 2: Install ORDS

#### Download and Configure ORDS
```bash
# Download ORDS
wget https://download.oracle.com/otn_software/java/ords/ords-21.4.3.zip

# Extract and setup
unzip ords-21.4.3.zip -d /opt/ords
cd /opt/ords

# Configure ORDS
java -jar ords.war configdir /opt/ords/config
java -jar ords.war setup --silent \
  --db-hostname database-server \
  --db-port 1521 \
  --db-servicename FREEPDB1 \
  --schema-tablespace BILLING_DATA \
  --schema-temp-tablespace TEMP \
  --db-username APEX_PUBLIC_USER \
  --db-password password \
  --apex-images-directory /opt/ords/images
```

#### Deploy ORDS
```bash
# Copy to Tomcat
cp ords.war /opt/tomcat/webapps/
systemctl restart tomcat

# Verify deployment
curl http://localhost:8080/ords/sql-developer
```

### Step 3: Import Application

#### Create Apex Workspace
```sql
-- Connect to Apex admin
BEGIN
  APEX_INSTANCE_ADMIN.ADD_WORKSPACE(
    p_workspace => 'BILLING_WS',
    p_primary_schema => 'BILLING',
    p_additional_schemas => 'BILLING'
  );
  
  APEX_UTIL.SET_WORKSPACE(p_workspace => 'BILLING_WS');
  
  APEX_UTIL.CREATE_USER(
    p_user_name => 'BILLING_ADMIN',
    p_email_address => 'billing-admin@company.com',
    p_first_name => 'Billing',
    p_last_name => 'Administrator',
    p_web_password => 'BillingAdmin123!',
    p_developer_privs => 'ADMIN:CREATE:DATA_LOADER:EDIT:HELP:MONITOR:SQL'
  );
  
  COMMIT;
END;
/
```

#### Import Application Files
```bash
# Import application export file
sqlplus billing/password@//database-server:1521/FREEPDB1 @import_application.sql
```

## Configuration Setup

### Step 1: Application Configuration

#### Set Application Parameters
```sql
-- Connect to billing schema
-- Update application settings
UPDATE billing.application_settings 
SET setting_value = 'https://apex.electrokubi.com/ords/r/production/it-billing/'
WHERE setting_name = 'APPLICATION_URL';

UPDATE billing.application_settings 
SET setting_value = 'USD'
WHERE setting_name = 'DEFAULT_CURRENCY';

UPDATE billing.application_settings 
SET setting_value = 'admin@company.com'
WHERE setting_name = 'ADMIN_EMAIL';

COMMIT;
```

#### Configure Email Settings
```sql
-- Email server configuration
BEGIN
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'SMTP_HOST_ADDRESS',
    p_value => 'mail.company.com'
  );
  
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'SMTP_HOST_PORT',
    p_value => '587'
  );
  
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'SMTP_TLS_MODE',
    p_value => 'STARTTLS'
  );
END;
/
```

### Step 2: Load Master Data

#### Load Initial Data
```sql
-- Load currencies
INSERT INTO billing.currencies (code, name, symbol, is_base, is_active)
VALUES ('USD', 'US Dollar', '$', 'Y', 'Y');
INSERT INTO billing.currencies (code, name, symbol, is_base, is_active)
VALUES ('EUR', 'Euro', '€', 'N', 'Y');
INSERT INTO billing.currencies (code, name, symbol, is_base, is_active)
VALUES ('ILS', 'Israeli Shekel', '₪', 'N', 'Y');

-- Load initial cost centers
INSERT INTO billing.cost_centers (code, name, description, is_active)
VALUES ('IT001', 'Information Technology', 'IT Department Cost Center', 'Y');
INSERT INTO billing.cost_centers (code, name, description, is_active)
VALUES ('FIN001', 'Finance', 'Finance Department Cost Center', 'Y');
INSERT INTO billing.cost_centers (code, name, description, is_active)
VALUES ('HR001', 'Human Resources', 'HR Department Cost Center', 'Y');

-- Load departments
INSERT INTO billing.departments (name, code, description)
VALUES ('Information Technology', 'IT', 'IT Department');
INSERT INTO billing.departments (name, code, description)
VALUES ('Finance', 'FIN', 'Finance Department');
INSERT INTO billing.departments (name, code, description)
VALUES ('Human Resources', 'HR', 'HR Department');

COMMIT;
```

### Step 3: Security Configuration

#### Configure SSL/TLS
```bash
# Generate SSL certificate
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
  -keyout server.key -out server.crt \
  -subj "/C=US/ST=State/L=City/O=Company/CN=apex.company.com"

# Configure Tomcat SSL
# Edit /opt/tomcat/conf/server.xml
```

#### Configure Authentication
```sql
-- Configure LDAP authentication (if applicable)
BEGIN
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'LDAP_HOSTNAME',
    p_value => 'ldap.company.com'
  );
  
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'LDAP_PORT',
    p_value => '389'
  );
END;
/
```

## Post-Installation Tasks

### Step 1: System Validation

#### Test Database Connectivity
```sql
-- Test basic connectivity
SELECT 'Database connection successful' FROM dual;

-- Test table access
SELECT COUNT(*) FROM billing.suppliers;
SELECT COUNT(*) FROM billing.cost_centers;
SELECT COUNT(*) FROM billing.currencies;
```

#### Test Application Access
```bash
# Test ORDS connectivity
curl -i http://localhost:8080/ords/

# Test Apex application
curl -i http://localhost:8080/ords/r/billing_ws/it-billing/
```

### Step 2: Performance Tuning

#### Database Optimization
```sql
-- Gather statistics
BEGIN
  DBMS_STATS.GATHER_SCHEMA_STATS(
    ownname => 'BILLING',
    estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE,
    cascade => TRUE
  );
END;
/

-- Configure optimizer
ALTER SYSTEM SET optimizer_mode = 'ALL_ROWS';
ALTER SYSTEM SET cursor_sharing = 'EXACT';
```

#### Application Optimization
```sql
-- Configure Apex caching
BEGIN
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'MAX_SESSION_LENGTH_SEC',
    p_value => '28800'
  );
  
  APEX_INSTANCE_ADMIN.SET_PARAMETER(
    p_parameter => 'MAX_SESSION_IDLE_SEC',
    p_value => '3600'
  );
END;
/
```

### Step 3: Backup Configuration

#### Configure Automated Backups
```bash
#!/bin/bash
# Create backup script /opt/scripts/backup_billing.sh

# Database backup
rman target / <<EOF
BACKUP DATABASE PLUS ARCHIVELOG;
DELETE OBSOLETE;
EXIT;
EOF

# Application backup
exp billing/password@FREEPDB1 file=/backup/billing_`date +%Y%m%d`.dmp
```

#### Schedule Backups
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup_billing.sh

# Weekly full backup on Sunday at 1 AM
0 1 * * 0 /opt/scripts/full_backup.sh
```

## Troubleshooting Installation Issues

### Common Database Issues

#### Tablespace Issues
```sql
-- Check tablespace usage
SELECT tablespace_name, 
       ROUND(bytes/1024/1024) MB_USED,
       ROUND(maxbytes/1024/1024) MB_MAX
FROM dba_data_files 
WHERE tablespace_name IN ('BILLING_DATA', 'BILLING_INDEXES');

-- Extend tablespace if needed
ALTER DATABASE DATAFILE '/opt/oracle/oradata/FREEPDB1/billing_data01.dbf' 
RESIZE 2G;
```

#### Permission Issues
```sql
-- Check user privileges
SELECT * FROM dba_role_privs WHERE grantee = 'BILLING';
SELECT * FROM dba_sys_privs WHERE grantee = 'BILLING';

-- Grant missing privileges
GRANT CREATE PROCEDURE TO billing;
GRANT EXECUTE ON DBMS_CRYPTO TO billing;
```

### Common Application Issues

#### ORDS Configuration
```bash
# Check ORDS logs
tail -f /opt/ords/logs/ords.log

# Verify ORDS configuration
java -jar ords.war validate /opt/ords/config
```

#### Apex Issues
```sql
-- Check Apex installation
SELECT version_no FROM apex_release;

-- Verify workspace
SELECT workspace_name, workspace_id 
FROM apex_workspaces 
WHERE workspace_name = 'BILLING_WS';
```

### Performance Issues

#### Slow Queries
```sql
-- Identify slow queries
SELECT sql_text, elapsed_time, executions
FROM v$sql 
WHERE parsing_schema_name = 'BILLING'
ORDER BY elapsed_time DESC;

-- Create missing indexes
CREATE INDEX idx_invoices_supplier_date 
ON billing.invoices(supplier_id, invoice_date);
```

#### Memory Issues
```sql
-- Check memory usage
SELECT name, value FROM v$parameter 
WHERE name IN ('sga_target', 'pga_aggregate_target');

-- Adjust if needed
ALTER SYSTEM SET sga_target = '2G';
ALTER SYSTEM SET pga_aggregate_target = '1G';
```

---

*Next: [Troubleshooting](09-troubleshooting.md)*
