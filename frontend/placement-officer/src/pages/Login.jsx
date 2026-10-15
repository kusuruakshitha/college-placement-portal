
import { useState } from "react";

const API = "/api/auth";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  async function readResponse(response) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { message: text };
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    const normalizedEmail = email.trim().toLowerCase();

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
      if (mode === "login") {
        await onLogin(normalizedEmail, password);
        return;
      }

      const endpoint =
        mode === "register" ? "/staff-register" : "/staff-reset-password";

      const body =
        mode === "register"
          ? { email: normalizedEmail, password, confirmPassword }
          : {
              email: normalizedEmail,
              newPassword: password,
              confirmPassword,
            };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Request failed. Please try again.");
      }

      setMessage(
        data.message ||
          (mode === "register"
            ? "Account created. You can now log in."
            : "Password reset successfully. You can now log in.")
      );

      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Unable to complete the request.");
    } finally {
      setLoading(false);
    }
  }

  const changeMode = (nextMode) => {
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setMode(nextMode);
  };

  const passwordLabel =
    mode === "reset" ? "New Password" : "Password";

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>PlaceTrack</h1>
        <p>
          {mode === "login"
            ? "Placement Officer Portal"
            : mode === "register"
              ? "Create Placement Officer Account"
              : "Reset Your Password"}
        </p>

        {message && (
          <p className="login-success" role="status">{message}</p>
        )}
        {error && (
          <p className="login-error" role="alert">{error}</p>
        )}

        <label htmlFor="officer-email">Email Address</label>
        <input
          id="officer-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="officer-password">{passwordLabel}</label>
        <div className="password-field">
          <input
            id="officer-password"
            type={showPassword ? "text" : "password"}
            placeholder={
              mode === "reset" ? "Enter new password" : "Enter password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "login" ? undefined : 8}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {mode !== "login" && (
          <>
            <label htmlFor="officer-confirm-password">Confirm Password</label>
            <div className="password-field">
              <input
                id="officer-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : mode === "register"
                ? "Create Account"
                : "Reset Password"}
        </button>

        <div className="auth-links">
          {mode === "login" && (
            <>
              <button type="button" onClick={() => changeMode("register")}>
                Create Account
              </button>
              <button type="button" onClick={() => changeMode("reset")}>
                Forgot Password?
              </button>
            </>
          )}

          {mode !== "login" && (
            <button type="button" onClick={() => changeMode("login")}>
              Back to Login
            </button>
          )}
        </div>

        <small>College Placement Management System</small>
      </form>
    </div>
  );
}

export default Login;