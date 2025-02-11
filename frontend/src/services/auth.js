const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    return response.json();
  } catch (error) {
    return { detail: "Failed to connect to the server." };
  }
};

export const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};

export async function getCurrentUser() {
  try {
    const response = await fetch("http://localhost:8000/auth/me", {
      method: "GET",
      credentials: "include", // Important to send session cookies
    });

    if (!response.ok) {
      return null; // Not authenticated
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}
