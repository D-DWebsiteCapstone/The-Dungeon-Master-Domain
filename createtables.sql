    CREATE TABLE IF NOT EXISTS npcs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        campaign UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        "createdBy" TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_npcs_campaign ON npcs(campaign);