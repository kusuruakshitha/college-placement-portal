
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/companies";

const emptyForm = {
  companyName: "",
  jobRole: "",
  location: "",
  eligibilityCriteria: "",
  packageOffered: "",
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCompanies() {
    const response = await fetch(API, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load companies: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The companies API did not return a list.");
    }

    setCompanies(data);
    return data;
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoading(true);
        const response = await fetch(API, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid companies response.");
        }

        if (!cancelled) {
          setCompanies(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            `Could not load companies. Check that Spring Boot is running on port 8080. ${err.message}`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(company) {
    setEditingId(company.id);
    setForm({
      companyName: company.companyName ?? "",
      jobRole: company.jobRole ?? "",
      location: company.location ?? "",
      eligibilityCriteria: company.eligibilityCriteria ?? "",
      packageOffered: company.packageOffered ?? "",
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = form.companyName.trim();

    if (!name) {
      setError("Company name is required.");
      return;
    }

    const packageValue =
      String(form.packageOffered).trim() === ""
        ? null
        : Number(form.packageOffered);

    if (
      packageValue !== null &&
      (!Number.isFinite(packageValue) || packageValue < 0)
    ) {
      setError("Enter a valid, non-negative package.");
      return;
    }

    const payload = {
      companyName: name,
      jobRole: form.jobRole.trim(),
      location: form.location.trim(),
      eligibilityCriteria: form.eligibilityCriteria.trim(),
      packageOffered: packageValue,
    };

    setSaving(true);

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
        throw new Error(details || `Save failed: HTTP ${response.status}`);
      }

      await loadCompanies();
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setMessage(isEditing ? "Company updated successfully." : "Company added successfully.");
    } catch (err) {
      setError(err.message || "Unable to save company.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(company) {
    if (!window.confirm(`Delete ${company.companyName}?`)) return;

    setDeletingId(company.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${company.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed: HTTP ${response.status}`);
      }

      await loadCompanies();
      setMessage("Company deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete company.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRefresh() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await loadCompanies();
      setMessage("Company list refreshed.");
    } catch (err) {
      setError(err.message || "Unable to refresh companies.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCompanies = companies.filter((company) =>
    [
      company.companyName,
      company.jobRole,
      company.location,
      company.eligibilityCriteria,
      company.packageOffered,
    ]
      .filter((value) => value != null)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Company Management</h2>
          <p>Manage companies participating in campus recruitment.</p>
        </div>

        <button type="button" onClick={openAddForm}>
          + Add Company
        </button>
      </div>

      <div className="admin-panel">
        <h3>Partner Companies</h3>
        <p>
          Manage company profiles, eligibility criteria, job roles,
          locations and offered packages.
        </p>

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Search companies..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <span>
            {loading ? "Loading..." : `${filteredCompanies.length} companies`}
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="company-form">
            <h3>{editingId !== null ? "Edit Company" : "Add Company"}</h3>

            <input
              name="companyName"
              placeholder="Company name"
              value={form.companyName}
              onChange={handleChange}
              required
            />

            <input
              name="jobRole"
              placeholder="Job role"
              value={form.jobRole}
              onChange={handleChange}
            />

            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
            />

            <input
              name="eligibilityCriteria"
              placeholder="Eligibility criteria"
              value={form.eligibilityCriteria}
              onChange={handleChange}
            />

            <input
              name="packageOffered"
              type="number"
              min="0"
              step="any"
              placeholder="Package offered"
              value={form.packageOffered}
              onChange={handleChange}
            />

            <div className="company-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Company"
                    : "Save Company"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ ...emptyForm });
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
                <th>Company Name</th>
                <th>Job Role</th>
                <th>Location</th>
                <th>Eligibility Criteria</th>
                <th>Package Offered</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading company records...</td>
                </tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.companyName || "—"}</td>
                    <td>{company.jobRole || "—"}</td>
                    <td>{company.location || "—"}</td>
                    <td>{company.eligibilityCriteria || "—"}</td>
                    <td>
                      {company.packageOffered == null
                        ? "—"
                        : company.packageOffered}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openEditForm(company)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        disabled={deletingId === company.id}
                        onClick={() => handleDelete(company)}
                      >
                        {deletingId === company.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    {error
                      ? "Unable to load companies. See the error above."
                      : companies.length === 0
                        ? "No company records found. Click Add Company."
                        : "No companies match your search."}
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
