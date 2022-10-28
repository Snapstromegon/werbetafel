CREATE TABLE IF NOT EXISTS "received_hooks" (
  "update_id" bigint,
  "data" json NOT NULL,
	PRIMARY KEY( update_id )
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" bigint,
  "is_bot" boolean,
  "first_name" text,
  "last_name" text,
  "username" text,
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS "messages" (
  "number" bigserial,
  "update_id" bigserial REFERENCES received_hooks(update_id),
	"message_id" bigint,
	"from_user_id" bigint REFERENCES users(id),
	"chat_id" bigint,
	"date" timestamp,
  "text" text,
  "hidden" boolean DEFAULT false,
	PRIMARY KEY( message_id )
);

CREATE TABLE IF NOT EXISTS "photos" (
  "file_id" text,
  "file_unique_id" text,
  "file_size" integer,
  "width" integer,
  "height" integer,
	"message_id" bigint REFERENCES messages(message_id),
  PRIMARY KEY(file_unique_id)
);

CREATE TABLE IF NOT EXISTS "animations" (
  "file_id" text,
  "file_unique_id" text,
  "file_size" integer,
  "file_name" text,
  "mime_type" text,
  "duration" integer,
  "width" integer,
  "height" integer,
	"message_id" bigint REFERENCES messages(message_id),
  PRIMARY KEY(file_unique_id)
);

CREATE TABLE IF NOT EXISTS "video_notes" (
  "file_id" text,
  "file_unique_id" text,
  "file_size" integer,
  "duration" integer,
  "length" integer,
	"message_id" bigint REFERENCES messages(message_id),
  PRIMARY KEY(file_unique_id)
);

CREATE TABLE IF NOT EXISTS "videos" (
  "file_id" text,
  "file_unique_id" text,
  "file_size" integer,
  "mime_type" text,
  "duration" integer,
  "width" integer,
  "height" integer,
	"message_id" bigint REFERENCES messages(message_id),
  PRIMARY KEY(file_unique_id)
);
