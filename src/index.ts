import { DurableObject } from "cloudflare:workers";
import { Hono } from "hono";

export class App extends DurableObject {
  private app = new Hono();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initDatabase();
    this.setupRoutes();
  }

  private initDatabase() {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS high_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        mission_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        time_seconds INTEGER NOT NULL,
        kills INTEGER NOT NULL,
        stealth_rating TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS custom_missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        map_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        mission_data TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        missions_completed INTEGER DEFAULT 0,
        total_kills INTEGER DEFAULT 0,
        stealth_kills INTEGER DEFAULT 0,
        alarms_triggered INTEGER DEFAULT 0,
        unlocked_weapons TEXT DEFAULT '["combat_knife","pistol_sd","mp5_sd","ak47","svd_sniper"]'
      );
    `);

    // Insert initial row for player_stats if not present
    const existing = this.ctx.storage.sql.exec(`SELECT id FROM player_stats WHERE id = 1`).toArray();
    if (existing.length === 0) {
      this.ctx.storage.sql.exec(`INSERT INTO player_stats (id, missions_completed, total_kills, stealth_kills, alarms_triggered) VALUES (1, 0, 0, 0, 0)`);
    }
  }

  private setupRoutes() {
    // Get High Scores
    this.app.get("/api/scores", (c) => {
      const missionId = c.req.query("mission_id");
      let query = `SELECT * FROM high_scores`;
      const params: any[] = [];
      if (missionId) {
        query += ` WHERE mission_id = ?`;
        params.push(missionId);
      }
      query += ` ORDER BY score DESC, time_seconds ASC LIMIT 20`;
      
      const rows = this.ctx.storage.sql.exec(query, ...params).toArray();
      return c.json({ scores: rows });
    });

    // Save Score
    this.app.post("/api/scores", async (c) => {
      const body = await c.req.json<{
        player_name: string;
        mission_id: string;
        score: number;
        time_seconds: number;
        kills: number;
        stealth_rating: string;
      }>();

      const name = (body.player_name || "Agent Jones").trim().slice(0, 20);
      const missionId = body.mission_id || "mission_1";
      const score = Math.max(0, Math.floor(body.score || 0));
      const time = Math.max(1, Math.floor(body.time_seconds || 0));
      const kills = Math.max(0, Math.floor(body.kills || 0));
      const rating = body.stealth_rating || "Commando";

      this.ctx.storage.sql.exec(
        `INSERT INTO high_scores (player_name, mission_id, score, time_seconds, kills, stealth_rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        name,
        missionId,
        score,
        time,
        kills,
        rating,
        Date.now()
      );

      // Update total player stats
      this.ctx.storage.sql.exec(
        `UPDATE player_stats SET missions_completed = missions_completed + 1, total_kills = total_kills + ? WHERE id = 1`,
        kills
      );

      return c.json({ success: true, message: "Mission debrief score archived." });
    });

    // Get Player Stats
    this.app.get("/api/stats", (c) => {
      const stats = this.ctx.storage.sql.exec(`SELECT * FROM player_stats WHERE id = 1`).toArray()[0] || {};
      return c.json(stats);
    });

    // Update Player Stats (e.g. stats incremental)
    this.app.post("/api/stats/increment", async (c) => {
      const body = await c.req.json<{
        stealth_kills?: number;
        alarms_triggered?: number;
      }>();

      if (body.stealth_kills) {
        this.ctx.storage.sql.exec(`UPDATE player_stats SET stealth_kills = stealth_kills + ? WHERE id = 1`, body.stealth_kills);
      }
      if (body.alarms_triggered) {
        this.ctx.storage.sql.exec(`UPDATE player_stats SET alarms_triggered = alarms_triggered + ? WHERE id = 1`, body.alarms_triggered);
      }

      return c.json({ success: true });
    });

    // Custom Missions API
    this.app.get("/api/custom-missions", (c) => {
      const rows = this.ctx.storage.sql.exec(`SELECT id, title, description, map_type, difficulty, author, created_at FROM custom_missions ORDER BY created_at DESC LIMIT 20`).toArray();
      return c.json({ missions: rows });
    });

    this.app.get("/api/custom-missions/:id", (c) => {
      const id = c.req.param("id");
      const rows = this.ctx.storage.sql.exec(`SELECT * FROM custom_missions WHERE id = ?`, id).toArray();
      if (rows.length === 0) {
        return c.json({ error: "Mission not found" }, 404);
      }
      return c.json(rows[0]);
    });

    this.app.post("/api/custom-missions", async (c) => {
      const body = await c.req.json<{
        id: string;
        title: string;
        description: string;
        map_type: string;
        difficulty: string;
        mission_data: any;
        author: string;
      }>();

      const id = body.id || `custom_${Date.now()}`;
      this.ctx.storage.sql.exec(
        `INSERT INTO custom_missions (id, title, description, map_type, difficulty, mission_data, author, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        body.title || "Custom Outpost Infiltration",
        body.description || "Infiltrate target zone and eliminate all hostiles.",
        body.map_type || "military_base",
        body.difficulty || "Normal",
        JSON.stringify(body.mission_data || {}),
        body.author || "David Jones",
        Date.now()
      );

      return c.json({ success: true, id });
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}
