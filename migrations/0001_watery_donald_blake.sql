CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3B82F6',
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);