/*
  Warnings:

  - A unique constraint covering the columns `[projectId,prNumber]` on the table `Preview` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Preview_projectId_prNumber_key" ON "Preview"("projectId", "prNumber");
