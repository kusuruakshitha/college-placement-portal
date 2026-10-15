import "./PortalHome.css";

function PortalHome({ onSelectRole }) {
  const roles = [
    {
      id: "student",
      title: "Student Portal",
      description: "Manage your profile, resume, skills, and placement opportunities.",
      icon: "🎓",
    },
    {
      id: "admin",
      title: "Admin Portal",
      description: "Manage students, placement officers, companies, and drives.",
      icon: "🛡️",
    },
    {
      id: "officer",
      title: "Placement Officer",
      description: "Manage students, placement drives, applications, and reports.",
      icon: "💼",
    },
  ];

  return (
    <main className="portal-home">
      <header className="portal-header">
        <span className="portal-logo">CP</span>
        <div>
          <h1>College Placement Portal</h1>
          <p>Your unified campus recruitment platform</p>
        </div>
      </header>

      <section className="portal-intro">
        <p className="portal-eyebrow">WELCOME</p>
        <h2>Select your portal</h2>
        <p>Choose your role to continue.</p>
      </section>

      <section className="portal-role-grid">
        {roles.map((role) => (
          <button
            type="button"
            className="portal-role-card"
            key={role.id}
            onClick={() => onSelectRole(role.id)}
          >
            <span className="portal-role-icon">{role.icon}</span>
            <h3>{role.title}</h3>
            <p>{role.description}</p>
            <span className="portal-role-action">Continue →</span>
          </button>
        ))}
      </section>

      <footer className="portal-footer">
        College Placement Portal
      </footer>
    </main>
  );
}

export default PortalHome;