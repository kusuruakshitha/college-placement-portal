
import { useEffect, useState } from "react";

// Uses the Vite proxy to forward /api requests to Spring Boot.
const API = "/api/students";

const emptyForm = {
  name: "",
  email: "",
  rollNumber: "",
  branch: "",
  cgpa: "",
};

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStudents() {
      setLoading(true);
      setMessage("");

      try {
        const response = await fetch(API, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        console.log("Students API status:", response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to load students (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("The students API did not return an array.");
        }

        console.log("Students loaded:", data.length);

        setStudents(data);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Student loading error:", error);
        setStudents([]);
        setMessage(
          `${error.message}. Check the backend and Vite proxy.`
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchStudents();

    return () => controller.abort();
  }, [refreshKey]);

  function reloadStudents() {
    setRefreshKey((current) => current + 1);
  }

  const filteredStudents = students.filter((student) =>
    [
      student.name,
      student.email,
      student.rollNumber,
      student.branch,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
    setMessage("");
  }

  function openEditForm(student) {
    setEditingId(student.id);
    setForm({
      name: student.name || "",
      email: student.email || "",
      rollNumber: student.rollNumber || "",
      branch: student.branch || "",
      cgpa: student.cgpa ?? "",
    });
    setFormOpen(true);
    setMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setMessage("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      rollNumber: form.rollNumber.trim(),
      branch: form.branch.trim(),
      cgpa: form.cgpa === "" ? null : Number(form.cgpa),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.rollNumber ||
      !payload.branch
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (
      payload.cgpa !== null &&
      (!Number.isFinite(payload.cgpa) ||
        payload.cgpa < 0 ||
        payload.cgpa > 10)
    ) {
      setMessage("CGPA must be between 0 and 10.");
      return;
    }

    const duplicate = students.some(
      (student) =>
        String(student.id) !== String(editingId) &&
        (
          student.email?.toLowerCase() ===
            payload.email.toLowerCase() ||
          student.rollNumber?.toLowerCase() ===
            payload.rollNumber.toLowerCase()
        )
    );

    if (duplicate) {
      setMessage("Email or roll number already exists.");
      return;
    }

    const isEditing = editingId !== null;
    const url = isEditing ? `${API}/${editingId}` : API;

    setSaving(true);

    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Unable to save student (HTTP ${response.status}).`
        );
      }

      setFormOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);
      setMessage(
        isEditing
          ? "Student updated successfully."
          : "Student added successfully."
      );

      reloadStudents();
    } catch (error) {
      console.error("Student save error:", error);
      setMessage(error.message || "Could not save student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete this student record?")) return;

    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          details || `Unable to delete student (HTTP ${response.status}).`
        );
      }

      setMessage("Student deleted successfully.");
      reloadStudents();
    } catch (error) {
      console.error("Student delete error:", error);
      setMessage(error.message || "Could not delete student.");
    }
  }

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Student Management</h2>
          <p>View, search, add, edit, and manage student records.</p>
        </div>

        <span className="admin-count">
          {loading ? "Loading..." : `${students.length} students`}
        </span>
      </div>

      {message && (
        <p
          role="status"
          className="admin-click-message"
          style={{ overflowWrap: "anywhere" }}
        >
          {message}
        </p>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name, email, roll number or branch..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          type="button"
          className="admin-action-button"
          onClick={openAddForm}
        >
          + Add Student
        </button>

        <button
          type="button"
          className="admin-cancel-button"
          onClick={reloadStudents}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {formOpen && (
        <form
          className="admin-panel admin-student-form"
          onSubmit={handleSubmit}
        >
          <h3>{editingId !== null ? "Edit Student" : "Add Student"}</h3>

          <div className="admin-form-grid">
            <input
              name="name"
              placeholder="Student name"
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

            <input
              name="rollNumber"
              placeholder="Roll number"
              value={form.rollNumber}
              onChange={handleChange}
              required
            />

            <input
              name="branch"
              placeholder="Branch (e.g. AI)"
              value={form.branch}
              onChange={handleChange}
              required
            />

            <input
              name="cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="CGPA (0–10)"
              value={form.cgpa}
              onChange={handleChange}
            />
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
                  : "Add Student"}
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
              <th>Student Name</th>
              <th>Email</th>
              <th>Roll Number</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading student records...</td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name || "—"}</td>
                  <td>{student.email || "—"}</td>
                  <td>{student.rollNumber || "—"}</td>
                  <td>{student.branch || "—"}</td>
                  <td>{student.cgpa ?? "—"}</td>
                  <td>
                    <div className="admin-form-actions">
                      <button
                        type="button"
                        className="admin-edit-button"
                        onClick={() => openEditForm(student)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-delete-button"
                        onClick={() => deleteStudent(student.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="admin-empty">
                  {search
                    ? "No matching student records found."
                    : "No student records returned by the API."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminStudents;
