import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory match store
interface Match { id: number; team1: string; team2: string; score: string }
let matches: Match[] = [];
let nextId = 1;

// Connected SSE clients
const clients = new Set<Response>();

function broadcastAll() {
  const payload = JSON.stringify(matches);
  for (const res of clients) {
    res.write(`data: ${payload}\n\n`);
  }
}

// SSE endpoint
app.get("/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Add client
  clients.add(res);
  // Send initial state
  res.write(`data: ${JSON.stringify(matches)}\n\n`);

  // Heartbeat
  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
    res.end();
  });
});

// Create match
app.post("/matches", (req: Request, res: Response) => {
  const { team1, team2 } = req.body ?? {};
  if (!team1 || !team2) {
    return res.status(400).json({ error: "team1 and team2 are required" });
  }
  const match: Match = { id: nextId++, team1: String(team1).trim(), team2: String(team2).trim(), score: "0 : 0" };
  matches.push(match);
  broadcastAll();
  res.status(201).json(match);
});

// Update match score
app.put("/matches/:id", (req: Request, res: Response) => {
  const rawId = req.params.id!;
  const id = Number(rawId);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const match = matches.find(m => m.id === id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  const { score, team1, team2 } = req.body ?? {};
  if (team1) match.team1 = String(team1).trim();
  if (team2) match.team2 = String(team2).trim();
  if (score) {
    const s = String(score).trim();
    const pattern = /^\d+\s*:\s*\d+$/; // e.g. 2 : 1
    if (!pattern.test(s)) {
      return res.status(400).json({ error: "Score must be: number : number (e.g. 3 : 2)" });
    }
    const [a, b] = s.split(':').map(x => x.trim());
    match.score = `${a} : ${b}`; // normalized spacing
  }
  broadcastAll();
  res.json(match);
});

// Optional delete
app.delete("/matches/:id", (req: Request, res: Response) => {
  const rawId = req.params.id!;
  const id = Number(rawId);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const before = matches.length;
  matches = matches.filter(m => m.id !== id);
  if (matches.length === before) return res.status(404).json({ error: "Match not found" });
  broadcastAll();
  res.status(204).send();
});

// List matches
app.get("/matches", (_req: Request, res: Response) => {
  res.json(matches);
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Football Live Score Server (SSE)");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
