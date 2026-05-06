-- ============================================================
-- V5: Invoices and Line Items
-- ============================================================

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contact_id      UUID,                          -- FK added in V6
    invoice_number  VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    subtotal        NUMERIC(14, 2) NOT NULL DEFAULT 0,
    tax_rate        NUMERIC(5, 4)  NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(14, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_invoice_number_firm UNIQUE (firm_id, invoice_number),
    CONSTRAINT chk_invoice_status CHECK (
        status IN ('DRAFT','SENT','VIEWED','PAID','OVERDUE','CANCELLED')
    )
);

CREATE INDEX idx_invoices_firm_id    ON invoices(firm_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_status     ON invoices(firm_id, status);

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Invoice Line Items ───────────────────────────────────────
CREATE TABLE invoice_line_items (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id   UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  TEXT NOT NULL,
    quantity     NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price   NUMERIC(14, 2) NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL,
    is_billable  BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice_id ON invoice_line_items(invoice_id);
