import fs from 'fs';
import path from 'path';

export class FileManager {
  constructor(private outputDir: string) {}

  async ensureOutputDirectory(): Promise<void> {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
        console.log(`Created output directory: ${this.outputDir}`);
      }
    } catch (error) {
      console.error('Error creating output directory:', error);
      throw error;
    }
  }

  async writeDDLFile(tableName: string, owner: string, ddl: string): Promise<void> {
    const fileName = `${owner}_${tableName}.sql`;
    const filePath = path.join(this.outputDir, fileName);
    
    try {
      // Clean up the DDL for better formatting
      const cleanDDL = this.formatDDL(ddl);
      
      fs.writeFileSync(filePath, cleanDDL, 'utf8');
      console.log(`DDL written to: ${filePath}`);
    } catch (error) {
      console.error(`Error writing DDL file for ${tableName}:`, error);
      throw error;
    }
  }

  private formatDDL(ddl: string): string {
    // Handle null or undefined DDL
    if (!ddl) {
      return '-- DDL content not available or empty\n';
    }
    
    // Basic DDL formatting
    return ddl
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*$/, ';\n') // Ensure semicolon at end with newline
      .trim();
  }

  async createSummaryFile(tableCount: number, successCount: number, failedTables: string[]): Promise<void> {
    const summaryPath = path.join(this.outputDir, 'export_summary.txt');
    
    const summary = [
      `DDL Export Summary`,
      `===================`,
      `Export Date: ${new Date().toISOString()}`,
      `Total Tables Found: ${tableCount}`,
      `Successfully Exported: ${successCount}`,
      `Failed Exports: ${tableCount - successCount}`,
      ``
    ];

    if (failedTables.length > 0) {
      summary.push(`Failed Tables:`);
      failedTables.forEach(table => summary.push(`- ${table}`));
    }

    try {
      fs.writeFileSync(summaryPath, summary.join('\n'), 'utf8');
      console.log(`Summary written to: ${summaryPath}`);
    } catch (error) {
      console.error('Error writing summary file:', error);
    }
  }
}
