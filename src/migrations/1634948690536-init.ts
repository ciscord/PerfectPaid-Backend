import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1634948690536 implements MigrationInterface {
  name = 'init1634948690536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "astra_account" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" character varying NOT NULL, "official_name" character varying, "name" character varying, "nickname" character varying, "mask" character varying NOT NULL, "institution_name" character varying, "institution_logo" character varying, "type" character varying NOT NULL, "subtype" character varying NOT NULL, "current_balance" numeric, "available_balance" numeric, "last_balance_update_on" TIMESTAMP, "connection_status" character varying, "is_primary" boolean NOT NULL DEFAULT false, "user_id" character varying, CONSTRAINT "PK_23f19a00a909f038748210e8370" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_status_enum" AS ENUM('connected', 'pending', 'astra_setup_incomplete')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" character varying NOT NULL, "internal_id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "preferred_name" character varying, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "middle_name" character varying, "picture" character varying, "address1" character varying NOT NULL, "address2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "postal_code" character varying NOT NULL, "dob" character varying NOT NULL, "ssn" character varying NOT NULL, "status" "user_status_enum" NOT NULL DEFAULT 'astra_setup_incomplete', "astra_user_intent_id" character varying, "astra_user_id" character varying, "astra_redirect_uri" character varying, "access_token" character varying, "refresh_token" character varying, "refresh_date" date, "monthly_income" integer, "primary_account_id" character varying, CONSTRAINT "UQ_8f415738b6b8afd87ebc869829a" UNIQUE ("internal_id"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_e10ded677cb91627b91864e2620" UNIQUE ("astra_user_intent_id"), CONSTRAINT "UQ_04330cbd244c4facea8be398b99" UNIQUE ("astra_user_id"), CONSTRAINT "REL_5b97b27ba4bca8adcfa33fb060" UNIQUE ("primary_account_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "alert_settings" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "settings" jsonb NOT NULL, "user_id" character varying, CONSTRAINT "REL_24ad32484b245d33bf6944990f" UNIQUE ("user_id"), CONSTRAINT "PK_9f318561ba481069150ca1fff62" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "alert_type_enum" AS ENUM('paid_too_much', 'owe', 'bill_split_reject', 'bill_split_request', 'transfer_request', 'transfer_reject')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alert" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "alert_type_enum" NOT NULL, "resource_id" character varying NOT NULL, CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "astra_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" character varying NOT NULL, "name" character varying NOT NULL, "merchant_name" character varying, "amount" numeric, "date" date NOT NULL, "category" character varying NOT NULL, "category_id" character varying NOT NULL, "location_address" character varying, "location_city" character varying, "location_state" character varying, "location_store_number" character varying, "location_zip" character varying, "pending" boolean NOT NULL, "user_id" character varying, "account_id" character varying, CONSTRAINT "PK_02833ff466d199459121b0870d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "connection_status_enum" AS ENUM('pending', 'accepted', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "connection" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "user_one_id" integer, "user_two_id" integer, "preferred_name" character varying, "receiver" character varying, "status" "connection_status_enum" NOT NULL DEFAULT 'pending', "sender_user_internal_id" integer, "invited_user_internal_id" integer, CONSTRAINT "UQ_0a4f9a4e0eed2688617e97395ac" UNIQUE ("sender_user_internal_id", "receiver"), CONSTRAINT "UQ_cd17466dd587f480b180b8b0279" UNIQUE ("user_one_id", "user_two_id"), CONSTRAINT "CHK_b09cc3af0b7a79e353c390eb01" CHECK ("user_one_id" < "user_two_id" OR ("user_one_id" is null and "user_two_id" is null)), CONSTRAINT "PK_be611ce8b8cf439091c82a334b2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_category" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "icon_url" character varying NOT NULL, CONSTRAINT "PK_fd430c064880ee8c284586da16c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "predicted_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "amount" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "transaction_series_id" uuid, CONSTRAINT "UQ_ab7a768ee5be13f4a0cddcfbde8" UNIQUE ("transaction_series_id", "date"), CONSTRAINT "PK_6d77ecf924303ebd166d6071f96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_name" character varying NOT NULL, "plaid_merchant_name" character varying, "category_id" character varying, "parent_id" integer, "weight" numeric, "primary_color" character varying, "merchant_url" character varying, "merchant_logo" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a3850e0537d869734fc9bff5d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "split_bill_transfer_timing_enum" AS ENUM('one_time', 'after_bill_paid', 'fixed_date')`,
    );
    await queryRunner.query(
      `CREATE TYPE "split_bill_split_method_enum" AS ENUM('even', 'percentage', 'fixed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "split_bill_repeat_until_enum" AS ENUM('manually_stopped', 'number_of_transfers')`,
    );
    await queryRunner.query(
      `CREATE TABLE "split_bill" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "transfer_timing" "split_bill_transfer_timing_enum" NOT NULL DEFAULT 'after_bill_paid', "due_date" date, "split_method" "split_bill_split_method_enum" NOT NULL DEFAULT 'even', "amount" integer NOT NULL DEFAULT '0', "accepted" boolean NOT NULL DEFAULT false, "tip" boolean NOT NULL DEFAULT false, "tip_amount" integer NOT NULL DEFAULT '250', "repeat_until" "split_bill_repeat_until_enum" NOT NULL DEFAULT 'manually_stopped', "repeat_until_number" integer NOT NULL DEFAULT '0', "user_id" character varying, "user_astra_account_id" character varying, "user_to_split_with_id" character varying, "user_to_split_with_astra_account_id" character varying, "connection_id" integer, "transaction_series_id" uuid, CONSTRAINT "PK_135dfc809889ba82a653cc90d63" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" character varying NOT NULL, "sub_cat_1" character varying NOT NULL, "sub_cat_2" character varying NOT NULL, "sub_cat_3" character varying NOT NULL, "sub_cat_4" character varying NOT NULL, "recurring_group" character varying NOT NULL, "budget_group" character varying NOT NULL, "weight" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "consumer_preference_series" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "series_nickname" character varying, "is_recurring" boolean, "is_savings" boolean, "is_income" boolean, "amount" integer, "frequency" character varying, "next_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" character varying, "category_id" character varying, CONSTRAINT "PK_8c5673a1c8b070618e64a2353c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_series" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "series_name" character varying NOT NULL, "is_income" boolean NOT NULL, "is_recurring" boolean NOT NULL, "recurring_score" numeric NOT NULL, "recurring_confidence" character varying NOT NULL, "is_split" boolean NOT NULL, "frequency" character varying, "last_transaction_date" date, "merchant_id" uuid, "user_id" character varying, "consumer_preference_series_id" uuid, "category_id" character varying, CONSTRAINT "REL_725ce069af92b36aebaa4b516f" UNIQUE ("consumer_preference_series_id"), CONSTRAINT "PK_1c66f20d54313abd52de7fd93aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categorized_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plaid_transaction_id" character varying NOT NULL, "create_date" date NOT NULL, "xfer_type" character varying NOT NULL, "tx_city" character varying NOT NULL, "tx_region" character varying NOT NULL, "tx_postal_code" character varying NOT NULL, "tx_lat" numeric, "tx_lon" numeric, "geohash" character varying, "is_wp" boolean NOT NULL, "is_pending" boolean NOT NULL, "is_self_send" boolean NOT NULL, "transaction_description" character varying NOT NULL, "payee" character varying NOT NULL, "payment_method" character varying NOT NULL, "reason" character varying NOT NULL, "iso_currency_code" character varying NOT NULL, "amount" numeric(28,10), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" character varying, "account_id" character varying, "merchant_id" uuid, "transaction_series_id" uuid, "category_id" character varying, CONSTRAINT "PK_e891edde67ea7390ec366225241" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_editors_enum" AS ENUM('owner', 'everyone')`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_requesters_enum" AS ENUM('owner', 'everyone')`,
    );
    await queryRunner.query(
      `CREATE TYPE "group_delete_policy_enum" AS ENUM('manual', 'single_bill')`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "editors" "group_editors_enum" NOT NULL DEFAULT 'owner', "requesters" "group_requesters_enum" NOT NULL DEFAULT 'owner', "delete_policy" "group_delete_policy_enum" NOT NULL DEFAULT 'manual', "owner_id" character varying, "category_id" integer, CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "settled_at" TIMESTAMP, "group_id" integer, "transaction_id" uuid, CONSTRAINT "REL_d03151485aae0fb2227f3b1fb0" UNIQUE ("transaction_id"), CONSTRAINT "PK_04853c69d3c00ceeda87ac16044" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaid_transaction" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "plaid_transaction_id" character varying NOT NULL, "account_owner" character varying, "pending_transaction_id" character varying, "pending" boolean NOT NULL, "payment_channel" character varying NOT NULL, "payment_meta" jsonb NOT NULL, "name" character varying NOT NULL, "merchant_name" character varying, "location" jsonb NOT NULL, "authorized_date" date, "date" date NOT NULL, "plaid_category_id" character varying, "category" character varying, "subcategory" character varying, "unofficial_currency_code" character varying, "iso_currency_code" character varying, "amount" numeric(28,10) NOT NULL, "type" character varying NOT NULL, "transaction_code" character varying, "plaid_account_id" integer, CONSTRAINT "UQ_e48218011d8aa47dea83ac3a791" UNIQUE ("plaid_transaction_id"), CONSTRAINT "PK_c908236a9e6d07f3cb3dcbb4c6f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaid_item" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "plaid_access_token" character varying NOT NULL, "plaid_item_id" character varying NOT NULL, "plaid_institution_id" character varying NOT NULL, "status" character varying NOT NULL, CONSTRAINT "UQ_5d7ff877cc79538224cc7caac16" UNIQUE ("plaid_access_token"), CONSTRAINT "UQ_2427cdd08e8e3485e47aa3f89b4" UNIQUE ("plaid_item_id"), CONSTRAINT "PK_74131b4c5292d7f6f1a7ad168e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaid_account" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "plaid_account_id" character varying NOT NULL, "name" character varying NOT NULL, "mask" character varying NOT NULL, "official_name" character varying, "current_balance" numeric(28,10), "available_balance" numeric(28,10), "iso_currency_code" character varying, "limit" character varying, "unofficial_currency_code" character varying, "type" character varying NOT NULL, "subtype" character varying NOT NULL, "plaid_item_id" integer, CONSTRAINT "UQ_fe2355dae9fa59fceb18f179eba" UNIQUE ("plaid_account_id"), CONSTRAINT "PK_3759c79c331bceeb940fbc58d92" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plaid_category" ("plaid_category_id" character varying NOT NULL, "plaid_category_name" character varying NOT NULL, "category_id" character varying, CONSTRAINT "PK_567e093242dd292d56b87989c18" PRIMARY KEY ("plaid_category_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "split_bill_transaction_status_enum" AS ENUM('complete', 'processing', 'failed', 'pending_connection')`,
    );
    await queryRunner.query(
      `CREATE TABLE "split_bill_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "astra_routine_id" character varying, "status" "split_bill_transaction_status_enum" NOT NULL, "split_bill_id" integer, "categorized_transaction_id" uuid, CONSTRAINT "UQ_38b1b7d65e22f2f8c36ea2b59b3" UNIQUE ("astra_routine_id"), CONSTRAINT "PK_edf7b7e5f90d65990d1b282f435" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category_search_term" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "search_term" character varying NOT NULL, "category_id" character varying, CONSTRAINT "PK_daee5f3ed7519fc053eada8888a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "consumer_preference_transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_income" boolean NOT NULL, "user_id" character varying, "transaction_id" uuid, CONSTRAINT "REL_21d7cded534d22642e7e682d47" UNIQUE ("transaction_id"), CONSTRAINT "PK_f5b052c1cf521731f973557210b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "consumer_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "series_merchant_nickname" character varying, "category_id" character varying, "is_recurring_user" boolean, "is_savings_user" boolean, "is_income_user" boolean, "series_amount_user" numeric(28,10), "series_frequency_user" character varying, "next_date_user" date NOT NULL, "primary_account_id" character varying, "primary_account_id_user" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" character varying, "transaction_series_id" uuid, "categorized_transaction_id" uuid, CONSTRAINT "PK_958474b9e5ff0f2093721a15b5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_search_term" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "search_term" character varying NOT NULL, "merchant_id" uuid, CONSTRAINT "PK_e63e2810d42e7b3dc8f2dbfc644" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "zip_code" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "coordinates" geometry(Point) NOT NULL, CONSTRAINT "PK_23e29929d32a535be7820652aad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be0d7e177d3f5037bea1ca841b" ON "zip_code" USING GiST ("coordinates") `,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_zip_code" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unique_users" integer NOT NULL, "merchant_id" uuid, "zip_code_id" uuid, CONSTRAINT "PK_127d9650121c8305e120c1da709" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "well_paid_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pending_transaction_id" character varying NOT NULL, "is_pending" boolean NOT NULL, "authorize_date" character varying, "date" character varying, "transfer_type" character varying NOT NULL, "transfer_free" integer NOT NULL, "frequency" character varying NOT NULL, "transfer_cadence" character varying NOT NULL, "payment_reference" character varying NOT NULL, "amount" integer NOT NULL, "funding_currency" character varying NOT NULL, "iso_currency_code" character varying NOT NULL, "exchange_rate" character varying NOT NULL, "account_name" character varying NOT NULL, "official_name" character varying, "account_type" character varying NOT NULL, "account_subtype" character varying, "transaction_postal_code" character varying, "ach_ppd_id" character varying, "payee" character varying NOT NULL, "request_id" character varying NOT NULL, "reason" character varying, "transaction_description" character varying NOT NULL, "merchant_name" character varying, "transaction_error_type" character varying NOT NULL, "transaction_error_code" character varying NOT NULL, "transaction" character varying NOT NULL, "transaction_display_message" character varying, "transaction_request_id" character varying NOT NULL, "transaction_causes" character varying NOT NULL, "transaction_status" character varying NOT NULL, "category_id" character varying NOT NULL, "transaction_subcategory" character varying NOT NULL, "subcat_code" character varying, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "plaid_transaction_id" integer, CONSTRAINT "REL_08ebff2995dbdf91eb6ae41100" UNIQUE ("plaid_transaction_id"), CONSTRAINT "PK_369b42897fc1c84ecb483d55727" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "recurring_transfer_type_enum" AS ENUM('send', 'request')`,
    );
    await queryRunner.query(
      `CREATE TYPE "recurring_transfer_status_enum" AS ENUM('active', 'done', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "recurring_transfer_frequency_enum" AS ENUM('one_time', 'weekly', 'monthly')`,
    );
    await queryRunner.query(
      `CREATE TYPE "recurring_transfer_repeat_until_enum" AS ENUM('manually_stopped', 'number_of_transfers')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recurring_transfer" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "recurring_transfer_type_enum" NOT NULL, "status" "recurring_transfer_status_enum" NOT NULL DEFAULT 'active', "description" character varying NOT NULL, "amount" numeric(28,10) NOT NULL, "next_date" date, "frequency" "recurring_transfer_frequency_enum" NOT NULL, "repeat_until" "recurring_transfer_repeat_until_enum" NOT NULL DEFAULT 'manually_stopped', "repeat_until_number" integer NOT NULL DEFAULT '0', "from_id" character varying, "to_id" character varying, "astra_account_id" character varying, CONSTRAINT "PK_85f0abb169065836b6b58a509b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "transfer_type_enum" AS ENUM('send', 'request')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfer" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "type" "transfer_type_enum" NOT NULL, "description" character varying NOT NULL, "amount" numeric(28,10) NOT NULL, "astra_routine_id" character varying NOT NULL, "from_id" character varying, "to_id" character varying, "astra_account_id" character varying, "recurring_transfer_id" integer, CONSTRAINT "UQ_7462610e6154f2e4200d425db83" UNIQUE ("astra_routine_id"), CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members_user" ("group_id" integer NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_14edc4ec69d805d8ea2133f5d9f" PRIMARY KEY ("group_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0d39e3852b97d614b31e41139d" ON "group_members_user" ("group_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96f77cf0895b2fd332b12bd96b" ON "group_members_user" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_account" ADD CONSTRAINT "FK_647cea61802de912141648133dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_5b97b27ba4bca8adcfa33fb0603" FOREIGN KEY ("primary_account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_settings" ADD CONSTRAINT "FK_24ad32484b245d33bf6944990f1" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_transaction" ADD CONSTRAINT "FK_529edea80a50c6a96771a7a9904" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_transaction" ADD CONSTRAINT "FK_165017b4950276d1451cf5a316b" FOREIGN KEY ("account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connection" ADD CONSTRAINT "FK_2e96dfd04d9e56cd1f936a4bfd5" FOREIGN KEY ("sender_user_internal_id") REFERENCES "user"("internal_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connection" ADD CONSTRAINT "FK_def7dd0900fca3e9118ae769da4" FOREIGN KEY ("invited_user_internal_id") REFERENCES "user"("internal_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "predicted_transaction" ADD CONSTRAINT "FK_1d0b1a47af3d8616c60a4583fc7" FOREIGN KEY ("transaction_series_id") REFERENCES "transaction_series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_056ab9808f09e69f4719954ff14" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_d5fcc975228a90bb9bd8f05a23a" FOREIGN KEY ("user_astra_account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_a8ca417dbec8bcb01712a0ff3cc" FOREIGN KEY ("user_to_split_with_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_803141bfa6aab820bdb312393fa" FOREIGN KEY ("user_to_split_with_astra_account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_f6e8d2a3dd336294769d3d07372" FOREIGN KEY ("connection_id") REFERENCES "connection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" ADD CONSTRAINT "FK_39ea389c7ae810f689155a7a250" FOREIGN KEY ("transaction_series_id") REFERENCES "transaction_series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_series" ADD CONSTRAINT "FK_cb451135bccf280ed0b89329893" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_series" ADD CONSTRAINT "FK_0f8a721563c5cae1964e1dcb760" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" ADD CONSTRAINT "FK_593009c5462d6b00f3801a51a62" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" ADD CONSTRAINT "FK_19a4fabc4493f4e9efd2b3bff83" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" ADD CONSTRAINT "FK_725ce069af92b36aebaa4b516fb" FOREIGN KEY ("consumer_preference_series_id") REFERENCES "consumer_preference_series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" ADD CONSTRAINT "FK_9b592c80d716d704d2b25a2e583" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" ADD CONSTRAINT "FK_3747c66354f4643c130bc8eb381" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" ADD CONSTRAINT "FK_2309008b3910d3d9465205f4092" FOREIGN KEY ("account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" ADD CONSTRAINT "FK_ff71572663bb1a6bd2629d6dbdc" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" ADD CONSTRAINT "FK_54468b0401b63c275377e13e0bf" FOREIGN KEY ("transaction_series_id") REFERENCES "transaction_series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" ADD CONSTRAINT "FK_91df1227d2d09bed768b5b6316b" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_26d387f3e8de5b59428adbbc828" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" ADD CONSTRAINT "FK_fd430c064880ee8c284586da16c" FOREIGN KEY ("category_id") REFERENCES "group_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_transaction" ADD CONSTRAINT "FK_70df6ab870d632a1c9323f4ea71" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_transaction" ADD CONSTRAINT "FK_d03151485aae0fb2227f3b1fb0f" FOREIGN KEY ("transaction_id") REFERENCES "categorized_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_transaction" ADD CONSTRAINT "FK_e8ad09643726107723bc9dca567" FOREIGN KEY ("plaid_account_id") REFERENCES "plaid_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_account" ADD CONSTRAINT "FK_af7e08dd5dbd5e711a4bf21f8dd" FOREIGN KEY ("plaid_item_id") REFERENCES "plaid_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_category" ADD CONSTRAINT "FK_178f0d265f2d83314d1177c2312" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill_transaction" ADD CONSTRAINT "FK_6ee0885f515bd1fbd8e8ac57691" FOREIGN KEY ("split_bill_id") REFERENCES "split_bill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill_transaction" ADD CONSTRAINT "FK_c40f613c5e0c84078d0e78338e8" FOREIGN KEY ("categorized_transaction_id") REFERENCES "categorized_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_search_term" ADD CONSTRAINT "FK_ffefcd13b0d55f32b1d2ca73ab9" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_transaction" ADD CONSTRAINT "FK_b2c6fcb8b333f2c9ccae79d98f6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_transaction" ADD CONSTRAINT "FK_21d7cded534d22642e7e682d471" FOREIGN KEY ("transaction_id") REFERENCES "categorized_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" ADD CONSTRAINT "FK_1dc2dace02df310789c55c4f773" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" ADD CONSTRAINT "FK_aece5539c58da69ad5d0c23df5d" FOREIGN KEY ("transaction_series_id") REFERENCES "transaction_series"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" ADD CONSTRAINT "FK_c65a8ea6658a11212ce6fa68a70" FOREIGN KEY ("categorized_transaction_id") REFERENCES "categorized_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_search_term" ADD CONSTRAINT "FK_3bec9fc2b98e39b0fe21d1af0e2" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_zip_code" ADD CONSTRAINT "FK_574c713c0189cdcfeb5ab770801" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_zip_code" ADD CONSTRAINT "FK_7482ed9c0e694437179c58b889a" FOREIGN KEY ("zip_code_id") REFERENCES "zip_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "well_paid_transaction" ADD CONSTRAINT "FK_08ebff2995dbdf91eb6ae41100b" FOREIGN KEY ("plaid_transaction_id") REFERENCES "plaid_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" ADD CONSTRAINT "FK_a2840d4498ca8ab60faa3d4570d" FOREIGN KEY ("from_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" ADD CONSTRAINT "FK_1e892017bd7be601f017bb48639" FOREIGN KEY ("to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" ADD CONSTRAINT "FK_70a030e8957127295c3ea4a32ee" FOREIGN KEY ("astra_account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" ADD CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496" FOREIGN KEY ("from_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" ADD CONSTRAINT "FK_0751309c66e97eac9ef11493623" FOREIGN KEY ("to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" ADD CONSTRAINT "FK_08ea1a174b77d4830586f3d5904" FOREIGN KEY ("astra_account_id") REFERENCES "astra_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" ADD CONSTRAINT "FK_61b576f801c003b9abad0832f84" FOREIGN KEY ("recurring_transfer_id") REFERENCES "recurring_transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_0d39e3852b97d614b31e41139d2" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_96f77cf0895b2fd332b12bd96b8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_96f77cf0895b2fd332b12bd96b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_0d39e3852b97d614b31e41139d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_61b576f801c003b9abad0832f84"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_08ea1a174b77d4830586f3d5904"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_0751309c66e97eac9ef11493623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_76bdfed1a7eb27c6d8ecbb73496"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" DROP CONSTRAINT "FK_70a030e8957127295c3ea4a32ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" DROP CONSTRAINT "FK_1e892017bd7be601f017bb48639"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transfer" DROP CONSTRAINT "FK_a2840d4498ca8ab60faa3d4570d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "well_paid_transaction" DROP CONSTRAINT "FK_08ebff2995dbdf91eb6ae41100b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_zip_code" DROP CONSTRAINT "FK_7482ed9c0e694437179c58b889a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_zip_code" DROP CONSTRAINT "FK_574c713c0189cdcfeb5ab770801"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_search_term" DROP CONSTRAINT "FK_3bec9fc2b98e39b0fe21d1af0e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" DROP CONSTRAINT "FK_c65a8ea6658a11212ce6fa68a70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" DROP CONSTRAINT "FK_aece5539c58da69ad5d0c23df5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference" DROP CONSTRAINT "FK_1dc2dace02df310789c55c4f773"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_transaction" DROP CONSTRAINT "FK_21d7cded534d22642e7e682d471"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_transaction" DROP CONSTRAINT "FK_b2c6fcb8b333f2c9ccae79d98f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_search_term" DROP CONSTRAINT "FK_ffefcd13b0d55f32b1d2ca73ab9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill_transaction" DROP CONSTRAINT "FK_c40f613c5e0c84078d0e78338e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill_transaction" DROP CONSTRAINT "FK_6ee0885f515bd1fbd8e8ac57691"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_category" DROP CONSTRAINT "FK_178f0d265f2d83314d1177c2312"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_account" DROP CONSTRAINT "FK_af7e08dd5dbd5e711a4bf21f8dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plaid_transaction" DROP CONSTRAINT "FK_e8ad09643726107723bc9dca567"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_transaction" DROP CONSTRAINT "FK_d03151485aae0fb2227f3b1fb0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_transaction" DROP CONSTRAINT "FK_70df6ab870d632a1c9323f4ea71"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_fd430c064880ee8c284586da16c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group" DROP CONSTRAINT "FK_26d387f3e8de5b59428adbbc828"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" DROP CONSTRAINT "FK_91df1227d2d09bed768b5b6316b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" DROP CONSTRAINT "FK_54468b0401b63c275377e13e0bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" DROP CONSTRAINT "FK_ff71572663bb1a6bd2629d6dbdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" DROP CONSTRAINT "FK_2309008b3910d3d9465205f4092"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categorized_transaction" DROP CONSTRAINT "FK_3747c66354f4643c130bc8eb381"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" DROP CONSTRAINT "FK_9b592c80d716d704d2b25a2e583"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" DROP CONSTRAINT "FK_725ce069af92b36aebaa4b516fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" DROP CONSTRAINT "FK_19a4fabc4493f4e9efd2b3bff83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_series" DROP CONSTRAINT "FK_593009c5462d6b00f3801a51a62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_series" DROP CONSTRAINT "FK_0f8a721563c5cae1964e1dcb760"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consumer_preference_series" DROP CONSTRAINT "FK_cb451135bccf280ed0b89329893"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_39ea389c7ae810f689155a7a250"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_f6e8d2a3dd336294769d3d07372"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_803141bfa6aab820bdb312393fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_a8ca417dbec8bcb01712a0ff3cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_d5fcc975228a90bb9bd8f05a23a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "split_bill" DROP CONSTRAINT "FK_056ab9808f09e69f4719954ff14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "predicted_transaction" DROP CONSTRAINT "FK_1d0b1a47af3d8616c60a4583fc7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connection" DROP CONSTRAINT "FK_def7dd0900fca3e9118ae769da4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connection" DROP CONSTRAINT "FK_2e96dfd04d9e56cd1f936a4bfd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_transaction" DROP CONSTRAINT "FK_165017b4950276d1451cf5a316b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_transaction" DROP CONSTRAINT "FK_529edea80a50c6a96771a7a9904"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_settings" DROP CONSTRAINT "FK_24ad32484b245d33bf6944990f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5b97b27ba4bca8adcfa33fb0603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "astra_account" DROP CONSTRAINT "FK_647cea61802de912141648133dd"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_96f77cf0895b2fd332b12bd96b"`);
    await queryRunner.query(`DROP INDEX "IDX_0d39e3852b97d614b31e41139d"`);
    await queryRunner.query(`DROP TABLE "group_members_user"`);
    await queryRunner.query(`DROP TABLE "transfer"`);
    await queryRunner.query(`DROP TYPE "transfer_type_enum"`);
    await queryRunner.query(`DROP TABLE "recurring_transfer"`);
    await queryRunner.query(`DROP TYPE "recurring_transfer_repeat_until_enum"`);
    await queryRunner.query(`DROP TYPE "recurring_transfer_frequency_enum"`);
    await queryRunner.query(`DROP TYPE "recurring_transfer_status_enum"`);
    await queryRunner.query(`DROP TYPE "recurring_transfer_type_enum"`);
    await queryRunner.query(`DROP TABLE "well_paid_transaction"`);
    await queryRunner.query(`DROP TABLE "merchant_zip_code"`);
    await queryRunner.query(`DROP INDEX "IDX_be0d7e177d3f5037bea1ca841b"`);
    await queryRunner.query(`DROP TABLE "zip_code"`);
    await queryRunner.query(`DROP TABLE "merchant_search_term"`);
    await queryRunner.query(`DROP TABLE "consumer_preference"`);
    await queryRunner.query(`DROP TABLE "consumer_preference_transaction"`);
    await queryRunner.query(`DROP TABLE "category_search_term"`);
    await queryRunner.query(`DROP TABLE "split_bill_transaction"`);
    await queryRunner.query(`DROP TYPE "split_bill_transaction_status_enum"`);
    await queryRunner.query(`DROP TABLE "plaid_category"`);
    await queryRunner.query(`DROP TABLE "plaid_account"`);
    await queryRunner.query(`DROP TABLE "plaid_item"`);
    await queryRunner.query(`DROP TABLE "plaid_transaction"`);
    await queryRunner.query(`DROP TABLE "group_transaction"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TYPE "group_delete_policy_enum"`);
    await queryRunner.query(`DROP TYPE "group_requesters_enum"`);
    await queryRunner.query(`DROP TYPE "group_editors_enum"`);
    await queryRunner.query(`DROP TABLE "categorized_transaction"`);
    await queryRunner.query(`DROP TABLE "transaction_series"`);
    await queryRunner.query(`DROP TABLE "consumer_preference_series"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "split_bill"`);
    await queryRunner.query(`DROP TYPE "split_bill_repeat_until_enum"`);
    await queryRunner.query(`DROP TYPE "split_bill_split_method_enum"`);
    await queryRunner.query(`DROP TYPE "split_bill_transfer_timing_enum"`);
    await queryRunner.query(`DROP TABLE "merchant"`);
    await queryRunner.query(`DROP TABLE "predicted_transaction"`);
    await queryRunner.query(`DROP TABLE "group_category"`);
    await queryRunner.query(`DROP TABLE "connection"`);
    await queryRunner.query(`DROP TYPE "connection_status_enum"`);
    await queryRunner.query(`DROP TABLE "astra_transaction"`);
    await queryRunner.query(`DROP TABLE "alert"`);
    await queryRunner.query(`DROP TYPE "alert_type_enum"`);
    await queryRunner.query(`DROP TABLE "alert_settings"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TABLE "astra_account"`);
  }
}
