-- ============================================================
-- V2: Projects and Phases
-- ============================================================

-- ── Projects ────────────────────────────────────────────────
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    contact_id      UUID,                           -- FK added in V6 (contacts)
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    category        VARCHAR(100),
    total_budget    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    spent_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_project_status CHECK (
        status IN ('DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED')
    )
);

CREATE INDEX idx_projects_firm_id        ON projects(firm_id);
CREATE INDEX idx_projects_firm_status    ON projects(firm_id, status);
CREATE INDEX idx_projects_contact_id     ON projects(contact_id);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Phases ───────────────────────────────────────────────────
CREATE TABLE phases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    budget_hours    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    logged_hours    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    budget_amount   NUMERIC(14, 2) NOT NULL DEFAULT 0,
    spent_amount    NUMERIC(14, 2) NOT NULL DEFAULT 0,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    start_date      DATE,
    end_date        DATE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_phase_status CHECK (
        status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
    )
);

CREATE INDEX idx_phases_project_id ON phases(project_id);

CREATE TRIGGER update_phases_updated_at
    BEFORE UPDATE ON phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
