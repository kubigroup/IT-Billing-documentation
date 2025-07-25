import { DDLExporter } from './ddlExporter';

async function main(): Promise<void> {
  try {
    const exporter = new DDLExporter();
    await exporter.export();
    process.exit(0);
  } catch (error) {
    console.error('Application failed:', error);
    process.exit(1);
  }
}

// Run the application
main();
