function Topbar({ onLogout }) {
return ( <header className="topbar"> <div> <h3>Placement Officer Portal</h3> <p>Manage campus placements in one place</p> </div>

```
  <button className="logout-button" onClick={onLogout}>
    Logout
  </button>
</header>

);
}

export default Topbar;
