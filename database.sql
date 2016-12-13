PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `email` VARCHAR(255), `fullName` VARCHAR(255), `userName` VARCHAR(255), `password` VARCHAR(255), `images` VARCHAR(255), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE `uploads` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `image` VARCHAR(255), `title` VARCHAR(255), `description` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE `comments` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `comment` TEXT, `uploadId` INTEGER REFERENCES `uploads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('uploads',7);
INSERT INTO "sqlite_sequence" VALUES('comments',42);
COMMIT;
