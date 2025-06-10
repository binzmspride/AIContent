import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function addWorkspaceTables() {
  console.log('Adding collaborative workspace tables...');

  try {
    // Create enums first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE workspace_status AS ENUM ('active', 'archived', 'deleted');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE session_status AS ENUM ('active', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create workspaces table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        status workspace_status NOT NULL DEFAULT 'active',
        settings JSONB DEFAULT '{}',
        invite_code TEXT UNIQUE,
        is_public BOOLEAN NOT NULL DEFAULT false,
        max_members INTEGER NOT NULL DEFAULT 10,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create workspace_members table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role workspace_role NOT NULL DEFAULT 'viewer',
        invited_by INTEGER REFERENCES users(id),
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_active_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(workspace_id, user_id)
      );
    `);

    // Create collaborative_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS collaborative_sessions (
        id SERIAL PRIMARY KEY,
        workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
        name TEXT NOT NULL,
        description TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        status session_status NOT NULL DEFAULT 'active',
        prompt TEXT,
        image_style TEXT NOT NULL DEFAULT 'realistic',
        target_image_count INTEGER NOT NULL DEFAULT 1,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create session_images table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session_images (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES collaborative_sessions(id),
        image_id INTEGER NOT NULL REFERENCES images(id),
        contributed_by INTEGER NOT NULL REFERENCES users(id),
        version INTEGER NOT NULL DEFAULT 1,
        is_approved BOOLEAN NOT NULL DEFAULT false,
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        feedback TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create session_activity table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS session_activity (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES collaborative_sessions(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        activity_type TEXT NOT NULL,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_collaborative_sessions_workspace_id ON collaborative_sessions(workspace_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_session_images_session_id ON session_images(session_id);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_session_activity_session_id ON session_activity(session_id);
    `);

    console.log('✅ Successfully added collaborative workspace tables');
  } catch (error) {
    console.error('❌ Error adding workspace tables:', error);
    throw error;
  }
}

// Run the migration
addWorkspaceTables()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });