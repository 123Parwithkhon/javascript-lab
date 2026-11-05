import { useState } from 'react';
import { Link } from 'react-router';
import { TASKS } from '../content/tasks';
import type { Task, TaskLevel } from '../content/types';
import { t } from '../i18n';
import { dailyTask } from '../progress/daily';
import { rankFor, streaks, totalPoints } from '../progress/rewards';
import { useProgress } from '../progress/store';
import { isUnlocked, recommendedTask } from '../progress/unlock';

type LevelFilter = TaskLevel | 'all';

const LEVELS: TaskLevel[] = ['easy', 'medium', 'hard'];

function TaskCard({
  task,
  solved,
  clean,
  unlocked,
}: {
  task: Task;
  solved: boolean;
  clean: boolean;
  unlocked: boolean;
}) {
  const content = (
    <>
      <span className="task-card__title">{task.title}</span>
      <span className="task-card__meta">
        {task.topic} · {t.levels[task.level]}
      </span>
      <span className={`badge ${solved ? 'badge--solved' : ''}`}>
        {solved
          ? `✓ ${t.trainer.solved}${clean ? ' ★' : ''}`
          : unlocked
            ? t.trainer.available
            : `🔒 ${t.trainer.locked}`}
      </span>
    </>
  );

  return unlocked ? (
    <Link to={`/trainer/${task.id}`} className="task-card">
      {content}
    </Link>
  ) : (
    <div className="task-card task-card--locked" aria-disabled="true">
      {content}
    </div>
  );
}

export function TrainerPage() {
  const progress = useProgress();
  const { solved, clean } = progress;
  const [level, setLevel] = useState<LevelFilter>('all');

  const solvedCount = TASKS.filter((task) => solved[task.id]).length;
  const points = totalPoints(TASKS, progress);
  const { current } = streaks(Object.values(solved), new Date());
  const recommended = recommendedTask(TASKS, solved);
  const daily = dailyTask(TASKS, solved, new Date());
  const moduleIds = [...new Set(TASKS.map((task) => task.moduleId))];
  const visible = TASKS.filter((task) => level === 'all' || task.level === level);

  return (
    <div className="container section">
      <h1>{t.trainer.title}</h1>
      <p className="lead">{t.trainer.lead}</p>

      <div className="progress-panel">
        <p>{t.trainer.progress(solvedCount, TASKS.length)}</p>
        <progress value={solvedCount} max={TASKS.length} aria-label={t.trainer.progressLabel} />
        <Link to="/profile" className="trainer-stats">
          {t.profile.ranks[rankFor(points).index]} · {t.trainer.pointsShort(points)}
          {current > 0 && ` · 🔥 ${t.trainer.streakShort(current)}`}
        </Link>
        {recommended ? (
          <Link to={`/trainer/${recommended.id}`} className="button button--primary">
            {solvedCount === 0 ? t.trainer.start : t.trainer.continue}: {recommended.title}
          </Link>
        ) : (
          <p>{t.trainer.finished}</p>
        )}
        {daily && (
          <Link to={`/trainer/${daily.id}`} className="button">
            🗓 {t.trainer.daily}: {daily.title}
          </Link>
        )}
      </div>

      <label className="field">
        {t.trainer.levelFilter}
        <select value={level} onChange={(event) => setLevel(event.target.value as LevelFilter)}>
          <option value="all">{t.trainer.allLevels}</option>
          {LEVELS.map((item) => (
            <option key={item} value={item}>
              {t.levels[item]}
            </option>
          ))}
        </select>
      </label>

      {moduleIds.map((moduleId) => {
        const tasks = visible.filter((task) => task.moduleId === moduleId);
        if (tasks.length === 0) return null;
        return (
          <section key={moduleId} className="task-group">
            <h2>
              {moduleId}. {t.home.modules[moduleId]}
            </h2>
            <div className="task-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  solved={Boolean(solved[task.id])}
                  clean={Boolean(clean[task.id])}
                  unlocked={isUnlocked(task, TASKS, solved)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
