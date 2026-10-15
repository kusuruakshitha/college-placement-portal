
import { useState } from "react";
import PortalHome from "./PortalHome";
import StudentApp from "./StudentApp";
import AdminApp from "./AdminApp";
import OfficerApp from "./OfficerApp";

function App() {
  const [role, setRole] = useState(null);

  const handleBack = () => {
    setRole(null);
  };

  switch (role) {
    case "student":
      return <StudentApp onBack={handleBack} />;

    case "admin":
      return <AdminApp onBack={handleBack} />;

    case "officer":
      return <OfficerApp onBack={handleBack} />;

    default:
      return <PortalHome onSelectRole={setRole} />;
  }
}

export default App;
