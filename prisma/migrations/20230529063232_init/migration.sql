/*
  Warnings:

  - A unique constraint covering the columns `[roomId,type]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rooms_roomId_type_key" ON "Rooms"("roomId", "type");
