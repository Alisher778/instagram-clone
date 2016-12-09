PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `email` VARCHAR(255), `fullName` VARCHAR(255), `userName` VARCHAR(255), `password` VARCHAR(255), `images` VARCHAR(255), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO "users" VALUES(1,'internet-docs@mail.ru','Alisher Musurmonov','ali778','sha1$e175d9f2$1$05705e6451db5f42ae91005e5e925d1acfdf165c','14811423897622.jpg','2016-12-07 20:26:29.795 +00:00','2016-12-07 20:26:29.795 +00:00');
CREATE TABLE `uploads` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `image` VARCHAR(255), `title` VARCHAR(255), `description` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO "uploads" VALUES(16,'14812187937932.jpg','','','2016-12-08 17:39:53.841 +00:00','2016-12-08 17:39:53.841 +00:00');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('users',1);
INSERT INTO "sqlite_sequence" VALUES('uploads',16);
COMMIT;