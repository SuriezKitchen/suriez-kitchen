CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`email` text,
	`is_active` integer DEFAULT true,
	`last_login_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_username_unique` ON `admin_users` (`username`);