
import { useState } from "react";

const readinessQuestions = [
  {
    id: "resume",
    title: "Resume Preparation",
    description: "Have you prepared an updated resume?",
  },
  {
    id: "coding",
    title: "Coding Skills",
    description: "Have you practised programming problems?",
  },
  {
    id: "aptitude",
    title: "Aptitude Preparation",
    description: "Have you practised quantitative and logical reasoning?",
  },
  {
    id: "communication",
    title: "Communication Skills",
    description: "Have you practised speaking and explaining your ideas?",
  },
  {
    id: "interview",
    title: "Interview Preparation",
    description: "Have you practised common interview questions?",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Have you completed or documented your projects?",
  },
];

function PlacementReadiness() {
  const [answers, setAnswers] = useState({});

  const completedCount = readinessQuestions.filter(
    (question) => answers[question.id]
  ).length;

  const readinessScore = Math.round(
    (completedCount / readinessQuestions.length) * 100
  );

  const updateAnswer = (id, checked) => {
    setAnswers((previous) => ({
      ...previous,
      [id]: checked,
    }));
  };

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <h2>Placement Readiness</h2>
          <p>Evaluate your current placement preparation.</p>
        </div>
      </div>

      <section className="readiness-summary">
        <div>
          <p className="summary-label">Self-assessment progress</p>
          <h3>{readinessScore}%</h3>
          <p>
            {completedCount} of {readinessQuestions.length} preparation
            activities marked complete
          </p>
        </div>

        <div
          className="readiness-progress"
          role="progressbar"
          aria-label="Placement preparation checklist progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readinessScore}
        >
          <div
            className="readiness-progress-fill"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
      </section>

      <section className="readiness-list">
        <h3>Preparation Checklist</h3>
        <p>Tick the activities you have completed.</p>

        {readinessQuestions.map((question) => (
          <label className="readiness-item" key={question.id}>
            <input
              type="checkbox"
              checked={Boolean(answers[question.id])}
              onChange={(event) =>
                updateAnswer(question.id, event.target.checked)
              }
            />

            <span>
              <strong>{question.title}</strong>
              <small>{question.description}</small>
            </span>
          </label>
        ))}
      </section>

      <p className="info-message">
        This score reflects your checklist progress only. It is not an
        official placement prediction, and your selections are not saved
        after the page is refreshed.
      </p>
    </div>
  );
}

export default PlacementReadiness;