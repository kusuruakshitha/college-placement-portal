
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Students from "./pages/Students";
import PlacementDrives from "./pages/PlacementDrives";
import Applications from "./pages/Applications";
import Reports from "./pages/Reports";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("placementOfficerUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      sessionStorage.removeItem("placementOfficerUser");
      return null;
    }
  });

  const [activePage, setActivePage] = useState("Dashboard");
  const [showResetInfo, setShowResetInfo] = useState(false);
  const [loginError, setLoginError] = useState("");

  async function handleLogin(email, password) {
    setLoginError("");

    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error("Please enter your registered email and password.");
    }

    let response;

    try {
      response = await fetch("/api/auth/staff-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: "PLACEMENT_OFFICER",
        }),
      });
    } catch (error) {
      console.error("Placement Officer login connection error:", error);

      throw new Error(
        "Cannot connect to the backend. Check that Spring Boot is running.",
        { cause: error }
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || "Invalid email or password.");
    }

    const officer = {
      id: data.id,
      username: data.username || "Placement Officer",
      email: data.email,
      role: data.role,
    };

    sessionStorage.setItem(
      "placementOfficerUser",
      JSON.stringify(officer)
    );

    setUser(officer);
    setActivePage("Dashboard");
    setShowResetInfo(false);
    setLoginError("");
  }

  function handleLogout() {
    sessionStorage.removeItem("placementOfficerUser");
    setUser(null);
    setActivePage("Dashboard");
    setShowResetInfo(false);
    setLoginError("");
  }

  if (user) {
    return (
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <div className="main-area">
          <Topbar onLogout={handleLogout} />

          {activePage === "Dashboard" && (
            <Dashboard setActivePage={setActivePage} />
          )}

          {activePage === "Students" && <Students />}

          {activePage === "Placement Drives" && <PlacementDrives />}

          {activePage === "Applications" && <Applications />}

          {activePage === "Reports" && <Reports />}

          {![
            "Dashboard",
            "Students",
            "Placement Drives",
            "Applications",
            "Reports",
          ].includes(activePage) && (
            <main>
              <h1>Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </main>
          )}
        </div>
      </div>
    );
  }

  if (showResetInfo) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Reset Placement Officer Password</h1>

          <p>
            For security, password resets must be completed by your
            authorized placement system administrator. Email-only
            resets are disabled to protect staff accounts.
          </p>

          {loginError && (
            <p role="alert" className="login-error">
              {loginError}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setShowResetInfo(false);
              setLoginError("");
            }}
          >
            Back to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onForgotPassword={() => {
        setLoginError("");
        setShowResetInfo(true);
      }}
    />
  );
}

export default App;