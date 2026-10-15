
const navigationGroups = [
  {
    title: "MAIN MENU",
    items: [
      { id: "dashboard", icon: "⌂", label: "Dashboard" },
      { id: "profile", icon: "♙", label: "My Profile" },
      { id: "resume", icon: "▤", label: "Resume Upload" },
    ],
  },
  {
    title: "CAREER DEVELOPMENT",
    items: [
      { id: "readiness", icon: "◎", label: "Placement Readiness" },
      { id: "skills", icon: "◇", label: "Skill Gap Analysis" },
      { id: "jobs", icon: "▣", label: "Recommended Jobs" },
      { id: "internships", icon: "▧", label: "Internships" },
      { id: "history", icon: "▥", label: "Placement History" },
    ],
  },
];

function Sidebar({ page, onNavigate, onProfile }) {
  return (
    <aside className="sidebar">
      {navigationGroups.map((group) => (
        <div key={group.title}>
          <p className="sidebar-heading">{group.title}</p>

          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                page === item.id ? "nav-item active" : "nav-item"
              }
              onClick={() => {
                if (item.id === "profile") {
                  onProfile();
                } else {
                  onNavigate(item.id);
                }
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;