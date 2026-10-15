
import { useEffect, useState } from "react";

function PlacementOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/placement-officers")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load placement officers");
        }
        return response.json();
      })
      .then((data) => setOfficers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading placement officers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Placement Officers</h1>
      <p>Manage your college placement team.</p>

      {officers.length === 0 ? (
        <p>No placement officers found.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {officers.map((officer) => (
            <div
              key={officer.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                minWidth: "250px",
              }}
            >
              <h3>{officer.name}</h3>
              <p>Email: {officer.email}</p>
              <p>Department: {officer.department}</p>
              <p>ID: {officer.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlacementOfficers;
