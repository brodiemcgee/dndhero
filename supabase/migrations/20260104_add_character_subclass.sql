-- Add subclass and level-up choice columns to characters table
-- subclass: The character's chosen subclass (e.g., "champion", "life_domain")
-- asi_choices: Array of ASI/feat choices made at each ASI level
-- hp_choices: Array of HP choices (roll or average) for each level beyond 1

ALTER TABLE characters ADD COLUMN IF NOT EXISTS subclass TEXT;

ALTER TABLE characters ADD COLUMN IF NOT EXISTS asi_choices JSONB DEFAULT '[]'::jsonb;

ALTER TABLE characters ADD COLUMN IF NOT EXISTS hp_choices JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the JSONB structure
COMMENT ON COLUMN characters.asi_choices IS 'Array of {level, type: "asi"|"feat", asiAbility1?, asiAbility2?, asiMode?, featId?}';
COMMENT ON COLUMN characters.hp_choices IS 'Array of {level, method: "average"|"roll", value, conModifier}';
