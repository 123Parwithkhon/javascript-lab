import { Link } from 'react-router';
import { TASKS } from '../content/tasks';
import { t } from '../i18n';
import { useProgress } from '../progress/store';
import { isUnlocked } from '../progress/unlock';

const PROJECT_MODULE = 14;

export function ProjectsPage() {
  const { solved } = useProgress();
  const projects = TASKS.filter((task) => task.moduleId === PROJECT_MODULE);
  const doneCount = projects.filter((project) => solved[project.id]).length;

  return (
    <div className="container section">
      <h1>{t.projects.title}</h1>
      <p className="lead">{t.projects.lead}</p>

      <div className="progress-panel">
        <p>{t.projects.progress(doneCount, projects.length)}</p>
        <progress value={doneCount} max={projects.length} aria-label={t.projects.title} />
      </div>

      <div className="project-grid">
        {projects.map((project, index) => {
          const unlocked = isUnlocked(project, TASKS, solved);
          const done = Boolean(solved[project.id]);
          return (
            <article key={project.id} className={`project-card ${unlocked ? '' : 'project-card--locked'}`}>
              <h2>
                {index + 1}. {project.title}
              </h2>
              <p>{project.description}</p>
              <h3>{t.projects.stages}</h3>
              <ol>
                {project.cases.map((stage) => (
                  <li key={stage.label}>{stage.label.replace(/^Этап \d+: /, '')}</li>
                ))}
              </ol>
              <p className={`badge ${done ? 'badge--solved' : ''}`}>
                {done ? `✓ ${t.projects.done}` : unlocked ? t.projects.available : `🔒 ${t.projects.locked}`}
              </p>
              {unlocked && (
                <Link to={`/trainer/${project.id}`} className="button button--primary">
                  {done ? t.projects.open : t.projects.start}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
