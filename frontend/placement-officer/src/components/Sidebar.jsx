function Sidebar({ activePage, setActivePage }) {
const menuItems = [
{ name: "Dashboard", icon: "▦" },
{ name: "Students", icon: "♙" },
{ name: "Placement Drives", icon: "💼" },
{ name: "Applications", icon: "▤" },
{ name: "Reports", icon: "▥" },
];

return ( <aside className="sidebar"> <h2>PlaceTrack</h2> <p className="sidebar-label">PLACEMENT MANAGEMENT</p>

```
  <nav>
    {menuItems.map((item) => (
      <button
        key={item.name}
        className={activePage === item.name ? "nav-item active" : "nav-item"}
        onClick={() => setActivePage(item.name)}
      >
        <span>{item.icon}</span>
        {item.name}
      </button>
    ))}
  </nav>
</aside>


);
}

export default Sidebar;
