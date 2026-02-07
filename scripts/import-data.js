#!/usr/bin/env node

/**
 * Import script for SQLite database
 * Imports data from a JSON export file into local.db
 * 
 * Usage: node scripts/import-data.js [input-file]
 * Default input: data-export.json
 * 
 * WARNING: This will replace existing data in the database!
 */

import Database from "better-sqlite3";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dbPath = "./local.db";
const inputFile = process.argv[2] || "data-export.json";

console.log("📥 Starting database import...");
console.log(`   Database: ${dbPath}`);
console.log(`   Input: ${inputFile}\n`);

try {
  // Check if input file exists
  const inputPath = join(process.cwd(), inputFile);
  if (!existsSync(inputPath)) {
    console.error(`❌ Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  // Read and parse JSON
  console.log("📖 Reading export file...");
  const fileContent = readFileSync(inputPath, "utf-8");
  const exportData = JSON.parse(fileContent);

  if (!exportData.tables || typeof exportData.tables !== "object") {
    console.error("❌ Error: Invalid export file format");
    process.exit(1);
  }

  console.log(`   Export date: ${exportData.exportDate || "Unknown"}`);
  console.log(`   Version: ${exportData.version || "Unknown"}\n`);

  // Open database
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Get existing tables
  const existingTables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all()
    .map((row) => row.name);

  console.log(`📋 Found ${existingTables.length} tables in database\n`);

  // Import each table
  let totalImported = 0;
  const tables = Object.keys(exportData.tables);

  for (const tableName of tables) {
    if (!existingTables.includes(tableName)) {
      console.log(`⚠️  Skipping ${tableName} (table doesn't exist in database)`);
      continue;
    }

    const rows = exportData.tables[tableName];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`⏭️  Skipping ${tableName} (no data to import)`);
      continue;
    }

    console.log(`📥 Importing ${tableName}...`);

    // Get table schema to determine columns
    const tableInfo = db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all();
    const columns = tableInfo.map((col) => col.name);

    // Clear existing data (optional - you might want to merge instead)
    const clearStmt = db.prepare(`DELETE FROM ${tableName}`);
    clearStmt.run();

    // Prepare insert statement
    const placeholders = columns.map(() => "?").join(", ");
    const insertStmt = db.prepare(
      `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`
    );

    // Import rows in a transaction
    const importTransaction = db.transaction((rowsToImport) => {
      for (const row of rowsToImport) {
        const values = columns.map((col) => {
          // Handle null values
          if (row[col] === null || row[col] === undefined) {
            return null;
          }
          // Convert boolean to integer for SQLite
          if (typeof row[col] === "boolean") {
            return row[col] ? 1 : 0;
          }
          return row[col];
        });
        insertStmt.run(...values);
      }
    });

    importTransaction(rows);
    totalImported += rows.length;
    console.log(`   ✅ Imported ${rows.length} rows`);
  }

  console.log(`\n✅ Import completed successfully!`);
  console.log(`   Total rows imported: ${totalImported}`);
  console.log(`   Tables imported: ${tables.length}`);

  db.close();
} catch (error) {
  console.error("❌ Import failed:", error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}


