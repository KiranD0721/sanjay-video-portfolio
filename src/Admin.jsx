
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          const { data: isAdmin, error: adminError } =
            await supabase.rpc("is_admin");

          if (adminError) throw adminError;

          if (!active) return;

          if (isAdmin === true) {
            navigate("/admin/dashboard", { replace: true });
            return;
          }

          await supabase.auth.signOut();
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to verify your admin session.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) throw loginError;
      if (!data.user) throw new Error("Unable to identify the signed-in user.");

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError) throw adminError;

      if (isAdmin !== true) {
        await supabase.auth.signOut();
        throw new Error(
          "This account is not authorized as an administrator. Please verify the admin user configuration."
        );
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main style={styles.page}>
        <p>Checking admin session...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleLogin} style={styles.card}>
        <p style={styles.eyebrow}>SANJAY'S PORTFOLIO</p>

        <h1 style={styles.heading}>Admin Login</h1>

        <p style={styles.subtitle}>
          Sign in to manage portfolio videos and sharing links.
        </p>

        <label style={styles.label} htmlFor="email">
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your admin email"
          required
          style={styles.input}
        />

        <label style={styles.label} htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          style={styles.input}
        />

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={styles.backButton}
        >
          Back to portfolio
        </button>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    boxSizing: "border-box",
    background: "#101010",
    color: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    padding: "32px",
    background: "#191919",
    border: "1px solid #333",
    borderRadius: "16px",
  },
  eyebrow: {
    color: "#d6a64d",
    fontSize: "12px",
    letterSpacing: "2px",
  },
  heading: {
    marginBottom: "8px",
    fontSize: "30px",
  },
  subtitle: {
    color: "#aaa",
    lineHeight: 1.5,
    marginBottom: "28px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginBottom: "20px",
    color: "#fff",
    background: "#101010",
    border: "1px solid #444",
    borderRadius: "8px",
  },
  button: {
    width: "100%",
    padding: "13px",
    color: "#101010",
    background: "#d6a64d",
    border: 0,
    borderRadius: "8px",
    fontWeight: "bold",
  },
  backButton: {
    width: "100%",
    marginTop: "16px",
    padding: "10px",
    color: "#ccc",
    background: "transparent",
    border: 0,
    cursor: "pointer",
  },
  error: {
    color: "#ff8585",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: 1.5,
  },
};
