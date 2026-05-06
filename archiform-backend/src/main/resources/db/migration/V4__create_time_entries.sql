-- ============================================================
-- V4: Time Entries
-- ============================================================

CREATE TABLE time_entries (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id      UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    staff_id     UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id     UUID REFERENCES phases(id) ON DELETE SET NULL,
    entry_date   DATE NOT NULL,
    hours        NUMERIC(6, 2) NOT NULL,
    description  TEXT,
    is_billable  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_hours_positive CHECK (hours > 0),
    CONSTRAINT chk_hours_max      CHECK (hours <= 24)
);

CREATE INDEX idx_time_entries_firm_id    ON time_entries(firm_id);
CREATE INDEX idx_time_entries_staff_id   ON time_entries(staff_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_date       ON time_entries(entry_date);
CREATE INDEX idx_time_entries_firm_date  ON time_entries(firm_id, entry_date);

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
