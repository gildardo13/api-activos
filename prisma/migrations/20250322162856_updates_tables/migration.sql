-- AlterTable
CREATE SEQUENCE level_level_seq;
ALTER TABLE "Level" ALTER COLUMN "level" SET DEFAULT nextval('level_level_seq');
ALTER SEQUENCE level_level_seq OWNED BY "Level"."level";
