import { TASKS } from '../content/tasks';
import { t } from '../i18n';
import {
  ACHIEVEMENT_IDS,
  earnedAchievements,
  rankFor,
  streaks,
  totalPoints,
} from '../progress/rewards';
import { useProgress } from '../progress/store';

export function ProfilePage() {
  const progress = useProgress();
  const now = new Date();
  const points = totalPoints(TASKS, progress);
  const rank = rankFor(points);
  const { current, best } = streaks(Object.values(progress.solved), now);
  const earned = earnedAchievements(TASKS, progress, now);
  const solvedCount = TASKS.filter((task) => progress.solved[task.id]).length;
  const cleanCount = TASKS.filter((task) => progress.clean[task.id]).length;

  return (
    <div className="container section">
      <h1>{t.profile.title}</h1>
      <p className="lead">{t.profile.lead}</p>

      <section className="rank-panel">
        <p className="rank-panel__label">{t.profile.rank}</p>
        <p className="rank-panel__name">{t.profile.ranks[rank.index]}</p>
        {rank.nextAt !== null ? (
          <>
            <progress
              value={points - rank.currentAt}
              max={rank.nextAt - rank.currentAt}
              aria-label={t.profile.rankProgress}
            />
            <p className="rank-panel__next">{t.profile.toNextRank(rank.nextAt - points)}</p>
          </>
        ) : (
          <p className="rank-panel__next">{t.profile.topRank}</p>
        )}
      </section>

      <dl className="stats">
        <div>
          <dt>{t.profile.points}</dt>
          <dd>{points}</dd>
        </div>
        <div>
          <dt>{t.profile.solved}</dt>
          <dd>
            {solvedCount} / {TASKS.length}
          </dd>
        </div>
        <div>
          <dt>{t.profile.clean}</dt>
          <dd>{cleanCount}</dd>
        </div>
        <div>
          <dt>{t.profile.streak}</dt>
          <dd>{current}</dd>
        </div>
        <div>
          <dt>{t.profile.bestStreak}</dt>
          <dd>{best}</dd>
        </div>
      </dl>

      <h2>
        {t.profile.achievements} ({earned.size} / {ACHIEVEMENT_IDS.length})
      </h2>
      <ul className="achievement-grid">
        {ACHIEVEMENT_IDS.map((id) => {
          const unlocked = earned.has(id);
          return (
            <li key={id} className={`achievement ${unlocked ? 'achievement--earned' : ''}`}>
              <span className="achievement__icon" aria-hidden="true">
                {unlocked ? '🏅' : '🔒'}
              </span>
              <span>
                <b>{t.achievements[id].title}</b>
                <br />
                <span className="achievement__text">{t.achievements[id].text}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
