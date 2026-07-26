import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface Annotation {
  id: number;
  prId: string;
  line: number | null; // Null means general PR review, number means specific line
  user: string;
  text: string;
  timestamp: string;
}

export interface PRMetric {
  prId: string;
  title: string;
  timeToMergeHours: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  status: string;
}

class DatabaseManager {
  private pool: Pool | null = null;
  private isPostgres = false;
  private jsonDbPath = path.join(__dirname, 'db.json');

  // In-memory fallback
  private mockAnnotations: Annotation[] = [];
  private mockMetrics: PRMetric[] = [];

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      console.log('Database URL detected. Trying Postgres...');
      this.pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 5000,
      });
      this.isPostgres = true;
    } else {
      console.log('No DATABASE_URL found. Using local JSON database fallback.');
    }
  }

  async init() {
    if (this.isPostgres && this.pool) {
      try {
        const client = await this.pool.connect();
        console.log('Successfully connected to Postgres DB.');
        
        // Create Annotations Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS annotations (
            id SERIAL PRIMARY KEY,
            pr_id VARCHAR(50) NOT NULL,
            line INTEGER,
            user_name VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            timestamp VARCHAR(50) NOT NULL
          );
        `);

        // Create Metrics Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS pr_metrics (
            pr_id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            time_to_merge_hours INTEGER NOT NULL,
            files_changed INTEGER NOT NULL,
            lines_added INTEGER NOT NULL,
            lines_removed INTEGER NOT NULL,
            status VARCHAR(50) NOT NULL
          );
        `);

        client.release();
        await this.seedMetrics();
        console.log('Postgres Database initialized and seeded.');
      } catch (err) {
        console.error('Failed to initialize Postgres database. Falling back to JSON database.', err);
        this.isPostgres = false;
        this.pool = null;
        this.initJsonDb();
      }
    } else {
      this.initJsonDb();
    }
  }

  private initJsonDb() {
    if (fs.existsSync(this.jsonDbPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.jsonDbPath, 'utf8'));
        this.mockAnnotations = data.annotations || [];
        this.mockMetrics = data.metrics || [];
        console.log('JSON database loaded successfully.');
      } catch (e) {
        console.error('Failed to parse JSON db file. Resetting db.', e);
        this.seedJsonDb();
      }
    } else {
      this.seedJsonDb();
    }
  }

  private seedJsonDb() {
    this.mockAnnotations = [];
    this.mockMetrics = this.getSeedData();
    this.saveJsonDb();
    console.log('JSON database seeded and created.');
  }

  private getSeedData(): PRMetric[] {
    return [
      { prId: '101', title: 'refactor: Rewrite authentication hook flow', timeToMergeHours: 14, filesChanged: 8, linesAdded: 142, linesRemoved: 90, status: 'closed' },
      { prId: '102', title: 'feat: Add real-time visual code canvas', timeToMergeHours: 32, filesChanged: 15, linesAdded: 520, linesRemoved: 40, status: 'closed' },
      { prId: '103', title: 'fix: Resolve web socket reconnection leak', timeToMergeHours: 3, filesChanged: 2, linesAdded: 25, linesRemoved: 12, status: 'closed' },
      { prId: '104', title: 'chore: Setup docker deployment workflow', timeToMergeHours: 8, filesChanged: 4, linesAdded: 88, linesRemoved: 2, status: 'closed' },
      { prId: '105', title: 'docs: Update contributing guide and API docs', timeToMergeHours: 1, filesChanged: 1, linesAdded: 15, linesRemoved: 0, status: 'closed' },
      { prId: '106', title: 'perf: Optimize database index matching query', timeToMergeHours: 24, filesChanged: 5, linesAdded: 110, linesRemoved: 45, status: 'closed' },
      { prId: '107', title: 'style: Dark theme enhancements and glass panels', timeToMergeHours: 5, filesChanged: 3, linesAdded: 70, linesRemoved: 15, status: 'closed' },
    ];
  }

  private async seedMetrics() {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT COUNT(*) FROM pr_metrics');
      if (parseInt(res.rows[0].count) === 0) {
        const seedData = this.getSeedData();
        for (const pr of seedData) {
          await this.pool.query(
            `INSERT INTO pr_metrics (pr_id, title, time_to_merge_hours, files_changed, lines_added, lines_removed, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [pr.prId, pr.title, pr.timeToMergeHours, pr.filesChanged, pr.linesAdded, pr.linesRemoved, pr.status]
          );
        }
      }
    }
  }

  private saveJsonDb() {
    fs.writeFileSync(
      this.jsonDbPath,
      JSON.stringify({ annotations: this.mockAnnotations, metrics: this.mockMetrics }, null, 2),
      'utf8'
    );
  }

  // --- Public DB API Methods ---

  async getAnnotations(prId: string): Promise<Annotation[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'SELECT id, pr_id as "prId", line, user_name as user, text, timestamp FROM annotations WHERE pr_id = $1 ORDER BY id ASC',
        [prId]
      );
      return res.rows;
    }
    return this.mockAnnotations.filter(ann => ann.prId === prId);
  }

  async saveAnnotation(prId: string, annotation: { id: number; line: number | null; user: string; text: string; timestamp: string }): Promise<Annotation> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO annotations (pr_id, line, user_name, text, timestamp)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, pr_id as "prId", line, user_name as user, text, timestamp`,
        [prId, annotation.line, annotation.user, annotation.text, annotation.timestamp]
      );
      return res.rows[0];
    }
    const newAnn: Annotation = {
      id: annotation.id || Date.now(),
      prId,
      line: annotation.line,
      user: annotation.user,
      text: annotation.text,
      timestamp: annotation.timestamp,
    };
    this.mockAnnotations.push(newAnn);
    this.saveJsonDb();
    return newAnn;
  }

  async getMetrics(): Promise<PRMetric[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT pr_id as "prId", title, time_to_merge_hours as "timeToMergeHours",
         files_changed as "filesChanged", lines_added as "linesAdded", lines_removed as "linesRemoved", status FROM pr_metrics`
      );
      return res.rows;
    }
    return this.mockMetrics;
  }

  async savePrMetric(metric: PRMetric): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query(
        `INSERT INTO pr_metrics (pr_id, title, time_to_merge_hours, files_changed, lines_added, lines_removed, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (pr_id) DO UPDATE SET
         title = $2, time_to_merge_hours = $3, files_changed = $4, lines_added = $5, lines_removed = $6, status = $7`,
        [metric.prId, metric.title, metric.timeToMergeHours, metric.filesChanged, metric.linesAdded, metric.linesRemoved, metric.status]
      );
      return;
    }
    const idx = this.mockMetrics.findIndex(m => m.prId === metric.prId);
    if (idx !== -1) {
      this.mockMetrics[idx] = metric;
    } else {
      this.mockMetrics.push(metric);
    }
    this.saveJsonDb();
  }
}

export const db = new DatabaseManager();
