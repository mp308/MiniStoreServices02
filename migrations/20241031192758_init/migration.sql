/*
  Warnings:

  - The values [ship,contactadmin,failed] on the enum `payments_payment_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `order_status` ENUM('processing', 'completed', 'cancelled', 'shipping', 'contactadmin', 'failed') NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `payment_status` ENUM('pending', 'cancelled', 'completed') NULL;
