import { useState } from "react";
import Login from "./placement-officer/pages/Login";
import Dashboard from "./placement-officer/pages/Dashboard";
import Sidebar from "./placement-officer/components/Sidebar";
import Topbar from "./placement-officer/components/Topbar";
import Students from "./placement-officer/pages/Students";
import PlacementDrives from "./placement-officer/pages/PlacementDrives";
import Applications from "./placement-officer/pages/Applications";
import Reports from "./placement-officer/pages/Reports";
import "./placement-officer/App.css";

function OfficerApp({ onBack }) {
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

  async function handleLogin(email, password) {
    const response = await fetch("/api/auth/staff-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(email || "").trim().toLowerCase(),
        password,
        role: "PLACEMENT_OFFICER",
      }),
    });

    const data = await response.json();

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
  }

  function handleLogout() {
    sessionStorage.removeItem("placementOfficerUser");
    setUser(null);
    setActivePage("Dashboard");
    setShowResetInfo(false);
  }

  if (!user) {
    if (showResetInfo) {
      return (
        <main className="auth-page">
          <section className="auth-card">
            <h1>Reset Placement Officer Password</h1>
            <p>
              Password resets must be completed by your authorized
              placement system administrator.
            </p>
            <button onClick={() => setShowResetInfo(false)}>
              Back to Login
            </button>
            <button onClick={onBack}>Back to Portal Selection</button>
          </section>
        </main>
      );
    }

    return (
      <div>
        <button type="button" onClick={onBack}>
          ← Back to Portal Selection
        </button>
        <Login
          onLogin={handleLogin}
          onForgotPassword={() => setShowResetInfo(true)}
        />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main-area">
        <Topbar onLogout={handleLogout} />

        {activePage === "Dashboard" && (
          <Dashboard setActivePage={setActivePage} />
        )}
        {activePage === "Students" && <Students />}
        {activePage === "Placement Drives" && <PlacementDrives />}
        {activePage === "Applications" && <Applications />}
        {activePage === "Reports" && <Reports />}
      </div>
    </div>
  );
}

export default OfficerApp;