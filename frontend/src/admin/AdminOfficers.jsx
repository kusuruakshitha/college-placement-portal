
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/placement-officers";

const emptyForm = {
  name: "",
  email: "",
  status: "Active",
  department: "",
  phone: "",
};

function getRecords(data) {
  if (Array.isArray(data)) return data;

  const records =
    data?.content ??
    data?.data ??
    data?.placementOfficers ??
    data?.officers ??
    data?.results;

  return Array.isArray(records) ? records : null;
}

function AdminOfficers() {
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    let ignore = false;

    async function loadOfficers() {
      try {
        const response = await fetch(API, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Unable to load officers (HTTP ${response.status})`);
        }

        const data = await response.json();
        const records = getRecords(data);

        if (!records) {
          throw new Error("Unexpected officer API response format.");
        }

        if (!ignore) setOfficers(records);
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load officers.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOfficers();

    return () => {
      ignore = true;
    };
  }, []);

  async function refreshOfficers() {
    const response = await fetch(API, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Unable to refresh officers (HTTP ${response.status})`);
    }

    const records = getRecords(await response.json());

    if (!records) {
      throw new Error("Unexpected officer API response format.");
    }

    setOfficers(records);
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(officer) {
    setEditingId(officer.id);
    setForm({
      name: officer.name ?? "",
      email: officer.email ?? "",
      status: officer.status ?? "Active",
      department: officer.department ?? "",
      phone: officer.phone ?? "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      status: form.status,
      department: form.department.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API}/${editingId}` : API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Save failed (HTTP ${response.status})`
        );
      }

      await refreshOfficers();

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      setMessage(
        isEditing
          ? "Placement officer updated successfully."
          : "Placement officer added successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to save officer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(officer) {
    if (
      !window.confirm(
        `Delete placement officer "${officer.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${officer.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (HTTP ${response.status})`);
      }

      setOfficers((previous) =>
        previous.filter((item) => item.id !== officer.id)
      );

      setMessage("Placement officer deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete officer.");
    }
  }

  const filteredOfficers = officers.filter((officer) =>
    `${officer.name ?? ""} ${officer.email ?? ""} ${
      officer.status ?? ""
    } ${officer.department ?? ""} ${officer.phone ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Placement Officer Management</h2>
          <p>Manage the officers responsible for campus recruitment.</p>
        </div>

        <button type="button" onClick={openAddForm}>
          + Add Officer
        </button>
      </div>

      <div className="admin-panel">
        <h3>Officer Directory</h3>

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Search by name, email, status, department or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <span className="admin-count">
            {loading ? "Loading..." : `${filteredOfficers.length} officers`}
          </span>
        </div>

        {message && (
          <p role="status" style={{ color: "green" }}>
            {message}
          </p>
        )}

        {error && (
          <p role="alert" style={{ color: "crimson" }}>
            {error}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              padding: "16px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ gridColumn: "1 / -1", margin: 0 }}>
              {editingId !== null ? "Edit Officer" : "Add Officer"}
            </h3>

            <input
              name="name"
              placeholder="Officer name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
            />

            <input
              name="phone"
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
            />

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Officer"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ ...emptyForm });
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    Loading officer records...
                  </td>
                </tr>
              ) : filteredOfficers.length > 0 ? (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id}>
                    <td>{officer.name ?? "—"}</td>
                    <td>{officer.email ?? "—"}</td>
                    <td>{officer.phone ?? "—"}</td>
                    <td>{officer.department ?? "Not assigned"}</td>
                    <td>{officer.status ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => openEditForm(officer)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(officer)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin-empty">
                    {officers.length === 0
                      ? "No officer records found."
                      : "No officers match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminOfficers;
