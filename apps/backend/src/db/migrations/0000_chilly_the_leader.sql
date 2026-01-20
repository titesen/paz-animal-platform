CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE TYPE "public"."adoption_status" AS ENUM('REQUESTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'REJECTED', 'APPROVED', 'PROBATION', 'COMPLETED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('DNI', 'PASSPORT', 'MERCOSUR_ID', 'TAX_ID', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."event_modality" AS ENUM('IN_PERSON', 'VIRTUAL', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."event_payment_option" AS ENUM('FREE', 'ONLINE_PAYMENT', 'ON_SITE_CASH', 'IN_KIND_DONATION');--> statement-breakpoint
CREATE TYPE "public"."interview_modality" AS ENUM('IN_PERSON', 'VIRTUAL', 'PHONE');--> statement-breakpoint
CREATE TYPE "public"."interview_result" AS ENUM('PENDING', 'POSITIVE', 'NEGATIVE', 'ABSENT', 'RESCHEDULED');--> statement-breakpoint
CREATE TYPE "public"."language_code" AS ENUM('es', 'en', 'pt');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('PUBLISHED', 'FLAGGED', 'HIDDEN_BY_SYSTEM', 'REMOVED_BY_ADMIN', 'APPROVED_BY_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('EMAIL', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'ACCOUNT_MONEY', 'CASH_TICKET', 'TRANSFER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('MERCADOPAGO', 'STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'CASH_REGISTER');--> statement-breakpoint
CREATE TYPE "public"."pet_sex" AS ENUM('MALE', 'FEMALE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."pet_status" AS ENUM('ADOPTION_AVAILABLE', 'IN_PROCESS', 'OWNED', 'LOST', 'DECEASED');--> statement-breakpoint
CREATE TYPE "public"."physical_contribution_type" AS ENUM('CASH_ON_SITE', 'MATERIAL_SUPPLY', 'FOOD_SUPPLY');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."registration_payment_status" AS ENUM('NA', 'PENDING', 'PAID', 'VERIFIED_ON_SITE');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('SPAM', 'OFFENSIVE', 'FALSE_INFORMATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'PROCESSING');--> statement-breakpoint
CREATE TYPE "public"."ui_component_type" AS ENUM('TEXT', 'RICH_TEXT', 'IMAGE_URL', 'CAROUSEL_LIST', 'CONFIG', 'LINK');--> statement-breakpoint
CREATE TYPE "public"."ui_section" AS ENUM('GLOBAL', 'HOME', 'FOOTER', 'NAVBAR', 'ADOPTIONS', 'VOLUNTEERS', 'DONATIONS', 'CONTACT', 'ABOUT_US');--> statement-breakpoint
CREATE TYPE "public"."volunteer_app_status" AS ENUM('PENDING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "adoption_applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"pet_id" uuid NOT NULL,
	"status" "adoption_status" DEFAULT 'REQUESTED' NOT NULL,
	"space_description" text NOT NULL,
	"income_description" text NOT NULL,
	"other_pets_description" text NOT NULL,
	"motivation" text NOT NULL,
	"evidence_urls" jsonb,
	"admin_notes" text,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	CONSTRAINT "uq_adoption_active" UNIQUE("client_id","status")
);
--> statement-breakpoint
CREATE TABLE "adoption_followups" (
	"followup_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"scheduled_date" date NOT NULL,
	"performed_at" timestamp with time zone DEFAULT now(),
	"notes" text NOT NULL,
	"month_number" smallint NOT NULL,
	CONSTRAINT "uq_followups_month" UNIQUE("application_id","month_number"),
	CONSTRAINT "chk_followups_month" CHECK ("adoption_followups"."month_number" BETWEEN 1 AND 6)
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"log_id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"action" varchar(100) NOT NULL,
	"user_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "incoming_webhooks" (
	"webhook_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(50) NOT NULL,
	"payload" jsonb NOT NULL,
	"is_processed" boolean DEFAULT false,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processing_error" text
);
--> statement-breakpoint
CREATE TABLE "job_history" (
	"job_id" bigserial PRIMARY KEY NOT NULL,
	"job_name" varchar(100) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"status" varchar(50),
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"subject" varchar(255),
	"body" text NOT NULL,
	"status" "notification_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" smallint DEFAULT 0,
	"error_detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "auth"."roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(60),
	"google_id" varchar(255),
	"avatar_url" varchar(500),
	"tfa_enabled" boolean DEFAULT false NOT NULL,
	"tfa_secret" varchar(255),
	"doc_type" "document_type" DEFAULT 'DNI' NOT NULL,
	"doc_number" varchar(50) NOT NULL,
	"nationality_iso" char(2) DEFAULT 'AR' NOT NULL,
	"birth_date" date,
	"phone" varchar(20),
	"secondary_email" varchar(255),
	"notification_preferences" jsonb DEFAULT '{"news":true,"events":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "uq_users_document" UNIQUE("doc_type","doc_number"),
	CONSTRAINT "chk_users_auth_method" CHECK ("auth"."users"."password_hash" IS NOT NULL OR "auth"."users"."google_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "auth"."users_roles" (
	"user_id" uuid NOT NULL,
	"role_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"news_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "news_translations" (
	"news_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"title" varchar(255) NOT NULL,
	"excerpt" varchar(500),
	"content" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	CONSTRAINT "uq_news_slug" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"resource_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"status" "publication_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_updated_at" timestamp with time zone DEFAULT now(),
	"sort_order" smallint DEFAULT 0,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "resources_translations" (
	"resource_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"meta_title" varchar(255),
	"meta_description" varchar(500),
	CONSTRAINT "uq_res_slug" UNIQUE("language","slug")
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"sponsor_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"website_url" varchar(255),
	"contact_name" varchar(100),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"sort_order" smallint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	CONSTRAINT "sponsors_contact_name_unique" UNIQUE("contact_name"),
	CONSTRAINT "sponsors_contact_email_unique" UNIQUE("contact_email"),
	CONSTRAINT "sponsors_contact_phone_unique" UNIQUE("contact_phone")
);
--> statement-breakpoint
CREATE TABLE "ui_fragments" (
	"fragment_key" varchar(100) NOT NULL,
	"language" "language_code" DEFAULT 'es' NOT NULL,
	"description" varchar(255),
	"type" "ui_component_type" NOT NULL,
	"section" "ui_section" NOT NULL,
	"content" jsonb NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now(),
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"attendance_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"checked_in_by" uuid,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"check_in_time" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now(),
	"selected_payment_option" "event_payment_option" NOT NULL,
	"payment_status" "registration_payment_status" DEFAULT 'PENDING' NOT NULL,
	"agreed_price_snapshot" numeric(12, 2),
	"agreed_in_kind_snapshot" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"virtual_link" varchar(255),
	"modality" "event_modality" DEFAULT 'IN_PERSON' NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"accepts_online_payment" boolean DEFAULT false NOT NULL,
	"online_price" numeric(12, 2),
	"accepts_on_site_payment" boolean DEFAULT false NOT NULL,
	"on_site_price" numeric(12, 2),
	"accepts_in_kind" boolean DEFAULT false NOT NULL,
	"in_kind_description" text,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "chk_event_config" CHECK ((
        ("events"."is_free" = true AND "events"."accepts_online_payment" = false AND "events"."accepts_on_site_payment" = false AND "events"."accepts_in_kind" = false) OR
        ("events"."is_free" = false AND ("events"."accepts_online_payment" = true OR "events"."accepts_on_site_payment" = true OR "events"."accepts_in_kind" = true))
      )),
	CONSTRAINT "chk_event_future" CHECK ("events"."event_date" > NOW())
);
--> statement-breakpoint
CREATE TABLE "events_translations" (
	"event_id" uuid NOT NULL,
	"language" "language_code" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "in_kind_donations" (
	"donation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"manual_donor_name" varchar(100),
	"manual_donor_contact" varchar(100),
	"description" text NOT NULL,
	"estimated_value" numeric(12, 2) DEFAULT '0',
	"received_by_id" uuid NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_inkind_donor_id" CHECK ("in_kind_donations"."user_id" IS NOT NULL OR "in_kind_donations"."manual_donor_name" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "monetary_donations" (
	"donation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"target_amount" numeric(12, 2) NOT NULL,
	"currency" char(3) DEFAULT 'ARS' NOT NULL,
	"thank_you_message" text,
	"is_anonymous" boolean DEFAULT false,
	"is_confirmed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "on_site_collections" (
	"collection_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"type" "physical_contribution_type" NOT NULL,
	"description" text NOT NULL,
	"estimated_value" numeric(12, 2) DEFAULT '0',
	"currency" char(3) DEFAULT 'ARS',
	"received_by_id" uuid NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"method_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "payment_provider" DEFAULT 'MERCADOPAGO' NOT NULL,
	"external_token" varchar(255) NOT NULL,
	"card_brand" varchar(50),
	"last_four" varchar(4),
	"description" varchar(100),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"transaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"amount_total" numeric(12, 2) NOT NULL,
	"currency" char(3) DEFAULT 'ARS' NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"external_transaction_id" varchar(255),
	"external_reference_id" varchar(255),
	"method" "payment_method_type",
	"method_detail" varchar(100),
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"origin_type" varchar(50) NOT NULL,
	"origin_id" uuid NOT NULL,
	CONSTRAINT "transactions_external_transaction_id_unique" UNIQUE("external_transaction_id"),
	CONSTRAINT "chk_transactions_amount" CHECK ("transactions"."amount_total" > 0)
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"content" text NOT NULL,
	"moderation_status" "moderation_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now(),
	"parent_comment_id" uuid,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"like_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"liked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_likes_unique" UNIQUE("user_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"description" text,
	"is_resolved" boolean DEFAULT false,
	"reported_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_report_unique" UNIQUE("reporter_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"city_id" serial PRIMARY KEY NOT NULL,
	"province_id" serial NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"iso_code" char(2) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone_prefix" varchar(10),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"iso_code" char(3) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"symbol" varchar(5) NOT NULL,
	"decimals" smallint DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"province_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "provinces_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "breeds" (
	"breed_id" serial PRIMARY KEY NOT NULL,
	"species_id" serial NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lost_pet_alerts" (
	"alert_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pet_id" uuid NOT NULL,
	"lost_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_zone" varchar(255) NOT NULL,
	"coordinates" "point",
	"contact_phone" varchar(50) NOT NULL,
	"message" varchar,
	"is_active" boolean DEFAULT true,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "uq_lost_alerts_active" UNIQUE("pet_id","is_active")
);
--> statement-breakpoint
CREATE TABLE "pets" (
	"pet_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" "pet_status" NOT NULL,
	"sex" "pet_sex" DEFAULT 'UNKNOWN' NOT NULL,
	"breed_id" serial NOT NULL,
	"birth_date_approx" date,
	"qr_code" uuid DEFAULT gen_random_uuid(),
	"owner_id" uuid,
	"neuter_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "pets_qr_code_unique" UNIQUE("qr_code"),
	CONSTRAINT "chk_pets_logic" CHECK ((
        ("pets"."status" IN ('ADOPTION_AVAILABLE', 'IN_PROCESS') AND "pets"."owner_id" IS NULL) OR
        ("pets"."status" IN ('OWNED', 'LOST') AND "pets"."owner_id" IS NOT NULL) OR
        ("pets"."status" = 'DECEASED')
      ))
);
--> statement-breakpoint
CREATE TABLE "pets_vaccines" (
	"pet_id" uuid NOT NULL,
	"vaccine_id" serial NOT NULL,
	"applied_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "species" (
	"species_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "species_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vaccines_catalog" (
	"vaccine_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "vaccines_catalog_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"address_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"city_id" serial NOT NULL,
	"street" varchar(255) NOT NULL,
	"number" varchar(20) NOT NULL,
	"unit" varchar(50),
	"zip_code" varchar(10) NOT NULL,
	"alias" varchar(100) DEFAULT 'Main',
	"coordinates" "point",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media" (
	"media_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_url" varchar(255) NOT NULL,
	"type" "media_type" NOT NULL,
	"alt_text" varchar(255),
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"is_main" boolean DEFAULT false,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taggables" (
	"tag_id" serial NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"tag_id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" jsonb NOT NULL,
	"color_hex" varchar(7) DEFAULT '#00AA00',
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"interview_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interviewer_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" smallint DEFAULT 30,
	"modality" "interview_modality" NOT NULL,
	"location_details" varchar(255),
	"result" "interview_result" DEFAULT 'PENDING' NOT NULL,
	"observations" text,
	"occurred_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volunteer_applications" (
	"application_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"doc_number" varchar(50) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"birth_date" date NOT NULL,
	"instagram_handle" varchar(100),
	"has_experience" boolean DEFAULT false NOT NULL,
	"experience_details" text,
	"was_volunteer_before" boolean DEFAULT false NOT NULL,
	"motivation" text NOT NULL,
	"availability" jsonb NOT NULL,
	"status" "volunteer_app_status" DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "volunteer_roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "volunteer_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"volunteer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"volunteer_role_id" serial NOT NULL,
	"bio" text,
	"availability" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"qr_code" uuid DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "volunteers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "volunteers_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
ALTER TABLE "adoption_applications" ADD CONSTRAINT "adoption_applications_client_id_users_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_applications" ADD CONSTRAINT "adoption_applications_pet_id_pets_pet_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("pet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_followups" ADD CONSTRAINT "adoption_followups_application_id_adoption_applications_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."adoption_applications"("application_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoption_followups" ADD CONSTRAINT "adoption_followups_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."users_roles" ADD CONSTRAINT "users_roles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."users_roles" ADD CONSTRAINT "users_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "auth"."roles"("role_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_translations" ADD CONSTRAINT "news_translations_news_id_news_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("news_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources_translations" ADD CONSTRAINT "resources_translations_resource_id_resources_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("resource_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_fragments" ADD CONSTRAINT "ui_fragments_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_checked_in_by_users_user_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_creator_id_users_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events_translations" ADD CONSTRAINT "events_translations_event_id_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_kind_donations" ADD CONSTRAINT "in_kind_donations_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_kind_donations" ADD CONSTRAINT "in_kind_donations_received_by_id_users_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monetary_donations" ADD CONSTRAINT "monetary_donations_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monetary_donations" ADD CONSTRAINT "monetary_donations_currency_currencies_iso_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("iso_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "on_site_collections" ADD CONSTRAINT "on_site_collections_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "on_site_collections" ADD CONSTRAINT "on_site_collections_currency_currencies_iso_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("iso_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "on_site_collections" ADD CONSTRAINT "on_site_collections_received_by_id_users_user_id_fk" FOREIGN KEY ("received_by_id") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_currency_currencies_iso_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("iso_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_province_id_provinces_province_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("province_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeds" ADD CONSTRAINT "breeds_species_id_species_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("species_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_pet_alerts" ADD CONSTRAINT "lost_pet_alerts_pet_id_pets_pet_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("pet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_breed_id_breeds_breed_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("breed_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_users_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_vaccines" ADD CONSTRAINT "pets_vaccines_pet_id_pets_pet_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("pet_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_vaccines" ADD CONSTRAINT "pets_vaccines_vaccine_id_vaccines_catalog_vaccine_id_fk" FOREIGN KEY ("vaccine_id") REFERENCES "public"."vaccines_catalog"("vaccine_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_city_id_cities_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("city_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("tag_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_users_user_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "auth"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_volunteer_role_id_volunteer_roles_role_id_fk" FOREIGN KEY ("volunteer_role_id") REFERENCES "public"."volunteer_roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "auth"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_ui_fragments_section" ON "ui_fragments" USING btree ("section");--> statement-breakpoint
CREATE INDEX "idx_transactions_external" ON "transactions" USING btree ("external_transaction_id");--> statement-breakpoint
CREATE INDEX "idx_comments_entity" ON "comments" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_likes_entity" ON "likes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_pets_owner" ON "pets" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_addresses_polymorphic" ON "addresses" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_media_polymorphic" ON "media" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_taggables_entity" ON "taggables" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_interviews_schedule" ON "interviews" USING btree ("scheduled_at");
