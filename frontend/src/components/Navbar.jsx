
function Navbar({ user, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">CP</div>
        <div>
          <h1>College Placement Portal</h1>
          <p>Analytics and Career Management</p>
        </div>
      </div>

      <div className="user-section">
        <div className="user-info">
          <strong>{user?.username || "User"}</strong>
          <span>{user?.role || "Student"}</span>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;