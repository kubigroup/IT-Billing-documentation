# Oracle DDL Exporter Setup Guide

## Oracle Instant Client Setup

The `oracledb` npm package requires Oracle Instant Client to be installed on your system.

### Windows Setup

1. **Download Oracle Instant Client**:
   - Go to: https://www.oracle.com/database/technologies/instant-client/downloads.html
   - Download "Basic" or "Basic Light" package for Windows x64
   - Extract to a folder (e.g., `C:\oracle\instantclient_21_8`)

2. **Set Environment Variables**:
   ```powershell
   # Add to PATH
   $env:PATH += ";C:\oracle\instantclient_21_8"
   
   # Or set permanently in System Properties > Environment Variables
   ```

3. **Alternative - Using Chocolatey**:
   ```powershell
   choco install oracle-instant-client
   ```

### Verify Installation

Run this command to verify Oracle client is accessible:
```bash
node -e "console.log(require('oracledb').versionString)"
```

## Database Connection Testing

You can test your database connection before running the full export:

```typescript
// Test connection script (create test-connection.ts)
import oracledb from 'oracledb';

async function testConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: 'your_username',
      password: 'your_password',
      connectString: 'localhost:1521/XEPDB1'
    });
    
    console.log('Connection successful!');
    await connection.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
```

## Common Issues

1. **ORA-12154: TNS:could not resolve the connect identifier**
   - Check your `DB_SERVICE_NAME` in `.env`
   - Verify the Oracle service is running

2. **DPI-1047: Cannot locate a 64-bit Oracle Client library**
   - Install Oracle Instant Client (64-bit)
   - Add to PATH environment variable

3. **ORA-01017: invalid username/password**
   - Verify credentials in `.env` file
   - Check if user has proper database permissions
