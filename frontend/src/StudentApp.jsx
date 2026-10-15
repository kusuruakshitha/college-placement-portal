
import { useCallback, useEffect, useState } from "react";
import "./App.css";

import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import MyProfile from "./pages/MyProfile";
import ResumeUpload from "./pages/ResumeUpload";
import PlacementDrives from "./pages/PlacementDrives";

import PlacementReadiness from "./modules/placement-readiness/PlacementReadiness";
import SkillGapAnalysis from "./modules/skill-gap/SkillGapAnalysis";
import RecommendedJobs from "./modules/recommended-jobs/RecommendedJobs";
import Internships from "./modules/internships/Internships";
import PlacementHistory from "./modules/placement-history/PlacementHistory";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

async function readResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(result, fallback) {
  if (typeof result === "string" && result.trim()) {
    return result;
  }

  return result?.message || result?.error || fallback;
}

async function requestStudentProfile(email) {
  if (!email) return null;

  const response = await fetch(`${API}/api/students`);
  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(result, "Unable to load student records.")
    );
  }

  const students = Array.isArray(result)
    ? result
    : Array.isArray(result?.students)
      ? result.students
      : [];

  const normalizedEmail = email.trim().toLowerCase();

  return (
    students.find(
      (item) =>
        item.email?.trim().toLowerCase() === normalizedEmail
    ) || null
  );
}

function StudentApp({ onBack }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("studentUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      sessionStorage.removeItem("studentUser");
      return null;
    }
  });

  const [authPage, setAuthPage] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [student, setStudent] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumePreview, setResumePreview] = useState("");
  const [uploadedResumeName, setUploadedResumeName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);

  // Fetch the student's actual database record.
  const fetchStudentProfile = useCallback(async (loggedInUser) => {
    if (!loggedInUser?.email) {
      setStudent(null);
      return null;
    }

    try {
      const matchedStudent = await requestStudentProfile(
        loggedInUser.email
      );

      setStudent(matchedStudent);

      if (matchedStudent?.id != null) {
        const updatedUser = {
          ...loggedInUser,
          studentId: matchedStudent.id,
        };

        setUser((currentUser) => {
          if (
            currentUser?.email?.toLowerCase() !==
            updatedUser.email.toLowerCase()
          ) {
            return currentUser;
          }

          return updatedUser;
        });

        sessionStorage.setItem(
          "studentUser",
          JSON.stringify(updatedUser)
        );

        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return matchedStudent;
    } catch (error) {
      console.error("Student profile error:", error);
      setStudent(null);
      return null;
    }
  }, []);

  // Restore the logged-in student's profile.
  useEffect(() => {
    let cancelled = false;

    const savedUser = (() => {
      try {
        const value = sessionStorage.getItem("studentUser");
        return value ? JSON.parse(value) : null;
      } catch {
        return null;
      }
    })();

    if (!savedUser?.email) return undefined;

    requestStudentProfile(savedUser.email)
      .then((matchedStudent) => {
        if (cancelled || !matchedStudent) return;

        setStudent(matchedStudent);

        setUser((currentUser) => {
          if (
            currentUser?.email?.toLowerCase() !==
            savedUser.email.toLowerCase()
          ) {
            return currentUser;
          }

          const updatedUser = {
            ...currentUser,
            studentId: matchedStudent.id,
          };

          sessionStorage.setItem(
            "studentUser",
            JSON.stringify(updatedUser)
          );

          localStorage.setItem("user", JSON.stringify(updatedUser));

          return updatedUser;
        });
      })
      .catch((error) => {
        console.error("Saved student profile error:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Clean up temporary resume preview URLs.
  useEffect(() => {
    return () => {
      if (resumePreview) {
        URL.revokeObjectURL(resumePreview);
      }
    };
  }, [resumePreview]);

  const navigateTo = (targetPage) => {
    setPage(targetPage);
    setMessage("");
  };

  // STUDENT LOGIN
  const handleLogin = async (credentials) => {
    setMessage("");

    const rollNumber = String(
      credentials?.rollNumber || credentials?.username || ""
    )
      .trim()
      .toUpperCase();

    const password = credentials?.password || "";

    if (!rollNumber || !password) {
      setMessage("Please enter both your roll number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: rollNumber,
          password,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        setMessage(
          getErrorMessage(result, "Invalid roll number or password.")
        );
        return;
      }

      if (
        !result ||
        typeof result !== "object" ||
        !result.username ||
        !result.email
      ) {
        setMessage(
          "Login response was unexpected. Check the backend response."
        );
        return;
      }

      if (
        result.role &&
        String(result.role).toUpperCase() !== "STUDENT"
      ) {
        setMessage("This login is not a student account.");
        return;
      }

      const loggedInUser = {
        id: result.id,
        studentId: result.studentId ?? null,
        username: result.username,
        email: result.email,
        role: result.role || "STUDENT",
      };

      sessionStorage.setItem(
        "studentUser",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      setStudent(null);
      setPage("dashboard");
      setMessage("");

      await fetchStudentProfile(loggedInUser);
    } catch (error) {
      console.error("Login request failed:", error);
      setMessage(
        "Could not reach the login API. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // STUDENT REGISTRATION
  const handleRegister = async (details = {}) => {
    setMessage("");

    const name = String(details.name || "").trim();

    const rollNumber = String(details.rollNumber || "")
      .trim()
      .toUpperCase();

    const email = String(
      details.email || details.username || ""
    )
      .trim()
      .toLowerCase();

    const branch = String(details.branch || "").trim();
    const password = String(details.password || "");
    const confirmPassword = String(details.confirmPassword || "");

    if (!name || !rollNumber || !email || !password) {
      setMessage(
        "Name, roll number, email, and password are required."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setMessage("Choose a password with at least 8 characters.");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNumber,
          email,
          branch,
          password,
          confirmPassword,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        setMessage(
          getErrorMessage(result, "Unable to create account.")
        );
        return;
      }

      setAuthPage("login");

      setMessage(
        getErrorMessage(
          result,
          "Account created successfully. You can now log in."
        )
      );
    } catch (error) {
      console.error("Registration request failed:", error);
      setMessage(
        "Could not reach the registration API. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // STUDENT PASSWORD RESET
  const handleResetPassword = async (details = {}) => {
    setMessage("");

    if (
      !details.rollNumber?.trim() ||
      !details.email?.trim() ||
      !details.newPassword
    ) {
      setMessage("Please complete all the required fields.");
      return;
    }

    if (details.newPassword.length < 8) {
      setMessage("Passwords must contain at least 8 characters.");
      return;
    }

    if (
      details.confirmPassword &&
      details.newPassword !== details.confirmPassword
    ) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: details.rollNumber.trim().toUpperCase(),
          email: details.email.trim().toLowerCase(),
          newPassword: details.newPassword,
          confirmPassword: details.confirmPassword,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        setMessage(
          getErrorMessage(result, "Unable to reset password.")
        );
        return;
      }

      setAuthPage("login");

      setMessage(
        getErrorMessage(
          result,
          "Password reset successfully. You can now log in."
        )
      );
    } catch (error) {
      console.error("Password reset request failed:", error);
      setMessage(
        "Could not reach the password reset API. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD PROFILE PAGE
  const handleProfile = async () => {
    setPage("profile");
    setMessage("");
    setLoading(true);

    try {
      if (!user?.email) {
        setMessage("Please log in again.");
        return;
      }

      const matchedStudent = await fetchStudentProfile(user);

      if (!matchedStudent) {
        setMessage(
          `No student profile found for ${user.email}. Check the student record and email in the database.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // RESUME FILE SELECTION
  const handleResumeChange = (file) => {
    setMessage("");
    setSelectedFile(file || null);

    setResumePreview((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }

      return file ? URL.createObjectURL(file) : "";
    });
  };

  // RESUME UPLOAD
  const handleResumeUpload = async (event) => {
    event?.preventDefault?.();
    setMessage("");

    if (!selectedFile) {
      setMessage("Please select a resume first.");
      return;
    }

    if (!/\.(pdf|doc|docx)$/i.test(selectedFile.name)) {
      setMessage("Choose a PDF, DOC, or DOCX resume.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File is too large. Maximum size is 5 MB.");
      return;
    }

    setResumeLoading(true);

    try {
      let studentRecord = student;

      if (studentRecord?.id == null && user?.email) {
        studentRecord = await fetchStudentProfile(user);
      }

      const studentId = studentRecord?.id ?? user?.studentId;

      if (studentId == null) {
        setMessage(
          "Student database ID was not found. Check that your email matches a student record."
        );
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("studentId", String(studentId));

      const response = await fetch(`${API}/api/resumes/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await readResponse(response);

      if (!response.ok) {
        setMessage(
          `Upload failed: ${getErrorMessage(result, "Please try again.")}`
        );
        return;
      }

      setUploadedResumeName(selectedFile.name);

      setMessage(
        typeof result === "string"
          ? result
          : result?.message || "Resume uploaded successfully!"
      );

      setSelectedFile(null);
      setResumePreview("");
    } catch (error) {
      console.error("Resume upload error:", error);
      setMessage(
        "Unable to connect to the upload service. Check that the backend is running."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("studentUser");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("currentUser");

    setUser(null);
    setStudent(null);
    setPage("dashboard");
    setAuthPage("login");
    setSelectedFile(null);
    setResumePreview("");
    setUploadedResumeName("");
    setMessage("");
    setLoading(false);
    setResumeLoading(false);
  };

  // AUTH PAGES
  if (!user) {
    if (authPage === "register") {
      return (
        <div>
          {onBack && (
            <button type="button" onClick={onBack}>
              ← Portal Selection
            </button>
          )}

          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => {
              setAuthPage("login");
              setMessage("");
            }}
            loading={loading}
            message={message}
          />
        </div>
      );
    }

    if (authPage === "forgot") {
      return (
        <div>
          {onBack && (
            <button type="button" onClick={onBack}>
              ← Portal Selection
            </button>
          )}

          <ForgotPassword
            onReset={handleResetPassword}
            onBack={() => {
              setAuthPage("login");
              setMessage("");
            }}
            loading={loading}
            message={message}
          />
        </div>
      );
    }

    return (
      <div>
        {onBack && (
          <button type="button" onClick={onBack}>
            ← Portal Selection
          </button>
        )}

        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setAuthPage("register");
            setMessage("");
          }}
          onForgotPassword={() => {
            setAuthPage("forgot");
            setMessage("");
          }}
          loading={loading}
          message={message}
        />
      </div>
    );
  }

  // PAGE CONTENT
  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <StudentDashboard
            user={user}
            student={student}
            onNavigate={navigateTo}
          />
        );

      case "profile":
        return (
          <>
            {message && (
              <p className="message error" role="alert">
                {message}
              </p>
            )}

            {loading ? (
              <div className="content-card">
                <h2>My Profile</h2>
                <p>Loading student profile...</p>
              </div>
            ) : (
              <MyProfile user={user} student={student} />
            )}
          </>
        );

      case "resume":
        return (
          <ResumeUpload
            resume={selectedFile}
            resumeUrl={resumePreview}
            uploadedResumeName={uploadedResumeName}
            message={message}
            loading={resumeLoading}
            onFileChange={handleResumeChange}
            onUpload={handleResumeUpload}
          />
        );

      case "drives":
        return <PlacementDrives student={student} />;

      case "readiness":
        return <PlacementReadiness />;

      case "skills":
        return <SkillGapAnalysis />;

      // UPDATED: Pass the logged-in student's profile
      // into the recommendation component.
      case "jobs":
        return <RecommendedJobs student={student} />;

      case "internships":
        return <Internships />;

      case "history":
        return <PlacementHistory />;

      default:
        return (
          <StudentDashboard
            user={user}
            student={student}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      page={page}
      onNavigate={navigateTo}
      onProfile={handleProfile}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
}

export default StudentApp;
