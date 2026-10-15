
import { useState } from "react";

function ForgotPassword({
  onReset,
  onBack,
  loading = false,
  message = "",
}) {
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    onReset({
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-icon">CP</div>

        <h1>Reset Password</h1>
        <p>
          Enter your registered details to reset your password.
        </p>

        {(error || message) && (
          <div className="message-box" role="alert">
            {error || message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-roll-number">Roll Number</label>
          <input
            id="reset-roll-number"
            type="text"
            placeholder="Enter your roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="reset-email">Registered Email</label>
          <input
            id="reset-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="reset-new-password">New Password</label>
          <div className="password-field">
            <input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label htmlFor="reset-confirm-password">
            Confirm New Password
          </label>
          <input
            id="reset-confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;