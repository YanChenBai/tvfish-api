/*
  Warnings:

  - Added the required column `face` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rooms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "face" TEXT NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_Rooms" ("id", "name", "roomId", "type") SELECT "id", "name", "roomId", "type" FROM "Rooms";
DROP TABLE "Rooms";
ALTER TABLE "new_Rooms" RENAME TO "Rooms";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
