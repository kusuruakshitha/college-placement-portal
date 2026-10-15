
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/resumes/upload";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

function getLoggedInStudent() {
  const possibleKeys = ["user", "loggedInUser", "currentUser"];

  for (const key of possibleKeys) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) continue;

      const user = JSON.parse(stored);

      if (
        user &&
        String(user.role || "").toUpperCase() === "STUDENT"
      ) {
        // This must be the ID from the students table,
        // not merely the ID from the users table.
        const studentId = user.studentId;

        if (studentId) {
          return { ...user, studentId };
        }
      }
    } catch {
      // Ignore missing or invalid stored login data.
    }
  }

  return null;
}

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".")
      .pop()
      ?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Please select a PDF, DOC, or DOCX file.");
      setFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("The file size must not exceed 5 MB.");
      setFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(
      extension === "pdf"
        ? URL.createObjectURL(selectedFile)
        : ""
    );
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    const student = getLoggedInStudent();

    if (!student) {
      setError(
        "Student details were not found. Please log in again. " +
        "Your login must include the student database ID."
      );
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentId", String(student.studentId));

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(
          result.message || `Upload failed (${response.status}).`
        );
      }

      setSuccess(
        result.message ||
        "Resume uploaded and linked to your student record successfully."
      );
    } catch (err) {
      setError(
        err.message ||
        "Unable to upload your resume. Check that the backend is running."
      );
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setPreviewUrl("");
    setError("");
    setSuccess("");

    const input = document.getElementById("resume-file");
    if (input) input.value = "";
  }

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Resume Upload</h2>
          <p>
            Upload your resume to prepare for personalized career
            recommendations.
          </p>
        </div>
      </div>

      <section className="resume-card">
        <div className="resume-icon" aria-hidden="true">📄</div>
        <h3>Upload Your Resume</h3>
        <p>PDF, DOC, or DOCX. Maximum size: 5 MB.</p>

        <label
          className="file-select-button"
          htmlFor="resume-file"
        >
          Choose Resume
        </label>

        <input
          id="resume-file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          hidden
        />

        {file && (
          <div className="selected-file">
            <span>📎</span>
            <div>
              <strong>{file.name}</strong>
              <p>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button type="button" onClick={clearFile}>
              Remove
            </button>
          </div>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        <button
          type="button"
          className="primary-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </section>

      {previewUrl && (
        <section className="resume-preview">
          <h3>Resume Preview</h3>
          <iframe
            src={previewUrl}
            title="Resume PDF preview"
            width="100%"
            height="500"
          />
        </section>
      )}
    </div>
  );
}

export default ResumeUpload;
