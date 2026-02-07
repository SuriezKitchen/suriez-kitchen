# Database Data Migration Guide

This guide explains how to export and import your local SQLite database data when setting up the project on a new machine.

## Overview

The project includes two scripts for migrating database data:

- **Export**: Saves all data from `local.db` to a JSON file
- **Import**: Restores data from a JSON file back into `local.db`

## Exporting Data

To export your current database data:

```bash
npm run db:export
```

This will create a `data-export.json` file in the project root containing all data from your database.

You can also specify a custom output filename:

```bash
npm run db:export my-backup.json
```

### What Gets Exported

The export includes all data from these tables:

- `admin_users` - Admin user accounts
- `categories` - Dish categories
- `dishes` - Dish entries
- `settings` - Application settings
- `social_links` - Social media links
- `videos` - YouTube video data

## Importing Data

To import data into a fresh database:

```bash
npm run db:import
```

Or specify a custom import file:

```bash
npm run db:import my-backup.json
```

### Important Notes

⚠️ **Warning**: The import script will **delete all existing data** in the target tables before importing. Make sure you have a backup if needed!

The import script will:

1. Clear existing data from each table
2. Import all rows from the export file
3. Preserve data types and relationships

## Setup on New MacBook

### Step 1: Export on Old Machine

On your current MacBook:

```bash
cd /path/to/suriez-kitchen
npm run db:export
```

This creates `data-export.json` with all your data.

### Step 2: Transfer the Export File

Copy `data-export.json` to your new MacBook using:

- AirDrop
- Cloud storage (iCloud, Dropbox, etc.)
- USB drive
- Email (if file is small enough)

### Step 3: Setup Project on New MacBook

1. Clone the repository:

   ```bash
   git clone https://github.com/SuriezKitchen/suriez-kitchen.git
   cd suriez-kitchen
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

4. Initialize the database schema:
   ```bash
   npm run db:push
   ```

### Step 4: Import Your Data

1. Copy `data-export.json` into the project directory

2. Import the data:

   ```bash
   npm run db:import data-export.json
   ```

3. Verify the import:
   ```bash
   npm run dev
   # Check that your data appears in the app
   ```

## Troubleshooting

### Export Fails

- **Error**: "Module compiled against different Node.js version"

  - **Solution**: Run `npm rebuild better-sqlite3`

- **Error**: "Database file not found"
  - **Solution**: Make sure you're in the project root directory

### Import Fails

- **Error**: "File not found"

  - **Solution**: Check that the export file exists and the path is correct

- **Error**: "Invalid export file format"

  - **Solution**: Make sure the JSON file is a valid export from the export script

- **Error**: "Table doesn't exist"
  - **Solution**: Run `npm run db:push` first to create the database schema

## Best Practices

1. **Regular Backups**: Export your data regularly, especially before major changes
2. **Version Control**: Don't commit `data-export.json` to git (it's in `.gitignore`)
3. **Secure Storage**: Export files may contain sensitive data (admin passwords, etc.)
4. **Test Imports**: Test the import process on a test database first if possible

## Alternative: Use Production Database

Instead of exporting/importing, you can point your local development to the production database:

1. Copy your production `DATABASE_URL` from Vercel/environment variables
2. Add it to your local `.env` file
3. The app will use the production database for local development

⚠️ **Warning**: Be careful not to make test changes that affect production data!
