
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({
  user,
  page,
  onNavigate,
  onProfile,
  onLogout,
  children,
}) {
  return (
    <div className="app-container">
      <Navbar user={user} onLogout={onLogout} />

      <div className="dashboard-body">
        <Sidebar
          page={page}
          onNavigate={onNavigate}
          onProfile={onProfile}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;