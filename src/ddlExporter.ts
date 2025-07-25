import { config, validateConfig } from './config';
import { DatabaseConnection } from './database';
import { FileManager } from './fileManager';

export class DDLExporter {
  private db: DatabaseConnection;
  private fileManager: FileManager;

  constructor() {
    this.db = new DatabaseConnection(config.database);
    this.fileManager = new FileManager(config.outputDir);
  }

  async export(): Promise<void> {
    try {
      console.log('Starting DDL export process...');
      
      // Validate configuration
      validateConfig();
      
      // Ensure output directory exists
      await this.fileManager.ensureOutputDirectory();
      
      // Connect to database
      await this.db.connect();
      
      // Get list of tables
      console.log('Fetching table list...');
      const tables = await this.db.getTables();
      console.log(`Found ${tables.length} tables to export`);
      
      let successCount = 0;
      const failedTables: string[] = [];
      
      // Export DDL for each table
      for (const table of tables) {
        try {
          console.log(`Exporting DDL for ${table.owner}.${table.tableName}...`);
          const ddl = await this.db.getTableDDL(table.tableName, table.owner);
          await this.fileManager.writeDDLFile(table.tableName, table.owner, ddl);
          successCount++;
        } catch (error) {
          console.error(`Failed to export ${table.owner}.${table.tableName}:`, error);
          failedTables.push(`${table.owner}.${table.tableName}`);
        }
      }
      
      // Create summary file
      await this.fileManager.createSummaryFile(tables.length, successCount, failedTables);
      
      console.log(`\nExport completed!`);
      console.log(`- Total tables: ${tables.length}`);
      console.log(`- Successfully exported: ${successCount}`);
      console.log(`- Failed: ${failedTables.length}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      // Always disconnect from database
      await this.db.disconnect();
    }
  }
}
