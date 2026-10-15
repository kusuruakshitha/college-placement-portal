
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/placement-drives";

const emptyForm = {
  companyId: "",
  companyName: "",
  driveName: "",
  driveDate: "",
  status: "Open",
  venue: "",
};

function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // Load drives from the Spring Boot API.
  const loadDrives = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Unable to load placement drives (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response received from the backend.");
      }

      setDrives(data);
      return true;
    } catch (err) {
      setError(err.message || "Unable to connect to the placement API.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch with cleanup.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchInitialDrives() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load placement drives (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response received from the backend.");
        }

        setDrives(data);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to connect to the placement API."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchInitialDrives();

    return () => controller.abort();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
    setError("");
  }

  function openAddForm() {
    setForm({ ...emptyForm });
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function editDrive(drive) {
    setEditId(drive.id);

    setForm({
      companyId: drive.companyId ?? "",
      companyName: drive.companyName ?? "",
      driveName: drive.driveName ?? "",
      driveDate: drive.driveDate ?? "",
      status: drive.status ?? "Open",
      venue: drive.venue ?? "",
    });

    setError("");
    setShowForm(true);
  }

  async function saveDrive(event) {
    event.preventDefault();
    setError("");

    const companyName = form.companyName.trim();
    const driveName = form.driveName.trim();
    const driveDate = form.driveDate;
    const venue = form.venue.trim();

    if (!companyName || !driveName || !driveDate || !venue) {
      setError(
        "Please enter the company name, drive name, date, and venue."
      );
      return;
    }

    if (
      form.companyId.trim() !== "" &&
      (!Number.isInteger(Number(form.companyId)) ||
        Number(form.companyId) <= 0)
    ) {
      setError("Company ID must be a positive whole number.");
      return;
    }

    const driveData = {
      companyId:
        form.companyId.trim() === ""
          ? null
          : Number(form.companyId),
      companyName,
      driveName,
      driveDate,
      status: form.status,
      venue,
    };

    setSaving(true);

    try {
      const isEditing = editId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(driveData),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `Unable to ${isEditing ? "update" : "add"} drive (HTTP ${
            response.status
          })${message ? `: ${message}` : ""}`
        );
      }

      const refreshed = await loadDrives();

      if (refreshed) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to save the placement drive.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDrive(drive) {
    const confirmed = window.confirm(
      `Delete the ${drive.companyName} placement drive?`
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(drive.id);

    try {
      const response = await fetch(`${API_URL}/${drive.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `Unable to delete drive (HTTP ${response.status})${
            message ? `: ${message}` : ""
          }`
        );
      }

      if (editId === drive.id) {
        resetForm();
      }

      await loadDrives();
    } catch (err) {
      setError(err.message || "Unable to delete the placement drive.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredDrives = drives.filter((drive) =>
    `${drive.companyName ?? ""} ${drive.driveName ?? ""} ${
      drive.status ?? ""
    } ${drive.venue ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <main className="students-page">
      <div className="page-heading">
        <div>
          <h1>Placement Drives</h1>
          <p>Manage company recruitment drives.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddForm}
          disabled={loading}
        >
          + Add Drive
        </button>
      </div>

      <input
        className="search-input"
        type="search"
        placeholder="Search by company, drive name, status, or venue..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && (
        <div>
          <p className="login-error" role="alert">
            {error}
          </p>

          <button type="button" onClick={loadDrives} disabled={loading}>
            Retry Loading
          </button>
        </div>
      )}

      {showForm && (
        <form className="student-form" onSubmit={saveDrive}>
          <h2>{editId !== null ? "Edit Drive" : "Create Placement Drive"}</h2>

          <label htmlFor="drive-company-id">
            Company ID (optional)
          </label>
          <input
            id="drive-company-id"
            name="companyId"
            type="number"
            min="1"
            step="1"
            value={form.companyId}
            onChange={updateField}
            placeholder="Enter the existing company ID"
          />

          <label htmlFor="drive-company-name">Company Name</label>
          <input
            id="drive-company-name"
            name="companyName"
            value={form.companyName}
            onChange={updateField}
            placeholder="e.g. TCS"
            required
          />

          <label htmlFor="drive-name">Drive Name / Job Role</label>
          <input
            id="drive-name"
            name="driveName"
            value={form.driveName}
            onChange={updateField}
            placeholder="e.g. Software Engineer"
            required
          />

          <label htmlFor="drive-date">Drive Date</label>
          <input
            id="drive-date"
            name="driveDate"
            type="date"
            value={form.driveDate}
            onChange={updateField}
            required
          />

          <label htmlFor="drive-venue">Venue</label>
          <input
            id="drive-venue"
            name="venue"
            value={form.venue}
            onChange={updateField}
            placeholder="e.g. College Auditorium"
            required
          />

          <label htmlFor="drive-status">Drive Status</label>
          <select
            id="drive-status"
            name="status"
            value={form.status}
            onChange={updateField}
          >
            <option value="Open">Open</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Closed">Closed</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editId !== null
                ? "Update Drive"
                : "Save Drive"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
          >
            Cancel
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Drive Name / Role</th>
              <th>Drive Date</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading placement drives...</td>
              </tr>
            ) : filteredDrives.length === 0 ? (
              <tr>
                <td colSpan="6">No placement drives found.</td>
              </tr>
            ) : (
              filteredDrives.map((drive) => (
                <tr key={drive.id}>
                  <td>{drive.companyName || "—"}</td>
                  <td>{drive.driveName || "—"}</td>
                  <td>{drive.driveDate || "—"}</td>
                  <td>{drive.venue || "—"}</td>
                  <td>{drive.status || "—"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => editDrive(drive)}
                      disabled={deletingId === drive.id}
                    >
                      Edit
                    </button>{" "}

                    <button
                      type="button"
                      onClick={() => deleteDrive(drive)}
                      disabled={deletingId === drive.id}
                    >
                      {deletingId === drive.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="demo-note">
        Placement drives are loaded from the placement database.
      </p>
    </main>
  );
}

export default PlacementDrives;
