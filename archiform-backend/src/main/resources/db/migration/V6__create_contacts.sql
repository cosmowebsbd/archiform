-- ============================================================
-- V6: Contacts (Clients) + Wire FK to Projects & Invoices
-- ============================================================

CREATE TABLE contacts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id     UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    phone       VARCHAR(50),
    company     VARCHAR(255),
    street      VARCHAR(255),
    city        VARCHAR(100),
    state       VARCHAR(100),
    zip         VARCHAR(20),
    country     VARCHAR(100),
    notes       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_firm_id ON contacts(firm_id);

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Wire FK: projects.contact_id → contacts.id ──────────────
ALTER TABLE projects
    ADD CONSTRAINT fk_projects_contact
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;

-- ── Wire FK: invoices.contact_id → contacts.id ──────────────
ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_contact
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
