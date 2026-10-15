
import { useState } from "react";

const skillList = [
  {
    name: "Python",
    category: "Technical",
    description: "Programming fundamentals and problem solving",
  },
  {
    name: "SQL",
    category: "Technical",
    description: "Queries, joins, grouping, and database concepts",
  },
  {
    name: "Data Structures",
    category: "Technical",
    description: "Arrays, strings, stacks, queues, and trees",
  },
  {
    name: "Web Development",
    category: "Technical",
    description: "HTML, CSS, JavaScript, and application development",
  },
  {
    name: "Aptitude",
    category: "Placement",
    description: "Quantitative aptitude and logical reasoning",
  },
  {
    name: "Communication",
    category: "Professional",
    description: "Presenting ideas and explaining technical work",
  },
];

const levels = [
  { value: "beginner", label: "Beginner", score: 1 },
  { value: "intermediate", label: "Intermediate", score: 2 },
  { value: "advanced", label: "Advanced", score: 3 },
];

function SkillGapAnalysis() {
  const [skills, setSkills] = useState({});
  const [showResults, setShowResults] = useState(false);

  const updateSkill = (skillName, value) => {
    setSkills((previous) => ({
      ...previous,
      [skillName]: value,
    }));
    setShowResults(false);
  };

  const assessedSkills = skillList.filter((skill) => skills[skill.name]);

  const averageLevel =
    assessedSkills.length > 0
      ? assessedSkills.reduce((total, skill) => {
          const level = levels.find(
            (item) => item.value === skills[skill.name]
          );
          return total + (level?.score || 0);
        }, 0) / assessedSkills.length
      : 0;

  const overallLevel =
    averageLevel === 0
      ? "Not assessed"
      : averageLevel < 1.7
        ? "Beginner"
        : averageLevel < 2.5
          ? "Intermediate"
          : "Advanced";

  const handleAnalyze = () => {
    if (assessedSkills.length === 0) {
      setShowResults(false);
      return;
    }

    setShowResults(true);
  };

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Skill Gap Analysis</h2>
          <p>Assess your skills and identify areas for improvement.</p>
        </div>
      </div>

      <section className="skill-assessment-card">
        <h3>Rate Your Skills</h3>
        <p>
          Select your current level for each skill. Leave unassessed
          skills blank.
        </p>

        <div className="skill-list">
          {skillList.map((skill) => (
            <div className="skill-row" key={skill.name}>
              <div className="skill-information">
                <strong>{skill.name}</strong>
                <span>{skill.description}</span>
                <small>{skill.category}</small>
              </div>

              <select
                aria-label={`${skill.name} proficiency level`}
                value={skills[skill.name] || ""}
                onChange={(event) =>
                  updateSkill(skill.name, event.target.value)
                }
              >
                <option value="">Select level</option>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAnalyze}
        >
          Analyze My Skills
        </button>

        {showResults && (
          <div className="skill-results" aria-live="polite">
            <h3>Your Self-Assessment Summary</h3>

            <div className="skill-result-stats">
              <div>
                <span>Skills assessed</span>
                <strong>
                  {assessedSkills.length} / {skillList.length}
                </strong>
              </div>

              <div>
                <span>Average level</span>
                <strong>{overallLevel}</strong>
              </div>
            </div>

            <h4>Skills to Focus On</h4>

            {assessedSkills
              .filter(
                (skill) =>
                  skills[skill.name] === "beginner"
              )
              .map((skill) => (
                <p className="skill-gap-item" key={skill.name}>
                  <strong>{skill.name}:</strong> Consider practising the
                  fundamentals and completing a small project.
                </p>
              ))}

            {assessedSkills.every(
              (skill) => skills[skill.name] !== "beginner"
            ) && (
              <p>
                No assessed skill is marked Beginner. Keep practising and
                validate your progress with projects and exercises.
              </p>
            )}

            <p className="info-message">
              This is a self-assessment, not an AI-generated evaluation.
              Your results are not saved after refreshing the page.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default SkillGapAnalysis;