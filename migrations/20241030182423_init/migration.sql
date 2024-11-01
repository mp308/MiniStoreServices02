/*
  Warnings:

  - You are about to drop the column `category` on the `product` table. All the data in the column will be lost.
  - Added the required column `Nutritional_value` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taste` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `category`,
    ADD COLUMN `CategoryID` INTEGER NULL,
    ADD COLUMN `Nutritional_value` VARCHAR(191) NOT NULL,
    ADD COLUMN `size` DOUBLE NOT NULL,
    ADD COLUMN `taste` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `categories` (
    `CategoriesID` INTEGER NOT NULL AUTO_INCREMENT,
    `CategoriesName` VARCHAR(255) NULL,

    PRIMARY KEY (`CategoriesID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_CategoryID_fkey` FOREIGN KEY (`CategoryID`) REFERENCES `categories`(`CategoriesID`) ON DELETE SET NULL ON UPDATE CASCADE;
