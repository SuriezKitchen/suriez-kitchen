#!/usr/bin/env node

/**
 * Export script for SQLite database
 * Exports all data from local.db to a JSON file
 * 
 * Usage: node scripts/export-data.js [output-file]
 * Default output: data-export.json
 */

import Database from "better-sqlite3";
import { writeFileSync } from "fs";
import { join } from "path";

const dbPath = "./local.db";
const outputFile = process.argv[2] || "data-export.json";

console.log("📦 Starting database export...");
console.log(`   Database: ${dbPath}`);
console.log(`   Output: ${outputFile}\n`);

try {
  // Open database
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Get all tables
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    )
    .all()
    .map((row) => row.name);

  console.log(`📋 Found ${tables.length} tables: ${tables.join(", ")}\n`);

  const exportData = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    tables: {},
  };

  // Export each table
  for (const tableName of tables) {
    console.log(`📤 Exporting ${tableName}...`);
    
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    exportData.tables[tableName] = rows;
    
    console.log(`   ✅ Exported ${rows.length} rows`);
  }

  // Write to file
  const outputPath = join(process.cwd(), outputFile);
  writeFileSync(outputPath, JSON.stringify(exportData, null, 2), "utf-8");

  // Summary
  const totalRows = Object.values(exportData.tables).reduce(
    (sum, rows) => sum + rows.length,
    0
  );

  console.log(`\n✅ Export completed successfully!`);
  console.log(`   Total rows exported: ${totalRows}`);
  console.log(`   Output file: ${outputPath}`);
  console.log(`\n💡 To import this data, run:`);
  console.log(`   npm run db:import ${outputFile}`);

  db.close();
} catch (error) {
  console.error("❌ Export failed:", error.message);
  process.exit(1);
}


