import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1759917726859 implements MigrationInterface {
    name = 'InitMigration1759917726859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fines" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "amount" numeric(10,2) NOT NULL, "status" character varying NOT NULL DEFAULT 'unpaid', "borrow_id" integer, CONSTRAINT "REL_e3c3efbd7dc285ea1e95523460" UNIQUE ("borrow_id"), CONSTRAINT "PK_b706344bc8943ab7a88ed5d312e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."borrows_status_enum" AS ENUM('borrowed', 'returned', 'late')`);
        await queryRunner.query(`CREATE TABLE "borrows" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "borrow_date" date NOT NULL DEFAULT ('now'::text)::date, "due_date" date NOT NULL, "return_date" date, "status" "public"."borrows_status_enum" NOT NULL DEFAULT 'borrowed', "reminder_sent_at" date, "user_id" integer, "book_id" integer, CONSTRAINT "PK_69f3a91fbbed0a8a2ce30efbce1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "books" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(50) NOT NULL, "author" character varying(50) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "is_available" boolean NOT NULL DEFAULT true, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3cd818eaf734a9d8814843f1197" UNIQUE ("title"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."book_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "book_requests" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying(50) NOT NULL, "status" "public"."book_requests_status_enum" NOT NULL DEFAULT 'pending', "user_id" integer, "book_id" integer, CONSTRAINT "PK_8534d5b32d46134b250fa8dcef5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "chat_id" integer, "sender_id" integer, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chats" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "from_id" integer, "to_id" integer, CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(100), "is_active" boolean NOT NULL DEFAULT true, "provider_id" character varying(255), "oauth_provider" character varying(255), "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying(50) NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fines" ADD CONSTRAINT "FK_e3c3efbd7dc285ea1e955234606" FOREIGN KEY ("borrow_id") REFERENCES "borrows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrows" ADD CONSTRAINT "FK_c9b0c21ce0c14b78c266e304622" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "borrows" ADD CONSTRAINT "FK_4338f57a03c1b0cd47915d47664" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_requests" ADD CONSTRAINT "FK_b01917928d21503f2d5a8bda22a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "book_requests" ADD CONSTRAINT "FK_11fd1e0b4cb8f8e5b74948f0526" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_1008094c85948e59f4c8e5ccc5e" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_d5695cbb122b8867b25d3dd1887" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_d5695cbb122b8867b25d3dd1887"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_1008094c85948e59f4c8e5ccc5e"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`);
        await queryRunner.query(`ALTER TABLE "book_requests" DROP CONSTRAINT "FK_11fd1e0b4cb8f8e5b74948f0526"`);
        await queryRunner.query(`ALTER TABLE "book_requests" DROP CONSTRAINT "FK_b01917928d21503f2d5a8bda22a"`);
        await queryRunner.query(`ALTER TABLE "borrows" DROP CONSTRAINT "FK_4338f57a03c1b0cd47915d47664"`);
        await queryRunner.query(`ALTER TABLE "borrows" DROP CONSTRAINT "FK_c9b0c21ce0c14b78c266e304622"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP CONSTRAINT "FK_e3c3efbd7dc285ea1e955234606"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "chats"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "book_requests"`);
        await queryRunner.query(`DROP TYPE "public"."book_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "books"`);
        await queryRunner.query(`DROP TABLE "borrows"`);
        await queryRunner.query(`DROP TYPE "public"."borrows_status_enum"`);
        await queryRunner.query(`DROP TABLE "fines"`);
    }

}
