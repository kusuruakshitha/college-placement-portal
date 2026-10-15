
import { useState } from "react";

const internshipList = [
  {
    id: 1,
    title: "Python Development Intern",
    domain: "Software Development",
    duration: "8–12 weeks",
    mode: "Remote",
    skills: ["Python", "Git", "Problem Solving"],
    description:
      "Practise Python programming by developing small applications and solving coding tasks.",
  },
  {
    id: 2,
    title: "Data Analytics Intern",
    domain: "Data Analytics",
    duration: "8–12 weeks",
    mode: "Hybrid",
    skills: ["SQL", "Excel", "Data Visualization"],
    description:
      "Clean datasets, analyse trends, and prepare reports and visualizations.",
  },
  {
    id: 3,
    title: "Frontend Development Intern",
    domain: "Web Development",
    duration: "8–12 weeks",
    mode: "Remote",
    skills: ["HTML", "CSS", "JavaScript"],
    description:
      "Build responsive web pages and practise frontend development.",
  },
  {
    id: 4,
    title: "AI/ML Intern",
    domain: "Artificial Intelligence",
    duration: "10–12 weeks",
    mode: "Hybrid",
    skills: ["Python", "Pandas", "Machine Learning"],
    description:
      "Work on practice datasets, explore machine learning concepts, and document experiments.",
  },
  {
    id: 5,
    title: "Database Intern",
    domain: "Database Management",
    duration: "6–10 weeks",
    mode: "On-site",
    skills: ["MySQL", "SQL", "Database Design"],
    description:
      "Practise database queries, data modelling, and data management.",
  },
];

function Internships() {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("All");
  const [savedIds, setSavedIds] = useState([]);

  const filteredInternships = internshipList.filter((internship) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      internship.title.toLowerCase().includes(searchText) ||
      internship.domain.toLowerCase().includes(searchText) ||
      internship.skills.some((skill) =>
        skill.toLowerCase().includes(searchText)
      );

    const matchesMode = mode === "All" || internship.mode === mode;

    return matchesSearch && matchesMode;
  });

  const toggleSaved = (id) => {
    setSavedIds((previous) =>
      previous.includes(id)
        ? previous.filter((savedId) => savedId !== id)
        : [...previous, id]
    );
  };

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Internships</h2>
          <p>Explore internships to gain practical experience.</p>
        </div>
      </div>

      <section className="job-filters">
        <input
          type="search"
          placeholder="Search internships or skills..."
          aria-label="Search internships"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Filter by work mode"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          <option value="All">All work modes</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
      </section>

      <p className="results-count">
        {filteredInternships.length} internship
        {filteredInternships.length === 1 ? "" : "s"} displayed
      </p>

      <section className="job-list">
        {filteredInternships.length > 0 ? (
          filteredInternships.map((internship) => {
            const isSaved = savedIds.includes(internship.id);

            return (
              <article className="job-card" key={internship.id}>
                <div className="job-card-header">
                  <div className="job-icon" aria-hidden="true">
                    🎓
                  </div>

                  <div className="job-title-section">
                    <h3>{internship.title}</h3>
                    <p>{internship.domain}</p>
                  </div>

                  <span className="job-type">{internship.mode}</span>
                </div>

                <p className="job-description">
                  {internship.description}
                </p>

                <p className="internship-duration">
                  <strong>Duration:</strong> {internship.duration}
                </p>

                <div className="job-skills">
                  {internship.skills.map((skill) => (
                    <span className="skill-tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => toggleSaved(internship.id)}
                >
                  {isSaved ? "★ Saved" : "☆ Save Internship"}
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            <h3>No matching internships found</h3>
            <p>Try another search term or work mode.</p>
          </div>
        )}
      </section>

      <p className="info-message">
        These are sample listings for demonstration, not verified
        vacancies. Saved internships are temporary and reset on refresh.
      </p>
    </div>
  );
}

export default Internships;