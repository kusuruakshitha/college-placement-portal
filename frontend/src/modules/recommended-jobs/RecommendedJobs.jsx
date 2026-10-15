
import { useState } from "react";

const jobList = [
  {
    id: 1,
    title: "Junior Python Developer",
    company: "Software Development",
    type: "Full-time",
    skills: ["Python", "SQL", "Problem Solving"],
    description:
      "Work on Python applications, debugging, and software development tasks.",
  },
  {
    id: 2,
    title: "Data Analyst",
    company: "Data and Analytics",
    type: "Full-time",
    skills: ["SQL", "Python", "Data Visualization"],
    description:
      "Analyse datasets, prepare reports, and communicate business insights.",
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Web Development",
    type: "Full-time",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    description:
      "Build and maintain responsive user interfaces for web applications.",
  },
  {
    id: 4,
    title: "AI/ML Trainee",
    company: "Artificial Intelligence",
    type: "Entry-level",
    skills: ["Python", "Machine Learning", "Statistics"],
    description:
      "Assist with data preparation, model experiments, and ML projects.",
  },
  {
    id: 5,
    title: "SQL Developer Trainee",
    company: "Database Development",
    type: "Entry-level",
    skills: ["SQL", "MySQL", "Database Design"],
    description:
      "Practise database queries, data retrieval, and database maintenance.",
  },
  {
    id: 6,
    title: "Software Engineer Trainee",
    company: "Software Engineering",
    type: "Entry-level",
    skills: ["Programming", "Data Structures", "Git"],
    description:
      "Develop, test, and maintain software with support from an engineering team.",
  },
];

function RecommendedJobs() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("All");
  const [savedJobs, setSavedJobs] = useState([]);

  const filteredJobs = jobList.filter((job) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchText)
      );

    const matchesType =
      jobType === "All" || job.type === jobType;

    return matchesSearch && matchesType;
  });

  const toggleSavedJob = (jobId) => {
    setSavedJobs((previous) =>
      previous.includes(jobId)
        ? previous.filter((id) => id !== jobId)
        : [...previous, jobId]
    );
  };

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Recommended Jobs</h2>
          <p>Explore entry-level roles and their required skills.</p>
        </div>
      </div>

      <section className="job-filters">
        <input
          type="search"
          placeholder="Search by job title or skill..."
          aria-label="Search jobs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Filter by job type"
          value={jobType}
          onChange={(event) => setJobType(event.target.value)}
        >
          <option value="All">All job types</option>
          <option value="Full-time">Full-time</option>
          <option value="Entry-level">Entry-level</option>
        </select>
      </section>

      <p className="results-count">
        {filteredJobs.length} job role
        {filteredJobs.length === 1 ? "" : "s"} displayed
      </p>

      <section className="job-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isSaved = savedJobs.includes(job.id);

            return (
              <article className="job-card" key={job.id}>
                <div className="job-card-header">
                  <div className="job-icon" aria-hidden="true">
                    💼
                  </div>

                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <p>{job.company}</p>
                  </div>

                  <span className="job-type">{job.type}</span>
                </div>

                <p className="job-description">{job.description}</p>

                <div className="job-skills">
                  {job.skills.map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => toggleSavedJob(job.id)}
                >
                  {isSaved ? "★ Saved" : "☆ Save Job"}
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <h3>No matching roles found</h3>
            <p>Try a different search term or job type.</p>
          </div>
        )}
      </section>

      <p className="info-message">
        These are sample job listings for demonstration. They are not
        live vacancies, and saving a job only lasts until the page is
        refreshed.
      </p>
    </div>
  );
}

export default RecommendedJobs;