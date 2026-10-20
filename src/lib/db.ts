import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Guide } from './types';
import { presetGuides } from './guides-data';

const DATA_DIR = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(process.cwd(), 'data');

const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'guides.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS guides (
      id TEXT PRIMARY KEY,
      app_name TEXT NOT NULL,
      app_domain TEXT,
      slug TEXT UNIQUE NOT NULL,
      recommended_path TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      hands_on_hours_min INTEGER,
      hands_on_hours_max INTEGER,
      elapsed_days_min INTEGER,
      elapsed_days_max INTEGER,
      approval_days_min INTEGER,
      approval_days_max INTEGER,
      composio_managed BOOLEAN,
      guide_json TEXT NOT NULL,
      sources_json TEXT,
      is_preset BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed preset guides if not already there
  const count = (_db.prepare('SELECT COUNT(*) as c FROM guides WHERE is_preset = 1').get() as { c: number }).c;
  if (count === 0) {
    const insert = _db.prepare(`
      INSERT OR IGNORE INTO guides (
        id, app_name, app_domain, slug, recommended_path, difficulty,
        hands_on_hours_min, hands_on_hours_max,
        elapsed_days_min, elapsed_days_max,
        approval_days_min, approval_days_max,
        composio_managed, guide_json, sources_json, is_preset
      ) VALUES (
        @id, @app_name, @app_domain, @slug, @recommended_path, @difficulty,
        @hands_on_hours_min, @hands_on_hours_max,
        @elapsed_days_min, @elapsed_days_max,
        @approval_days_min, @approval_days_max,
        @composio_managed, @guide_json, @sources_json, @is_preset
      )
    `);

    for (const guide of presetGuides) {
      insert.run({
        id: guide.id,
        app_name: guide.appName,
        app_domain: guide.appDomain || null,
        slug: guide.slug,
        recommended_path: guide.recommendedPath,
        difficulty: guide.difficulty,
        hands_on_hours_min: guide.handsOnHours.min,
        hands_on_hours_max: guide.handsOnHours.max,
        elapsed_days_min: guide.elapsedDays.min,
        elapsed_days_max: guide.elapsedDays.max,
        approval_days_min: guide.approvalDays?.min ?? null,
        approval_days_max: guide.approvalDays?.max ?? null,
        composio_managed: guide.composioManaged ? 1 : 0,
        guide_json: JSON.stringify(guide),
        sources_json: JSON.stringify(guide.sources),
        is_preset: 1,
      });
    }
  }

  return _db;
}

export function getAllGuides(): Guide[] {
  const db = getDb();
  const rows = db.prepare('SELECT guide_json FROM guides ORDER BY is_preset DESC, created_at DESC').all() as { guide_json: string }[];
  return rows.map((r) => JSON.parse(r.guide_json) as Guide);
}

export function getGuideByIdOrSlug(idOrSlug: string): Guide | null {
  const db = getDb();
  const row = db
    .prepare('SELECT guide_json FROM guides WHERE id = ? OR slug = ?')
    .get(idOrSlug, idOrSlug) as { guide_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.guide_json) as Guide;
}

export function saveGuide(guide: Guide): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO guides (
      id, app_name, app_domain, slug, recommended_path, difficulty,
      hands_on_hours_min, hands_on_hours_max,
      elapsed_days_min, elapsed_days_max,
      approval_days_min, approval_days_max,
      composio_managed, guide_json, sources_json, is_preset, updated_at
    ) VALUES (
      @id, @app_name, @app_domain, @slug, @recommended_path, @difficulty,
      @hands_on_hours_min, @hands_on_hours_max,
      @elapsed_days_min, @elapsed_days_max,
      @approval_days_min, @approval_days_max,
      @composio_managed, @guide_json, @sources_json, @is_preset, CURRENT_TIMESTAMP
    )
  `).run({
    id: guide.id,
    app_name: guide.appName,
    app_domain: guide.appDomain || null,
    slug: guide.slug,
    recommended_path: guide.recommendedPath,
    difficulty: guide.difficulty,
    hands_on_hours_min: guide.handsOnHours.min,
    hands_on_hours_max: guide.handsOnHours.max,
    elapsed_days_min: guide.elapsedDays.min,
    elapsed_days_max: guide.elapsedDays.max,
    approval_days_min: guide.approvalDays?.min ?? null,
    approval_days_max: guide.approvalDays?.max ?? null,
    composio_managed: guide.composioManaged ? 1 : 0,
    guide_json: JSON.stringify(guide),
    sources_json: JSON.stringify(guide.sources),
    is_preset: guide.isPreset ? 1 : 0,
  });
}
