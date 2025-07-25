import oracledb from 'oracledb';
import { DatabaseConfig } from './config';

export interface TableInfo {
  tableName: string;
  owner: string;
}

export interface ColumnInfo {
  columnName: string;
  dataType: string;
  nullable: string;
  defaultValue: string;
}

export class DatabaseConnection {
  private connection: oracledb.Connection | null = null;

  constructor(private config: DatabaseConfig) {}

  async connect(): Promise<void> {
    try {
      this.connection = await oracledb.getConnection({
        user: this.config.user,
        password: this.config.password,
        connectString: `${this.config.host}:${this.config.port}/${this.config.serviceName}`
      });
      console.log('Connected to Oracle database');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        console.log('Disconnected from Oracle database');
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
    }
  }

  async getTables(): Promise<TableInfo[]> {
    if (!this.connection) {
      throw new Error('Not connected to database');
    }

    const query = `
      SELECT table_name, owner
      FROM all_tables
      WHERE owner = USER
      ORDER BY table_name
    `;

    try {
      const result = await this.connection.execute(query);
      return (result.rows || []).map(row => ({
        tableName: row[0],
        owner: row[1]
      }));
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async getTableDDL(tableName: string, owner: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Not connected to database');
    }

    // Try the DBMS_METADATA approach first
    try {
      const metadataQuery = `
        SELECT DBMS_METADATA.GET_DDL('TABLE', :tableName, :owner) as ddl
        FROM dual
      `;

      const result = await this.connection.execute(metadataQuery, {
        tableName: tableName,
        owner: owner
      });

      if (result.rows && result.rows.length > 0) {
        let ddl = result.rows[0][0];
        
        // Handle CLOB data
        if (ddl && typeof ddl === 'object' && ddl.read) {
          const chunks = [];
          let chunk;
          while ((chunk = ddl.read()) !== null) {
            chunks.push(chunk);
          }
          ddl = chunks.join('');
        }
        
        if (ddl && typeof ddl === 'string' && ddl.trim().length > 0) {
          return ddl;
        }
      }
    } catch (error) {
      console.log(`DBMS_METADATA failed for ${tableName}, trying manual DDL generation...`);
    }

    // Fallback: Generate DDL manually from system tables
    return await this.generateTableDDLManually(tableName, owner);
  }

  private async generateTableDDLManually(tableName: string, owner: string): Promise<string> {
    const columns = await this.getTableColumns(tableName, owner);
    
    let ddl = `CREATE TABLE ${owner}.${tableName} (\n`;
    
    const columnDefs = columns.map(col => {
      let def = `    ${col.columnName} ${col.dataType}`;
      
      if (col.nullable === 'N') {
        def += ' NOT NULL';
      }
      
      if (col.defaultValue && col.defaultValue.trim() !== '') {
        def += ` DEFAULT ${col.defaultValue}`;
      }
      
      return def;
    });
    
    ddl += columnDefs.join(',\n');
    ddl += '\n);\n';
    
    return ddl;
  }

  private async getTableColumns(tableName: string, owner: string): Promise<ColumnInfo[]> {
    if (!this.connection) {
      throw new Error('Not connected to database');
    }

    const query = `
      SELECT 
        column_name,
        data_type || 
        CASE 
          WHEN data_type IN ('VARCHAR2', 'CHAR', 'NVARCHAR2', 'NCHAR') THEN '(' || data_length || ')'
          WHEN data_type = 'NUMBER' AND data_precision IS NOT NULL THEN 
            '(' || data_precision || 
            CASE WHEN data_scale > 0 THEN ',' || data_scale ELSE '' END || ')'
          ELSE ''
        END AS data_type,
        nullable,
        data_default
      FROM all_tab_columns
      WHERE table_name = :tableName 
        AND owner = :owner
      ORDER BY column_id
    `;

    try {
      const result = await this.connection.execute(query, {
        tableName: tableName,
        owner: owner
      });

      return (result.rows || []).map(row => ({
        columnName: row[0],
        dataType: row[1],
        nullable: row[2],
        defaultValue: row[3] || ''
      }));
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
      throw error;
    }
  }
}
