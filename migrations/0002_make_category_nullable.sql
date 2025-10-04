-- Make category column nullable in dishes table
ALTER TABLE "dishes" ALTER COLUMN "category" DROP NOT NULL;
