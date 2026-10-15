
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/students";

const emptyForm = {
  name: "",
  email: "",
  branch: "CSE",
  cgpa: "",
  rollNumber: "",
  graduationYear: "",
  skills: "",
};

function getEligibility(cgpa) {
  return Number(cgpa) >= 7 ? "Eligible" : "Not Eligible";
}

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reusable API loader for refresh after CRUD operations.
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Unable to load students (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response received from the backend.");
      }

      setStudents(data);
      return true;
    } catch (err) {
      setError(err.message || "Unable to connect to the student API.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch is performed asynchronously with cleanup.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchInitialStudents() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load students (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the backend.");
        }

        setStudents(data);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to connect to the student API.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchInitialStudents();

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

  function editStudent(student) {
    setEditId(student.id);

    setForm({
      name: student.name ?? "",
      email: student.email ?? "",
      branch: student.branch ?? "CSE",
      cgpa: student.cgpa ?? "",
      rollNumber: student.rollNumber ?? "",
      graduationYear: student.graduationYear ?? "",
      skills: Array.isArray(student.skills)
        ? student.skills.join(", ")
        : student.skills ?? "",
    });

    setError("");
    setShowForm(true);
  }

  async function saveStudent(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const cgpa = Number(form.cgpa);

    const graduationYear =
      form.graduationYear.trim() === ""
        ? null
        : Number(form.graduationYear);

    if (!name || !email || form.cgpa === "") {
      setError("Please enter the name, email, and CGPA.");
      return;
    }

    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
      setError("CGPA must be between 0 and 10.");
      return;
    }

    if (
      graduationYear !== null &&
      (!Number.isInteger(graduationYear) ||
        graduationYear < 2000 ||
        graduationYear > 2100)
    ) {
      setError("Please enter a valid graduation year.");
      return;
    }

    const duplicate = students.some(
      (student) =>
        student.email?.toLowerCase() === email.toLowerCase() &&
        student.id !== editId
    );

    if (duplicate) {
      setError("A student with this email already exists.");
      return;
    }

    const studentData = {
      name,
      email,
      branch: form.branch,
      cgpa,
      rollNumber: form.rollNumber.trim() || null,
      graduationYear,
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
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
          body: JSON.stringify(studentData),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          `Unable to ${isEditing ? "update" : "add"} student (HTTP ${
            response.status
          })${message ? `: ${message}` : ""}`
        );
      }

      const refreshed = await loadStudents();

      if (refreshed) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to save the student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    const confirmed = window.confirm(
      `Delete ${student.name}? This removes the record from the database.`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${student.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Unable to delete student (HTTP ${response.status}).`
        );
      }

      if (editId === student.id) {
        resetForm();
      }

      await loadStudents();
    } catch (err) {
      setError(err.message || "Unable to delete the student.");
    }
  }

  const filteredStudents = students.filter((student) =>
    `${student.name ?? ""} ${student.email ?? ""} ${
      student.branch ?? ""
    } ${student.rollNumber ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <main className="students-page">
      <div className="page-heading">
        <div>
          <h1>Students</h1>
          <p>Manage student records and placement eligibility.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddForm}
        >
          + Add Student
        </button>
      </div>

      <input
        className="search-input"
        type="search"
        placeholder="Search by name, email, branch, or roll number..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <form className="student-form" onSubmit={saveStudent}>
          <h2>{editId !== null ? "Edit Student" : "Add New Student"}</h2>

          <label htmlFor="student-name">Full Name</label>
          <input
            id="student-name"
            name="name"
            value={form.name}
            onChange={updateField}
            required
          />

          <label htmlFor="student-email">Email Address</label>
          <input
            id="student-email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
          />

          <label htmlFor="student-roll">Roll Number</label>
          <input
            id="student-roll"
            name="rollNumber"
            value={form.rollNumber}
            onChange={updateField}
          />

          <label htmlFor="student-branch">Branch</label>
          <select
            id="student-branch"
            name="branch"
            value={form.branch}
            onChange={updateField}
          >
            <option value="CSE">CSE</option>
            <option value="AI">AI</option>
            <option value="AI & ML">AI & ML</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          <label htmlFor="student-cgpa">CGPA (out of 10)</label>
          <input
            id="student-cgpa"
            name="cgpa"
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={form.cgpa}
            onChange={updateField}
            required
          />

          <label htmlFor="student-year">Graduation Year</label>
          <input
            id="student-year"
            name="graduationYear"
            type="number"
            min="2000"
            max="2100"
            value={form.graduationYear}
            onChange={updateField}
          />

          <label htmlFor="student-skills">Skills (comma-separated)</label>
          <input
            id="student-skills"
            name="skills"
            value={form.skills}
            onChange={updateField}
            placeholder="Java, SQL, React"
          />

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editId !== null
                ? "Update Student"
                : "Save Student"}
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
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Eligibility</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading students...</td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6">No students found.</td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const eligible = Number(student.cgpa) >= 7;

                return (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.branch}</td>
                    <td>
                      {Number.isFinite(Number(student.cgpa))
                        ? Number(student.cgpa).toFixed(2)
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={
                          eligible
                            ? "status eligible"
                            : "status not-eligible"
                        }
                      >
                        {getEligibility(student.cgpa)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => editStudent(student)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        onClick={() => deleteStudent(student)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="demo-note">
        Student records are loaded from the placement database.
      </p>
    </main>
  );
}

export default Students;
