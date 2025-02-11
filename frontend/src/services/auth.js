const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
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
    const response = await fetch("http://127.0.0.1:8000/auth/me", {
      method: "GET",
      credentials: "include", // Critical for cookies
    });

    console.log("GET /auth/me response:", response);

    if (!response.ok) {
      console.error("Auth check failed:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking auth:", error);
    return null;
  }
}
