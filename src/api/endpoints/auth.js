import client from "../client";

export function login({ email, password }) {
  return client.post("/login", { email, password });
}

export function register({
  name,
  email,
  password,
  university_id,
  city_id,
  sport_frequency,
  food,
  sports,
  social,
  schedule,
}) {
  return client.post("/register", {
    name,
    email,
    password,
    university_id,
    city_id,
    sport_frequency,
    food,
    sports,
    social,
    schedule,
  });
}

export function logout() {
  return client.post("/logout", {});
}

export function getMe() {
  return client.get("/me");
}

export function googleAuthAndroid({
  accessToken,
  idToken,
  university_id,
  city_id,
  sport_frequency,
  food,
  sports,
  social,
  schedule,
}) {
  return client.post("/google", {
    access_token: accessToken,
    accessToken,
    id_token: idToken,
    idToken,
    university_id,
    city_id,
    sport_frequency,
    food,
    sports,
    social,
    schedule,
  });
}

export function googleOnboarding({
  google_id,
  email,
  name,
  university_id,
  city_id,
  sport_frequency,
  food,
  sports,
  social,
  schedule,
}) {
  return client.post("/onboarding", {
    google_id,
    email,
    name,
    university_id,
    city_id,
    sport_frequency,
    food,
    sports,
    social,
    schedule,
  });
}
