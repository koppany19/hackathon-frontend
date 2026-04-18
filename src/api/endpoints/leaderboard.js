import client from "../client";

export function fetchLeaderboard() {
  return client.get("/leaderboard", {});
}
