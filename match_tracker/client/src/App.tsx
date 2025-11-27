import React, { useEffect, useMemo, useState } from "react";
import MatchList from "./components/MatchList";
import AdminPanel from "./components/AdminPanel";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const ROLE = import.meta.env.VITE_ROLE || "user";

export type Match = {
  id: number;
  team1: string;
  team2: string;
  score: string;
};

export default function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const selected = useMemo(
    () => matches.find((m) => m.id === selectedId) || null,
    [selectedId, matches]
  );
  const eventsUrl = useMemo(() => `${SERVER_URL}/events`, []);

  useEffect(() => {
    fetch(`${SERVER_URL}/matches`)
      .then((r) => r.json())
      .then(setMatches)
      .catch(() => {});
    const es = new EventSource(eventsUrl);
    es.onopen = () => setLive(true);
    es.onmessage = (e) => {
      try {
        setMatches(JSON.parse(e.data) as Match[]);
      } catch {}
    };
    es.onerror = () => setLive(false);
    return () => {
      setLive(false);
      es.close();
    };
  }, [eventsUrl]);

  const addMatch = async (team1: string, team2: string) => {
    const res = await fetch(`${SERVER_URL}/matches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN || "",
      },
      body: JSON.stringify({ team1, team2 }),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).error ||
          `Create failed (${res.status})`
      );
  };
  const updateMatch = async (
    id: number,
    patch: Partial<Pick<Match, "team1" | "team2" | "score">>
  ) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN || "",
      },
      body: JSON.stringify(patch),
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => ({}))).error ||
          `Update failed (${res.status})`
      );
  };
  const deleteMatch = async (id: number) => {
    const res = await fetch(`${SERVER_URL}/matches/${id}`, {
      method: "DELETE",
      headers: { "x-admin-token": import.meta.env.VITE_ADMIN_TOKEN || "" },
    });
    if (!res.ok && res.status !== 204)
      throw new Error(
        (await res.json().catch(() => ({}))).error ||
          `Delete failed (${res.status})`
      );
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="container">
      <header className="header-bar">
        <div>
          <h1 className="brand-title">
            FOOTBALL<span style={{ fontWeight: 300 }}>LIVE</span>
          </h1>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#666",
              fontWeight: 500,
            }}>
            OFFICIAL MATCH DATA FEED
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            className="connection-pill"
            style={{
              borderColor: live ? "var(--live-color)" : "#333",
              color: live ? "#fff" : "#666",
            }}>
            <span
              className="pulsar"
              style={{
                background: live ? "var(--live-color)" : "#444",
                animation: live ? "pulse 1.5s infinite" : "none",
              }}></span>
            {live ? "SERVER CONNECTED" : "OFFLINE"}
          </div>
          <div
            style={{
              fontSize: 10,
              marginTop: 6,
              color: "#444",
              fontWeight: "bold",
            }}>
            {SERVER_URL}
          </div>
        </div>
      </header>

      {ROLE === "admin" ? (
        <div className="dashboard-grid">
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 20,
              }}>
              <h2 style={{ fontSize: 18, color: "#fff" }}>Live Matches</h2>
              <span style={{ fontSize: 12, color: "#666" }}>
                {matches.length} MATCHES LIVE
              </span>
            </div>
            <MatchList
              matches={matches}
              onUpdate={updateMatch}
              onDelete={deleteMatch}
            />
          </section>

          <aside>
            <AdminPanel onCreate={addMatch} />
          </aside>
        </div>
      ) : (
        <div className="dashboard-grid user-mode">
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 20,
              }}>
              <h2 style={{ fontSize: 18, color: "#fff" }}>Matchday Feed</h2>
            </div>
            <div className="match-list">
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`match-card ${
                    selectedId === m.id ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}>
                  <div className="match-content">
                    <div className="team-name team-left">{m.team1}</div>
                    <div className="score-container">
                      <div
                        className="score-display"
                        style={{
                          fontSize: 28,
                          padding: "2px 12px",
                          minWidth: 80,
                        }}>
                        {m.score}
                      </div>
                      <div
                        className="live-badge"
                        style={{ marginTop: 4, fontSize: 9 }}>
                        <span
                          className="pulsar"
                          style={{ width: 4, height: 4 }}></span>{" "}
                        LIVE
                      </div>
                    </div>
                    <div className="team-name team-right">{m.team2}</div>
                  </div>
                </div>
              ))}
              {matches.length === 0 && (
                <div className="muted text-center" style={{ padding: 40 }}>
                  Waiting for match data...
                </div>
              )}
            </div>
          </section>

          <aside>
            <div
              className="panel"
              style={{
                position: "sticky",
                top: 24,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                borderRadius: "12px",
              }}>
              <div className="panel-header">
                <h3 className="panel-title" style={{ fontWeight: 600 }}>
                  MATCH CENTER
                </h3>
              </div>
              <div style={{ padding: 30, textAlign: "center" }}>
                {selected ? (
                  <>
                    {/* Live Coverage Indicator */}
                    <div
                      style={{
                        fontSize: 12,
                        color: "#32CD32", // Bright green for live
                        fontWeight: "bold",
                        letterSpacing: 1.5,
                        marginBottom: 20,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "rgba(50, 205, 50, 0.1)",
                        display: "inline-block",
                      }}>
                      LIVE COVERAGE
                    </div>

                    {/* Team Names */}
                    <h3
                      style={{
                        fontSize: 26,
                        margin: "0 0 10px 0",
                        color: "#fff",
                        fontWeight: 700,
                      }}>
                      {selected.team1}
                    </h3>
                    <span
                      style={{
                        color: "#666",
                        fontSize: 16,
                        fontWeight: 300,
                        display: "block",
                        marginBottom: 10,
                      }}>
                      VS
                    </span>
                    <h3
                      style={{
                        fontSize: 26,
                        margin: "0 0 30px 0",
                        color: "#fff",
                        fontWeight: 700,
                      }}>
                      {selected.team2}
                    </h3>

                    {/* Score Display */}
                    <div
                      className="score-display"
                      style={{
                        fontSize: 80, // Larger score
                        display: "inline-block",
                        color: "var(--brand-color, #1e90ff)", // Distinct color
                        fontWeight: "900",
                        textShadow: "0 0 20px rgba(30, 144, 255, 0.4)", // Subtle glow
                        lineHeight: 1,
                        padding: "10px 25px",
                        borderRadius: 10,
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.03)",
                      }}>
                      {selected.score}
                    </div>

                    {/* Simple Update Message */}
                    <p
                      className="muted"
                      style={{
                        marginTop: 30,
                        borderTop: "1px solid #222",
                        paddingTop: 20,
                        fontSize: 13,
                      }}>
                      The score updates automatically in real-time.
                    </p>
                  </>
                ) : (
                  <div style={{ padding: "30px 0", color: "#666" }}>
                    <div
                      style={{ fontSize: 48, opacity: 0.4, marginBottom: 15 }}>
                      ✨
                    </div>
                    <p className="muted" style={{ fontSize: 15 }}>
                      Pick a match from the list <br /> to see the live updates!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
