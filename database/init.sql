/*
DATABASE DEFINITION: Paz Animal v1.0
*/

-- 1. INITIAL SETUP
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- SCHEMA: PUBLIC (ENUMS & DOMAINS)

-- Identity & Attributes
CREATE TYPE public.document_type AS ENUM ('DNI', 'PASSPORT', 'MERCOSUR_ID', 'TAX_ID', 'OTHER');
CREATE TYPE public.pet_sex AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');
CREATE TYPE public.media_type AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO');
CREATE TYPE public.language_code AS ENUM ('es', 'en', 'pt');

-- Business Workflows
CREATE TYPE public.publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE public.pet_status AS ENUM ('ADOPTION_AVAILABLE', 'IN_PROCESS', 'OWNED', 'LOST', 'DECEASED');
CREATE TYPE public.adoption_status AS ENUM (
    'REQUESTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED',
    'REJECTED', 'APPROVED', 'PROBATION', 'COMPLETED', 'REVOKED'
);
CREATE TYPE public.volunteer_app_status AS ENUM ('PENDING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED');
CREATE TYPE public.interview_modality AS ENUM ('IN_PERSON', 'VIRTUAL', 'PHONE');
CREATE TYPE public.interview_result AS ENUM ('PENDING', 'POSITIVE', 'NEGATIVE', 'ABSENT', 'RESCHEDULED');
CREATE TYPE public.report_reason AS ENUM ('SPAM', 'OFFENSIVE', 'FALSE_INFORMATION', 'OTHER');

-- Moderation Status
CREATE TYPE public.moderation_status AS ENUM (
    'PUBLISHED',           -- Visible to everyone
    'FLAGGED',             -- Reported but still visible (below threshold)
    'HIDDEN_BY_SYSTEM',    -- Auto-hidden (Threshold reached)
    'REMOVED_BY_ADMIN',    -- Final ban
    'APPROVED_BY_ADMIN'    -- Protected (Immune to auto-hiding)
);

-- Finance & Events
CREATE TYPE public.transaction_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'PROCESSING');
CREATE TYPE public.payment_provider AS ENUM ('MERCADOPAGO', 'STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'CASH_REGISTER');
CREATE TYPE public.payment_method_type AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'ACCOUNT_MONEY', 'CASH_TICKET', 'TRANSFER', 'OTHER');
CREATE TYPE public.event_modality AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');
CREATE TYPE public.event_payment_option AS ENUM ('FREE', 'ONLINE_PAYMENT', 'ON_SITE_CASH', 'IN_KIND_DONATION');
CREATE TYPE public.registration_payment_status AS ENUM ('NA', 'PENDING', 'PAID', 'VERIFIED_ON_SITE');
CREATE TYPE public.physical_contribution_type AS ENUM ('CASH_ON_SITE', 'MATERIAL_SUPPLY', 'FOOD_SUPPLY');

-- Communications
CREATE TYPE public.notification_type AS ENUM ('EMAIL', 'SYSTEM');
CREATE TYPE public.notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');

--- MASTER TABLES
CREATE TABLE public.countries (
    iso_code CHAR(2) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_prefix VARCHAR(10),
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT pk_countries PRIMARY KEY (iso_code)
);

-- Seed Data
INSERT INTO public.countries (iso_code, name, phone_prefix) VALUES
('AR', 'Argentina', '+54'), ('BR', 'Brazil', '+55'), ('UY', 'Uruguay', '+598'), ('PY', 'Paraguay', '+595'), ('CL', 'Chile', '+56'), ('US', 'United States', '+1');

CREATE TABLE public.currencies (
    iso_code CHAR(3) NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(5) NOT NULL,
    decimals SMALLINT DEFAULT 2,

    CONSTRAINT pk_currencies PRIMARY KEY (iso_code)
);
INSERT INTO public.currencies (iso_code, name, symbol) VALUES
('ARS', 'Argentine Peso', '$'), ('USD', 'US Dollar', 'US$'), ('BRL', 'Brazilian Real', 'R$');

-- SCHEMA: AUTH (Identity)
CREATE TABLE auth.roles (
    role_id SERIAL,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT pk_roles PRIMARY KEY (role_id),
    CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE auth.users (
    user_id UUID DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,

    -- Auth
    password_hash VARCHAR(60),
    google_id VARCHAR(255),
    avatar_url VARCHAR(500),
    tfa_enabled BOOLEAN NOT NULL DEFAULT false,
    tfa_secret VARCHAR(255),

    -- Identity
    doc_type public.document_type NOT NULL DEFAULT 'DNI',
    doc_number VARCHAR(50) NOT NULL,
    nationality_iso CHAR(2) NOT NULL DEFAULT 'AR',

    -- Contact
    birth_date DATE,
    phone VARCHAR(20),
    secondary_email VARCHAR(255),

    -- Prefs
    notification_preferences JSONB NOT NULL DEFAULT '{"news": true, "events": true}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Explicit Constraints
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_google UNIQUE (google_id),
    CONSTRAINT uq_users_document UNIQUE (doc_type, doc_number),
    CONSTRAINT chk_users_auth_method CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL),

    -- Explicit Foreign Keys
    CONSTRAINT fk_users_nationality FOREIGN KEY (nationality_iso) REFERENCES public.countries(iso_code)
);
CREATE INDEX idx_users_email ON auth.users(email);

CREATE TABLE auth.users_roles (
    user_id UUID NOT NULL,
    role_id INT NOT NULL,

    CONSTRAINT pk_users_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_users_roles_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_users_roles_role FOREIGN KEY (role_id) REFERENCES auth.roles(role_id) ON DELETE CASCADE
);

-- SCHEMA: PUBLIC (Business)

--- 1. TRANSVERSAL
CREATE TABLE public.media (
    media_id UUID DEFAULT gen_random_uuid(),
    storage_url VARCHAR(255) NOT NULL,
    type public.media_type NOT NULL,
    alt_text VARCHAR(255),

    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    is_main BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_media PRIMARY KEY (media_id)
);
CREATE INDEX idx_media_polymorphic ON public.media(entity_type, entity_id);

CREATE TABLE public.tags (
    tag_id SERIAL,
    slug VARCHAR(50) NOT NULL,
    name JSONB NOT NULL,
    color_hex VARCHAR(7) DEFAULT '#00AA00',

    CONSTRAINT pk_tags PRIMARY KEY (tag_id),
    CONSTRAINT uq_tags_slug UNIQUE (slug)
);

CREATE TABLE public.taggables (
    tag_id INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    CONSTRAINT pk_taggables PRIMARY KEY (tag_id, entity_type, entity_id),
    CONSTRAINT fk_taggables_tag FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id) ON DELETE CASCADE
);
CREATE INDEX idx_taggables_entity ON public.taggables(entity_type, entity_id);

-- Location
CREATE TABLE public.provinces (
    province_id SERIAL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_provinces PRIMARY KEY (province_id),
    CONSTRAINT uq_provinces_name UNIQUE (name)
);

CREATE TABLE public.cities (
    city_id SERIAL,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT pk_cities PRIMARY KEY (city_id),
    CONSTRAINT fk_cities_province FOREIGN KEY (province_id) REFERENCES public.provinces(province_id)
);

CREATE TABLE public.addresses (
    address_id UUID DEFAULT gen_random_uuid(),

    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    city_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    unit VARCHAR(50),
    zip_code VARCHAR(10) NOT NULL,
    alias VARCHAR(100) DEFAULT 'Main',
    coordinates POINT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_addresses PRIMARY KEY (address_id),
    CONSTRAINT fk_addresses_city FOREIGN KEY (city_id) REFERENCES public.cities(city_id)
);
CREATE INDEX idx_addresses_polymorphic ON public.addresses(entity_type, entity_id);

--- 2. PETS
CREATE TABLE public.species (
    species_id SERIAL,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_species PRIMARY KEY (species_id),
    CONSTRAINT uq_species_name UNIQUE (name)
);

CREATE TABLE public.breeds (
    breed_id SERIAL,
    species_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_breeds PRIMARY KEY (breed_id),
    CONSTRAINT fk_breeds_species FOREIGN KEY (species_id) REFERENCES public.species(species_id)
);

CREATE TABLE public.pets (
    pet_id UUID DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    status public.pet_status NOT NULL,
    sex public.pet_sex NOT NULL DEFAULT 'UNKNOWN',

    breed_id INT,
    birth_date_approx DATE,
    qr_code UUID DEFAULT gen_random_uuid(),
    owner_id UUID,
    neuter_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_pets PRIMARY KEY (pet_id),
    CONSTRAINT uq_pets_qr UNIQUE (qr_code),
    CONSTRAINT fk_pets_breed FOREIGN KEY (breed_id) REFERENCES public.breeds(breed_id) ON DELETE SET NULL,
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,

    CONSTRAINT chk_pets_logic CHECK (
        (status IN ('ADOPTION_AVAILABLE', 'IN_PROCESS') AND owner_id IS NULL) OR
        (status IN ('OWNED', 'LOST') AND owner_id IS NOT NULL) OR
        (status = 'DECEASED')
    )
);
CREATE INDEX idx_pets_owner ON public.pets(owner_id);

CREATE TABLE public.lost_pet_alerts (
    alert_id UUID DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL,

    lost_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_zone VARCHAR(255) NOT NULL,
    coordinates POINT,
    contact_phone VARCHAR(50) NOT NULL,
    message TEXT,
    is_active BOOLEAN DEFAULT true,
    resolved_at TIMESTAMPTZ,

    CONSTRAINT pk_lost_alerts PRIMARY KEY (alert_id),
    CONSTRAINT fk_lost_alerts_pet FOREIGN KEY (pet_id) REFERENCES public.pets(pet_id) ON DELETE CASCADE,
    CONSTRAINT uq_lost_alerts_active UNIQUE (pet_id) INCLUDE (is_active) WHERE (is_active = true)
);

CREATE TABLE public.vaccines_catalog (
    vaccine_id SERIAL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_vaccines_catalog PRIMARY KEY (vaccine_id),
    CONSTRAINT uq_vaccines_name UNIQUE (name)
);

CREATE TABLE public.pets_vaccines (
    pet_id UUID NOT NULL,
    vaccine_id INT NOT NULL,
    applied_at DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT pk_pets_vaccines PRIMARY KEY (pet_id, vaccine_id, applied_at),
    CONSTRAINT fk_pv_pet FOREIGN KEY (pet_id) REFERENCES public.pets(pet_id) ON DELETE CASCADE,
    CONSTRAINT fk_pv_vaccine FOREIGN KEY (vaccine_id) REFERENCES public.vaccines_catalog(vaccine_id) ON DELETE CASCADE
);

--- 3. HUMAN RESOURCES
CREATE TABLE public.volunteer_applications (
    application_id UUID DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    doc_number VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    instagram_handle VARCHAR(100),

    has_experience BOOLEAN NOT NULL DEFAULT false,
    experience_details TEXT,
    was_volunteer_before BOOLEAN NOT NULL DEFAULT false,
    motivation TEXT NOT NULL,
    availability JSONB NOT NULL,

    status public.volunteer_app_status NOT NULL DEFAULT 'PENDIENTE',
    admin_notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,

    CONSTRAINT pk_volunteer_apps PRIMARY KEY (application_id)
);

CREATE TABLE public.volunteer_roles (
    role_id SERIAL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT pk_volunteer_roles PRIMARY KEY (role_id),
    CONSTRAINT uq_volunteer_roles_name UNIQUE (name)
);

CREATE TABLE public.volunteers (
    volunteer_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    volunteer_role_id INT,
    bio TEXT,
    availability JSONB NOT NULL DEFAULT '{}',
    qr_code UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_volunteers PRIMARY KEY (volunteer_id),
    CONSTRAINT uq_volunteers_user UNIQUE (user_id),
    CONSTRAINT uq_volunteers_qr UNIQUE (qr_code),
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_volunteers_role FOREIGN KEY (volunteer_role_id) REFERENCES public.volunteer_roles(role_id)
);

CREATE TABLE public.interviews (
    interview_id UUID DEFAULT gen_random_uuid(),
    interviewer_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes SMALLINT DEFAULT 30,
    modality public.interview_modality NOT NULL,
    location_details VARCHAR(255),
    result public.interview_result NOT NULL DEFAULT 'PENDIENTE',
    observations TEXT,
    occurred_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT pk_interviews PRIMARY KEY (interview_id),
    CONSTRAINT fk_interviews_interviewer FOREIGN KEY (interviewer_id) REFERENCES auth.users(user_id)
);
CREATE INDEX idx_interviews_schedule ON public.interviews(scheduled_at);


--- 4. ADOPTIONS
CREATE TABLE public.adoption_applications (
    application_id UUID DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    pet_id UUID NOT NULL,
    status public.adoption_status NOT NULL DEFAULT 'REQUESTED',

    space_description TEXT NOT NULL,
    income_description TEXT NOT NULL,
    other_pets_description TEXT NOT NULL,
    motivation TEXT NOT NULL,
    evidence_urls JSONB,
    admin_notes TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,

    CONSTRAINT pk_adoption_apps PRIMARY KEY (application_id),
    CONSTRAINT fk_adoption_client FOREIGN KEY (client_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_adoption_pet FOREIGN KEY (pet_id) REFERENCES public.pets(pet_id) ON DELETE CASCADE,

    CONSTRAINT uq_adoption_active UNIQUE (client_id, status)
        WHERE (status IN ('REQUESTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'PROBATION'))
);

CREATE TABLE public.adoption_followups (
    followup_id UUID DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    admin_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT NOT NULL,
    month_number SMALLINT NOT NULL,

    CONSTRAINT pk_followups PRIMARY KEY (followup_id),
    CONSTRAINT fk_followups_app FOREIGN KEY (application_id) REFERENCES public.adoption_applications(application_id) ON DELETE CASCADE,
    CONSTRAINT fk_followups_admin FOREIGN KEY (admin_id) REFERENCES auth.users(user_id),
    CONSTRAINT chk_followups_month CHECK (month_number BETWEEN 1 AND 6),
    CONSTRAINT uq_followups_month UNIQUE (application_id, month_number)
);

--- 5. CONTENT & EVENTS
CREATE TABLE public.news (
    news_id UUID DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    status public.publication_status NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_news PRIMARY KEY (news_id),
    CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES auth.users(user_id) ON DELETE SET NULL
);

CREATE TABLE public.news_translations (
    news_id UUID NOT NULL,
    language public.language_code NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    CONSTRAINT pk_news_translations PRIMARY KEY (news_id, language),
    CONSTRAINT fk_news_trans_news FOREIGN KEY (news_id) REFERENCES public.news(news_id) ON DELETE CASCADE,
    CONSTRAINT uq_news_slug UNIQUE (language, slug)
);

CREATE TABLE public.resources (
    resource_id UUID DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    status public.publication_status NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order SMALLINT DEFAULT 0,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_resources PRIMARY KEY (resource_id),
    CONSTRAINT fk_resources_author FOREIGN KEY (author_id) REFERENCES auth.users(user_id) ON DELETE SET NULL
);

CREATE TABLE public.resources_translations (
    resource_id UUID NOT NULL,
    language public.language_code NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),

    CONSTRAINT pk_resources_trans PRIMARY KEY (resource_id, language),
    CONSTRAINT fk_res_trans_res FOREIGN KEY (resource_id) REFERENCES public.resources(resource_id) ON DELETE CASCADE,
    CONSTRAINT uq_res_slug UNIQUE (language, slug)
);

CREATE TABLE public.sponsors (
    sponsor_id UUID DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    website_url VARCHAR(255),
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    sort_order SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_sponsors PRIMARY KEY (sponsor_id),
	CONSTRAINT uq_contact_name UNIQUE (contact_name),
	CONSTRAINT uq_contact_email UNIQUE (contact_email),
	CONSTRAINT uq_contact_phone UNIQUE (contact_phone)
);

CREATE TABLE public.events (
    event_id UUID DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    virtual_link VARCHAR(255),
    modality public.event_modality NOT NULL DEFAULT 'IN_PERSON',

    is_free BOOLEAN NOT NULL DEFAULT true,
    accepts_online_payment BOOLEAN NOT NULL DEFAULT false,
    online_price NUMERIC(12, 2),
    accepts_on_site_payment BOOLEAN NOT NULL DEFAULT false,
    on_site_price NUMERIC(12, 2),
    accepts_in_kind BOOLEAN NOT NULL DEFAULT false,
    in_kind_description TEXT,

    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_events PRIMARY KEY (event_id),
    CONSTRAINT fk_events_creator FOREIGN KEY (creator_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_event_config CHECK (
        (is_free = true AND accepts_online_payment = false AND accepts_on_site_payment = false AND accepts_in_kind = false) OR
        (is_free = false AND (accepts_online_payment = true OR accepts_on_site_payment = true OR accepts_in_kind = true))
    ),
    CONSTRAINT chk_event_future CHECK (event_date > NOW())
);

CREATE TABLE public.events_translations (
    event_id UUID NOT NULL,
    language public.language_code NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    CONSTRAINT pk_events_translations PRIMARY KEY (event_id, language),
    CONSTRAINT fk_events_trans_event FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE
);

CREATE TABLE public.event_registrations (
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    selected_payment_option public.event_payment_option NOT NULL,
    payment_status public.registration_payment_status NOT NULL DEFAULT 'PENDIENTE',
    agreed_price_snapshot NUMERIC(12, 2),
    agreed_in_kind_snapshot TEXT,

    CONSTRAINT pk_event_registrations PRIMARY KEY (user_id, event_id),
    CONSTRAINT fk_er_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE
);

CREATE TABLE public.attendances (
    attendance_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    checked_in_by UUID,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,

    CONSTRAINT pk_attendances PRIMARY KEY (attendance_id),
    CONSTRAINT fk_attendances_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendances_admin FOREIGN KEY (checked_in_by) REFERENCES auth.users(user_id),
    CONSTRAINT uq_attendance_unique UNIQUE (user_id, entity_type, entity_id)
);

--- 6. INTERACTIONS
CREATE TABLE public.comments (
    comment_id UUID DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
	moderation_status public.moderation_status NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    parent_comment_id UUID,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pk_comments PRIMARY KEY (comment_id),
    CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES public.comments(comment_id) ON DELETE CASCADE
);
CREATE INDEX idx_comments_entity ON public.comments(entity_type, entity_id);

CREATE TABLE public.likes (
    like_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_likes PRIMARY KEY (like_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_likes_unique UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX idx_likes_entity ON public.likes(entity_type, entity_id);

CREATE TABLE public.reports (
    report_id UUID DEFAULT gen_random_uuid(),
    reporter_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    reason public.report_reason NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_reports PRIMARY KEY (report_id),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,
	CONSTRAINT uq_report_unique UNIQUE (reporter_id, entity_type, entity_id)
);

--- 7. FINANCE
CREATE TABLE public.transactions (
    transaction_id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    amount_total NUMERIC(12, 2) NOT NULL CHECK (amount_total > 0),
    currency CHAR(3) NOT NULL DEFAULT 'ARS',
    provider public.payment_provider NOT NULL,
    external_transaction_id VARCHAR(255),
    external_reference_id VARCHAR(255),
    method public.payment_method_type,
    method_detail VARCHAR(100),
    status public.transaction_status NOT NULL DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    origin_type VARCHAR(50) NOT NULL,
    origin_id UUID NOT NULL,

    CONSTRAINT pk_transactions PRIMARY KEY (transaction_id),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_transactions_currency FOREIGN KEY (currency) REFERENCES public.currencies(iso_code),
    CONSTRAINT uq_transactions_external_id UNIQUE (external_transaction_id)
);
CREATE INDEX idx_transactions_external ON public.transactions(external_transaction_id);

CREATE TABLE public.monetary_donations (
    donation_id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    target_amount NUMERIC(12, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'ARS',
    thank_you_message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_monetary_donations PRIMARY KEY (donation_id),
    CONSTRAINT fk_mon_donations_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_mon_donations_currency FOREIGN KEY (currency) REFERENCES public.currencies(iso_code)
);

CREATE TABLE public.in_kind_donations (
    donation_id UUID DEFAULT gen_random_uuid(),
    user_id UUID,
    manual_donor_name VARCHAR(100),
    manual_donor_contact VARCHAR(100),
    description TEXT NOT NULL,
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    received_by_id UUID NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_inkind_donations PRIMARY KEY (donation_id),
    CONSTRAINT fk_inkind_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_inkind_receiver FOREIGN KEY (received_by_id) REFERENCES auth.users(user_id),
    CONSTRAINT chk_inkind_donor_id CHECK (user_id IS NOT NULL OR manual_donor_name IS NOT NULL)
);

CREATE TABLE public.on_site_collections (
    collection_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    type public.physical_contribution_type NOT NULL,
    description TEXT NOT NULL,
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    currency CHAR(3) DEFAULT 'ARS',
    received_by_id UUID NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_onsite_collections PRIMARY KEY (collection_id),
    CONSTRAINT fk_onsite_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id),
    CONSTRAINT fk_onsite_receiver FOREIGN KEY (received_by_id) REFERENCES auth.users(user_id),
    CONSTRAINT fk_onsite_currency FOREIGN KEY (currency) REFERENCES public.currencies(iso_code)
);

CREATE TABLE public.payment_methods (
    method_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider public.payment_provider NOT NULL DEFAULT 'MERCADOPAGO',
    external_token VARCHAR(255) NOT NULL,
    card_brand VARCHAR(50),
    last_four VARCHAR(4),
    description VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT pk_payment_methods PRIMARY KEY (method_id),
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE
);

--- 9. UI CONTENT MANAGEMENT (Lightweight CMS): Added for dynamic management of text and images.
-- 1. We define the types of components and fixed sections.
CREATE TYPE public.ui_component_type AS ENUM (
    'TEXT',           -- Plain text (Titles, Labels)
    'RICH_TEXT',      -- HTML/Markdown (Long paragraphs)
    'IMAGE_URL',      -- Link to a photo in R2
    'CAROUSEL_LIST',  -- Array of objects {url, alt, link}
    'CONFIG',         -- Boolean or numeric configurations (e.g. show_banner: true)
    'LINK'            -- Buttons or external links
);

CREATE TYPE public.ui_section AS ENUM (
    'GLOBAL',         -- Things that appear everywhere (e.g. Phone in header)
    'HOME',           -- Home Page
    'FOOTER',         -- Footer
    'NAVBAR',         -- Navbar
    'ADOPTIONS',      -- Adoptions Page
    'VOLUNTEERS',     -- Volunteers Page
    'DONATIONS',      -- Donations Page
    'CONTACT',        -- Contact Page
    'ABOUT_US'        -- About Us Page
);

-- 2. The fragment table
CREATE TABLE public.ui_fragments (
    fragment_key VARCHAR(100) NOT NULL, -- Logical unique ID (e.g. 'home_hero_title')
    language public.language_code NOT NULL DEFAULT 'es',

    description VARCHAR(255), -- Help for admin: "Large title of the main banner"
    type public.ui_component_type NOT NULL,
    section public.ui_section NOT NULL, -- Your correction: Now it's ENUM

    content JSONB NOT NULL, -- The actual value (flexible)

    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID, -- Who last modified it

    CONSTRAINT pk_ui_fragments PRIMARY KEY (fragment_key, language),
    CONSTRAINT fk_ui_fragments_updater FOREIGN KEY (updated_by) REFERENCES auth.users(user_id) ON DELETE SET NULL
);

-- Index for fast search by section (what the Frontend will do)
CREATE INDEX idx_ui_fragments_section ON public.ui_fragments(section);

--- 10. AUDIT & OPS
CREATE TABLE public.notifications (
    notification_id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type public.notification_type NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status public.notification_status NOT NULL DEFAULT 'PENDIENTE',
    retry_count SMALLINT DEFAULT 0,
    error_detail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,

    CONSTRAINT pk_notifications PRIMARY KEY (notification_id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE CASCADE
);

CREATE TABLE public.incoming_webhooks (
    webhook_id UUID DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_error TEXT,

    CONSTRAINT pk_webhooks PRIMARY KEY (webhook_id)
);

CREATE TABLE public.job_history (
    job_id BIGSERIAL,
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status VARCHAR(50),
    details JSONB,

    CONSTRAINT pk_job_history PRIMARY KEY (job_id)
);

CREATE TABLE public.audit_logs (
    log_id BIGSERIAL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    user_id UUID,
    ip_address VARCHAR(45),
    user_agent TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,

    CONSTRAINT pk_audit_logs PRIMARY KEY (log_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES auth.users(user_id) ON DELETE SET NULL
);

-- Limited user creation for the application
DO $do$ BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_paz_animal') THEN
      CREATE ROLE app_paz_animal LOGIN PASSWORD 'dev_password';
   END IF;
END $do$;

GRANT CONNECT ON DATABASE paz_animal_local TO app_paz_animal;
GRANT USAGE ON SCHEMA public TO app_paz_animal;
GRANT USAGE ON SCHEMA auth TO app_paz_animal;

-- CRUD permission assignment
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_paz_animal;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO app_paz_animal;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_paz_animal;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO app_paz_animal;
