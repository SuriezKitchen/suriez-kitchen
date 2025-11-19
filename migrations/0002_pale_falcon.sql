CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" text NOT NULL,
	"image_url" text NOT NULL,
	"category" text NOT NULL,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp NOT NULL
);
