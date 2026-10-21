/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import path from 'path';
import fs from 'fs';
import type Database from 'better-sqlite3';
import { Guide } from './types';
import { presetGuides } from './guides-data';

// In-memory store fallback (used on Vercel serverless or when better-sqlite3 native addon is unavailable)
const memoryGuides: Guide[] = [...presetGuides];

let _db: Database.Database | null = null;
let _sqliteAvailable: boolean | null = null;

function initSqlite(): Database.Database | null {
  if (_sqliteAvailable === false) return null;
  if (_db) return _db;

  try {
    // Dynamic require so module loads without crashing if native addon is missing
    const DatabaseConstructor = require('better-sqlite3');
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const DATA_DIR = isServerless
      ? '/tmp'
      : (process.env.DATABASE_PATH
        ? path.dirname(process.env.DATABASE_PATH)
        : path.join(process.cwd(), 'data'));

    const DB_PATH = isServerless
      ? '/tmp/guides.db'
      : (process.env.DATABASE_PATH || path.join(DATA_DIR, 'guides.db'));

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    _db = new DatabaseConstructor(DB_PATH) as Database.Database;
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

    // Seed or sync preset guides
    const insert = _db.prepare(`
      INSERT OR REPLACE INTO guides (
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

    _sqliteAvailable = true;
    return _db;
  } catch (err) {
    console.warn('SQLite native addon unavailable, using in-memory store:', err);
    _sqliteAvailable = false;
    _db = null;
    return null;
  }
}

export function getDb(): Database.Database | null {
  return initSqlite();
}

export function getAllGuides(): Guide[] {
  const db = initSqlite();
  if (db) {
    try {
      const rows = db.prepare('SELECT guide_json FROM guides ORDER BY is_preset DESC, created_at DESC').all() as { guide_json: string }[];
      return rows.map((r: { guide_json: string }) => JSON.parse(r.guide_json) as Guide);
    } catch {
      // Fallback
    }
  }
  return memoryGuides;
}

export function getGuideByIdOrSlug(idOrSlug: string): Guide | null {
  const db = initSqlite();
  if (db) {
    try {
      const row = db
        .prepare('SELECT guide_json FROM guides WHERE id = ? OR slug = ?')
        .get(idOrSlug, idOrSlug) as { guide_json: string } | undefined;
      if (row) {
        return JSON.parse(row.guide_json) as Guide;
      }
    } catch {
      // Fallback
    }
  }
  return memoryGuides.find((g) => g.id === idOrSlug || g.slug === idOrSlug) || null;
}

export function deleteGuide(id: string): void {
  // Remove from memory (only non-presets)
  const idx = memoryGuides.findIndex((g) => g.id === id && !g.isPreset);
  if (idx >= 0) memoryGuides.splice(idx, 1);

  const db = initSqlite();
  if (db) {
    try {
      db.prepare('DELETE FROM guides WHERE id = ? AND is_preset = 0').run(id);
    } catch {
      // Silent fallback
    }
  }
}

export function saveGuide(guide: Guide): void {
  // Always update in-memory
  const existingIdx = memoryGuides.findIndex((g) => g.id === guide.id || g.slug === guide.slug);
  if (existingIdx >= 0) {
    memoryGuides[existingIdx] = guide;
  } else {
    memoryGuides.unshift(guide);
  }

  const db = initSqlite();
  if (db) {
    try {
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
    } catch {
      // Fallback silently handled by memory store
    }
  }
}
