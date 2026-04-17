import client from "../client";

export function login({ email, password }) {
  return client.post("/login", { email, password });
}

export function register({ name, email, password }) {
  return client.post("/register", { name, email, password });
}

export function logout() {
  return client.post("/logout", {});
}

export function googleAuthAndroid({ accessToken, idToken }) {
  return client.post("/google", {
    access_token: accessToken,
    accessToken,
    id_token: idToken,
    idToken,
  });
}
