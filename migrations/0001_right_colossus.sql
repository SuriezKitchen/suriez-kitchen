CREATE TABLE "local_videos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"video_url" text NOT NULL,
	"duration" text NOT NULL,
	"views" text DEFAULT '0',
	"likes" text DEFAULT '0',
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dishes" ALTER COLUMN "category" DROP NOT NULL;