import { useState } from "react";

function Login({
onLogin,
onSwitchToRegister,
onForgotPassword,
loading = false,
message = "",
}) {
const [rollNumber, setRollNumber] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

const handleSubmit = (event) => {
event.preventDefault();

if (!rollNumber.trim() || !password) {
  return;
}

onLogin({
  rollNumber: rollNumber.trim(),
  password,
});


};

return ( <div className="auth-container"> <div className="auth-card"> <div className="brand-icon">CP</div>


    <h1>Welcome Back</h1>
    <p>Sign in to your College Placement Portal</p>

    {message && (
      <div className="message-box" role="alert">
        {message}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <label htmlFor="login-roll-number">Roll Number</label>
      <input
        id="login-roll-number"
        type="text"
        placeholder="Enter your roll number"
        value={rollNumber}
        onChange={(event) => setRollNumber(event.target.value)}
        autoComplete="username"
        required
      />

      <label htmlFor="login-password">Password</label>

      <div className="password-field">
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
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

      <p className="auth-switch" style={{ textAlign: "right" }}>
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loading}
        >
          Forgot Password?
        </button>
      </p>

      <button
        type="submit"
        className="primary-button"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Login"}
      </button>
    </form>

    <p className="auth-switch">
      Don't have an account?{" "}
      <button
        type="button"
        onClick={onSwitchToRegister}
        disabled={loading}
      >
        Register
      </button>
    </p>
  </div>
</div>


);
}

export default Login;
