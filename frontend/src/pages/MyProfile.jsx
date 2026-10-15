
function MyProfile({ user, student }) {
  const profile = student || {};

  const fields = [
    {
      label: "Full Name",
      value:
        profile.name ||
        profile.fullName ||
        user?.username ||
        user?.name,
    },
    {
      label: "Email Address",
      value: profile.email || user?.email,
    },
    {
      label: "Roll Number",
      value: profile.rollNumber || profile.rollNo || profile.studentId,
    },
    {
      label: "Department",
      value: profile.department || profile.branch,
    },
    {
      label: "Course",
      value: profile.course || profile.program,
    },
    {
      label: "Academic Year",
      value: profile.academicYear || profile.yearOfStudy,
    },
    {
      label: "CGPA",
      value: profile.cgpa,
    },
    {
      label: "Phone Number",
      value: profile.phone || profile.phoneNumber,
    },
  ];

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>My Profile</h2>
          <p>View your registered details and academic information.</p>
        </div>
      </div>

      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar" aria-hidden="true">
            {(profile.name || profile.fullName || user?.username || "S")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>
              {profile.name ||
                profile.fullName ||
                user?.username ||
                user?.name ||
                "Student"}
            </h3>
            <p>{profile.email || user?.email || "Email not available"}</p>
          </div>
        </div>

        {!student && (
          <p className="info-message">
            Your student profile record has not been loaded yet.
            Please check that your account email matches your student
            record.
          </p>
        )}

        <div className="profile-details">
          {fields.map((field) => (
            <div className="profile-detail" key={field.label}>
              <span>{field.label}</span>
              <strong>
                {field.value !== undefined &&
                field.value !== null &&
                field.value !== ""
                  ? field.value
                  : "Not provided"}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MyProfile;