# Oracle DDL Exporter

A TypeScript application that connects to an Oracle database and exports all table DDL statements to individual SQL files.

## Features

- Connects to Oracle Database (including Oracle Apex)
- Exports DDL for all user tables
- Creates individual SQL files for each table
- Generates a summary report of the export process
- Configurable through environment variables

## Prerequisites

- Node.js (v16 or higher)
- Oracle Database access
- Oracle Instant Client (for oracledb package)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and configure it:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file with your Oracle database connection details:
   ```
   DB_HOST=your_oracle_host
   DB_PORT=1521
   DB_SERVICE_NAME=your_service_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   OUTPUT_DIR=./ddl_output
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Output

The application will create:
- Individual `.sql` files for each table in the format: `OWNER_TABLENAME.sql`
- A summary file (`export_summary.txt`) with export statistics
- All files are saved to the directory specified in `OUTPUT_DIR`

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Oracle database host | localhost |
| `DB_PORT` | Oracle database port | 1521 |
| `DB_SERVICE_NAME` | Oracle service name | XEPDB1 |
| `DB_USER` | Database username | (required) |
| `DB_PASSWORD` | Database password | (required) |
| `OUTPUT_DIR` | Output directory for DDL files | ./ddl_output |

## Project Structure

```
src/
├── index.ts          # Main application entry point
├── config.ts         # Configuration management
├── database.ts       # Oracle database connection and queries
├── fileManager.ts    # File system operations
└── ddlExporter.ts    # Main export logic
```

## Troubleshooting

1. **Oracle Client Issues**: Make sure Oracle Instant Client is properly installed
2. **Connection Issues**: Verify database connection parameters
3. **Permission Issues**: Ensure the database user has SELECT privileges on system tables

## License

MIT
