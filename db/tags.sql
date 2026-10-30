-- Tag system for the directory-based YAKAP API.
--
-- The Neon database is managed outside this repo (no migrations run here), so
-- this file is a reference script: run it once against the Neon database to
-- create the tables and seed sample tags + associations. It is idempotent and
-- safe to re-run.
--
-- The table/column names mirror zenstack/schema.zmodel:
--   Tag          -> tags            (id, name, slug, description)
--   FacilityTag  -> facility_tags   (facility_id, tag_id)

-- 1. Tables
CREATE TABLE IF NOT EXISTS tags (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS facility_tags (
    facility_id BIGINT NOT NULL REFERENCES health_facilities(id) ON DELETE CASCADE,
    tag_id      BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT facility_tags_pkey PRIMARY KEY (facility_id, tag_id)
);

-- 2. Seed tags (upsert so re-runs keep name/description in sync)
INSERT INTO tags (name, slug, description) VALUES
    ('Hospital',        'hospital',          'Full-service hospital or medical center'),
    ('Clinic',          'clinic',            'Outpatient or medical clinic'),
    ('Birthing Home',   'birthing-home',     'Birthing / maternity / lying-in facility'),
    ('Pharmacy',        'pharmacy',          'Pharmacy or drugstore'),
    ('Rural Health Unit','rural-health-unit', 'Rural health unit (RHU)'),
    ('Health Center',   'health-center',     'Health center'),
    ('Accredited',      'accredited',        'With YAKAP prescription (PhilHealth-accredited)')
ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Remove obsolete seeded tags (no longer in the seed set above). FK cascade
--    clears their facility_tags rows.
DELETE FROM tags WHERE slug IN ('dialysis-center');

-- 4. Rebuild associations from name/column heuristics. Scoped to the seeded
--    tags only, so any non-seeded tags/links are left untouched. DELETE-then-
--    INSERT makes the backfill converge on every run.
DELETE FROM facility_tags
WHERE tag_id IN (SELECT id FROM tags WHERE slug IN (
    'hospital', 'clinic', 'birthing-home', 'pharmacy', 'rural-health-unit', 'health-center', 'accredited'
));

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'hospital'
WHERE f.health_facility_name ILIKE '%HOSPITAL%'
   OR f.health_facility_name ILIKE '%MEDICAL CENTER%'
   OR f.health_facility_name ILIKE '%INFIRMARY%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'clinic'
WHERE f.health_facility_name ILIKE '%CLINIC%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'birthing-home'
WHERE f.health_facility_name ILIKE '%BIRTHING%'
   OR f.health_facility_name ILIKE '%MATERNITY%'
   OR f.health_facility_name ILIKE '%MATERNAL%'
   OR f.health_facility_name ILIKE '%LYING-IN%'
   OR f.health_facility_name ILIKE '%LYING IN%'
   OR f.health_facility_name ILIKE '%BIRTH-IN%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'pharmacy'
WHERE f.health_facility_name ILIKE '%PHARMACY%'
   OR f.health_facility_name ILIKE '%DRUG%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'rural-health-unit'
WHERE f.health_facility_name ILIKE '%RURAL HEALTH UNIT%'
   OR f.health_facility_name ILIKE '%RHU%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'health-center'
WHERE f.health_facility_name ILIKE '%HEALTH CENTER%';

INSERT INTO facility_tags (facility_id, tag_id)
SELECT f.id, t.id
FROM health_facilities f
JOIN tags t ON t.slug = 'accredited'
WHERE f.with_yakap_prescription = TRUE;
