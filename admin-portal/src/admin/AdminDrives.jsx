
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/placement-drives";

const emptyForm = {
  companyName: "",
  driveName: "",
  driveDate: "",
  venue: "",
  status: "Open",
};

function AdminDrives() {
  const [drives, setDrives] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load drives from the backend.
  // Used by Add, Edit and Delete after a successful operation.
  async function loadDrives() {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load placement drives");
      }

      const data = await response.json();
      setDrives(data);
    } catch (error) {
      console.error("Drive loading error:", error);
      setMessage("Could not load drives. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch initial data directly inside the effect.
  // No synchronous setState call is made by the effect itself.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchDrives() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load placement drives");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setDrives(data);
          setMessage("");
        }
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          !controller.signal.aborted
        ) {
          console.error("Drive loading error:", error);
          setMessage("Could not load drives. Check the backend.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDrives();

    return () => controller.abort();
  }, []);

  const filteredDrives = drives.filter((drive) =>
    `${drive.companyName ?? ""} ${drive.driveName ?? ""} ${
      drive.venue ?? ""
    } ${drive.status ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openAddForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setFormOpen(true);
    setMessage("");
  }

  function openEditForm(drive) {
    setForm({
      companyName: drive.companyName ?? "",
      driveName: drive.driveName ?? "",
      driveDate: drive.driveDate ?? "",
      venue: drive.venue ?? "",
      status: drive.status ?? "Open",
    });

    setEditingId(drive.id);
    setFormOpen(true);
    setMessage("");
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

    const payload = {
      companyName: form.companyName.trim(),
      driveName: form.driveName.trim(),
      driveDate: form.driveDate,
      venue: form.venue.trim(),
      status: form.status,
    };

    if (saving) return;

    try {
      setSaving(true);
      setMessage("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`);
      }

      setFormOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await loadDrives();

      setMessage(
        isEditing
          ? "Placement drive updated successfully."
          : "Placement drive added successfully."
      );
    } catch (error) {
      console.error("Drive save error:", error);
      setMessage("Could not save the drive. Check the backend and API.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDrive(id) {
    if (!window.confirm("Delete this placement drive?")) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
      }

      await loadDrives();
      setMessage("Placement drive deleted successfully.");
    } catch (error) {
      console.error("Drive delete error:", error);
      setMessage("Could not delete the drive. Check the backend.");
    }
  }

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Placement Drive Management</h2>
          <p>Manage recruiting drives, companies, venues and dates.</p>
        </div>

        <span className="admin-count">{drives.length} drives</span>
      </div>

      {message && (
        <p className="admin-click-message" role="status">
          {message}
        </p>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search company, drive, venue or status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          type="button"
          className="admin-action-button"
          onClick={openAddForm}
        >
          + Add Drive
        </button>
      </div>

      {formOpen && (
        <form
          className="admin-panel admin-student-form"
          onSubmit={handleSubmit}
        >
          <h3>
            {editingId !== null
              ? "Edit Placement Drive"
              : "Add Placement Drive"}
          </h3>

          <div className="admin-form-grid">
            <input
              name="companyName"
              placeholder="Company name"
              value={form.companyName}
              onChange={handleChange}
              required
            />

            <input
              name="driveName"
              placeholder="Drive name"
              value={form.driveName}
              onChange={handleChange}
              required
            />

            <label className="admin-field-label">
              Drive date
              <input
                type="date"
                name="driveDate"
                value={form.driveDate}
                onChange={handleChange}
                required
              />
            </label>

            <input
              name="venue"
              placeholder="Venue"
              value={form.venue}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Open">Open</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-action-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Add Drive"}
            </button>

            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
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
              <th>Company</th>
              <th>Drive Name</th>
              <th>Drive Date</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="admin-empty">
                  Loading placement drives...
                </td>
              </tr>
            ) : filteredDrives.length > 0 ? (
              filteredDrives.map((drive) => (
                <tr key={drive.id}>
                  <td>{drive.companyName || "—"}</td>
                  <td>{drive.driveName || "—"}</td>
                  <td>{drive.driveDate || "—"}</td>
                  <td>{drive.venue || "—"}</td>
                  <td>{drive.status || "—"}</td>
                  <td>
                    <div className="admin-form-actions">
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => openEditForm(drive)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => deleteDrive(drive.id)}
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
                  No matching placement drives found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminDrives;