
import { useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import "./styles/Admin.css";

const API = "http://localhost:8080/api/auth";

function AdminApp({ onBack }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("adminUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      sessionStorage.removeItem("adminUser");
      return null;
    }
  });

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setShowPassword(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your Admin email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode !== "login" && password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (mode !== "login" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      let endpoint;
      let body;

      if (mode === "login") {
        endpoint = "/staff-login";
        body = {
          email: normalizedEmail,
          password,
          role: "ADMIN",
        };
      } else if (mode === "register") {
        endpoint = "/admin-register";
        body = {
          email: normalizedEmail,
          password,
          confirmPassword,
        };
      } else {
        endpoint = "/admin-reset-password";
        body = {
          email: normalizedEmail,
          newPassword: password,
          confirmPassword,
        };
      }

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Request failed (${response.status}).`
        );
      }

      if (mode === "login") {
        if (String(data.role || "").toUpperCase() !== "ADMIN") {
          throw new Error("This account is not an Admin account.");
        }

        const adminUser = {
          id: data.id,
          username: data.username || "Administrator",
          email: data.email || normalizedEmail,
          role: data.role,
        };

        sessionStorage.setItem("adminUser", JSON.stringify(adminUser));
        setUser(adminUser);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMessage("");
        setError("");
      } else {
        const successMessage =
          data.message ||
          (mode === "register"
            ? "Admin account created successfully. You can now log in."
            : "Admin password updated. You can now log in.");

        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setError("");
        setMessage(successMessage);
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Cannot connect to the backend. Check that the backend is running."
        );
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminUser");
    setUser(null);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    changeMode("login");
  }

  if (user) {
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          style={{
            margin: "10px",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          ← Portal Selection
        </button>

        <AdminDashboard user={user} onLogout={handleLogout} />
      </div>
    );
  }

  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "register"
        ? "Create Admin Account"
        : "Reset Admin Password";

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          margin: "10px",
          padding: "8px 14px",
          cursor: "pointer",
        }}
      >
        ← Portal Selection
      </button>

      <main className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-logo">A</div>

          <p className="admin-login-label">ADMINISTRATION PORTAL</p>

          <h1>{title}</h1>

          <p className="admin-login-description">
            {mode === "login"
              ? "Sign in to manage the college placement portal."
              : mode === "register"
                ? "Create an administrator account."
                : "Set a new password for your Admin account."}
          </p>

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="admin-login-success" role="status">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="admin-password">
              {mode === "reset" ? "New Password" : "Password"}
            </label>

            <div className="admin-password-wrapper">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "reset" ? "Enter new password" : "Enter password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "login" ? undefined : 8}
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {mode !== "login" && (
              <>
                <label htmlFor="admin-confirm-password">
                  Confirm Password
                </label>

                <input
                  id="admin-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </>
            )}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : mode === "register"
                    ? "Create Account"
                    : "Reset Password"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login" ? (
              <>
                <button type="button" onClick={() => changeMode("register")}>
                  Create Account
                </button>

                <button type="button" onClick={() => changeMode("reset")}>
                  Forgot Password?
                </button>
              </>
            ) : (
              <button type="button" onClick={() => changeMode("login")}>
                Back to Login
              </button>
            )}
          </div>

          <p className="admin-login-footer">
            College Placement Management System
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminApp;
