
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/students";

const emptyForm = {
  name: "",
  email: "",
  rollNumber: "",
  branch: "",
  cgpa: "",
};

function getRecords(data) {
  if (Array.isArray(data)) return data;

  const records =
    data?.content ??
    data?.data ??
    data?.students ??
    data?.results;

  return Array.isArray(records) ? records : null;
}

function getStudentId(student) {
  return student.id ?? student.studentId;
}

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Initial fetch: state updates happen after the request settles.
  useEffect(() => {
    let ignore = false;

    fetch(API, {
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load students (HTTP ${response.status})`
          );
        }

        return response.json();
      })
      .then((data) => {
        const records = getRecords(data);

        if (!records) {
          throw new Error("Unexpected student API response.");
        }

        if (!ignore) {
          setStudents(records);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Failed to load students.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Refresh records after adding or editing.
  async function loadStudents() {
    const response = await fetch(API, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(
        `Unable to refresh students (HTTP ${response.status})`
      );
    }

    const records = getRecords(await response.json());

    if (!records) {
      throw new Error("Unexpected student API response.");
    }

    setStudents(records);
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(student) {
    setEditingId(getStudentId(student));

    setForm({
      name: student.name ?? student.fullName ?? "",
      email: student.email ?? "",
      rollNumber: student.rollNumber ?? student.rollNo ?? "",
      branch: student.branch ?? student.department ?? "",
      cgpa: student.cgpa ?? "",
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
      rollNumber: form.rollNumber.trim(),
      branch: form.branch.trim(),
      cgpa: form.cgpa === "" ? null : Number(form.cgpa),
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

      await loadStudents();

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      setMessage(
        isEditing
          ? "Student updated successfully."
          : "Student added successfully."
      );
    } catch (err) {
      setError(err.message || "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student) {
    const id = getStudentId(student);

    if (id == null) {
      setError("Student ID is missing. Cannot delete this record.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${student.name ?? student.fullName ?? "this student"}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed (HTTP ${response.status})`);
      }

      setStudents((previous) =>
        previous.filter((item) => getStudentId(item) !== id)
      );

      setMessage("Student deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete student.");
    }
  }

  const filteredStudents = students.filter((student) =>
    `${student.name ?? student.fullName ?? ""} ${
      student.email ?? ""
    } ${student.rollNumber ?? student.rollNo ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="admin-module">
      <div className="admin-module-heading">
        <div>
          <h2>Student Management</h2>
          <p>Add, search, update and manage student records.</p>
        </div>

        <button type="button" onClick={openAddForm}>
          + Add Student
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name, email or roll number..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span className="admin-count">
          {loading ? "Loading..." : `${filteredStudents.length} students`}
        </span>
      </div>

      {message && <p role="status" style={{ color: "green" }}>{message}</p>}
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}

      {showForm && (
        <form
          className="admin-student-form"
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
            {editingId !== null ? "Edit Student" : "Add Student"}
          </h3>

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
            placeholder="Email"
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
            placeholder="Branch"
            value={form.branch}
            onChange={handleChange}
            required
          />

          <input
            name="cgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            placeholder="CGPA"
            value={form.cgpa}
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
                  : "Add Student"}
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
                <td colSpan="6" className="admin-empty">
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={getStudentId(student) ?? index}>
                  <td>{student.name ?? student.fullName ?? "—"}</td>
                  <td>{student.email ?? "—"}</td>
                  <td>{student.rollNumber ?? student.rollNo ?? "—"}</td>
                  <td>{student.branch ?? student.department ?? "—"}</td>
                  <td>{student.cgpa ?? "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => openEditForm(student)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(student)}
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
                  {students.length === 0
                    ? "No student records found."
                    : "No students match your search."}
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
