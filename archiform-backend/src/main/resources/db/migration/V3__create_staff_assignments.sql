-- ============================================================
-- V3: Staff Members and Staff Assignments
-- ============================================================

-- ── Staff Members ────────────────────────────────────────────
CREATE TABLE staff_members (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id              UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title                VARCHAR(100),
    department           VARCHAR(100),
    hourly_rate          NUMERIC(10, 2) NOT NULL DEFAULT 0,
    target_utilization   INTEGER NOT NULL DEFAULT 80,  -- percentage 0-100
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_staff_firm_user UNIQUE (firm_id, user_id)
);

CREATE INDEX idx_staff_members_firm_id  ON staff_members(firm_id);
CREATE INDEX idx_staff_members_user_id  ON staff_members(user_id);

CREATE TRIGGER update_staff_members_updated_at
    BEFORE UPDATE ON staff_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Staff Assignments ────────────────────────────────────────
CREATE TABLE staff_assignments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id         UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id         UUID REFERENCES phases(id) ON DELETE SET NULL,
    allocated_hours  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    start_date       DATE NOT NULL,
    end_date         DATE NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_staff_id   ON staff_assignments(staff_id);
CREATE INDEX idx_assignments_project_id ON staff_assignments(project_id);
CREATE INDEX idx_assignments_phase_id   ON staff_assignments(phase_id);

CREATE TRIGGER update_staff_assignments_updated_at
    BEFORE UPDATE ON staff_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
