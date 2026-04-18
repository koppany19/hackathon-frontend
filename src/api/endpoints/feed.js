import client from "../client";

export function getFeed(universityId) {
  return client.get(`/feed/${universityId}`);
}
