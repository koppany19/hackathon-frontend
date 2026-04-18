import client from "../client";

export function searchCities({ q }) {
  const query = encodeURIComponent(q ?? "");
  return client.get(`/search/cities?q=${query}`);
}

export function searchUniversities({ q }) {
  const query = encodeURIComponent(q ?? "");
  return client.get(`/search/universities?q=${query}`);
}
