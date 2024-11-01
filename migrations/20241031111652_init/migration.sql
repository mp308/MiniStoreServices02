/*
  Warnings:

  - Added the required column `status` to the `discounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `discounts` ADD COLUMN `status` DOUBLE NOT NULL;
