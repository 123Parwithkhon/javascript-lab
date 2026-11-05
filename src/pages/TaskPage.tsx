import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { checkTask, type CheckHandle, type CheckResult } from '../checker/checkTask';
import { CheckFeedback } from '../components/CheckFeedback';
import { CodeRunner } from '../components/CodeRunner';
import { Confetti } from '../components/Confetti';
import { HintPanel } from '../components/HintPanel';
import { lessonForModule } from '../content/lessons';
import { findTask, nextTask, TASKS } from '../content/tasks';
import type { Task } from '../content/types';
import { t } from '../i18n';
import { rewardFor, type Reward } from '../progress/rewards';
import { getProgress, markSolved, saveDraft, useProgress } from '../progress/store';
import { isUnlocked } from '../progress/unlock';
import { NotFoundPage } from './NotFoundPage';

const DRAFT_SAVE_DELAY_MS = 400;

function formatGivens(givens: NonNullable<Task['cases'][0]['givens']>): string {
  return Object.entries(givens)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join(', ');
}

function TaskWorkspace({ task }: { task: Task }) {
  const progress = useProgress();
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const checkRef = useRef<CheckHandle | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Черновик читаем один раз: иначе автосохранение перезапускало бы редактор.
  const [startCode] = useState(() => progress.drafts[task.id]);
  const justPassed = checkResult?.status === 'passed';
  const isSolved = Boolean(progress.solved[task.id]);
  const next = nextTask(task);
  const firstCase = task.cases[0];
  const lesson = lessonForModule(task.moduleId);

  useEffect(
    () => () => {
      checkRef.current?.stop();
      clearTimeout(draftTimer.current);
    },
    [],
  );

  // На телефоне результат оказывается ниже консоли, поэтому показываем его сразу.
  useEffect(() => {
    if (checkResult) feedbackRef.current?.scrollIntoView({ block: 'nearest' });
  }, [checkResult]);

  const onCodeChange = (code: string) => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveDraft(task.id, code), DRAFT_SAVE_DELAY_MS);
  };

  const check = async (code: string) => {
    setChecking(true);
    setCheckResult(null);
    saveDraft(task.id, code);
    const handle = checkTask(task, code);
    checkRef.current = handle;
    const result = await handle.result;
    setCheckResult(result);
    setChecking(false);
    if (result.status === 'passed') {
      const before = getProgress();
      markSolved(task.id, failedAttempts === 0 && !hintUsed);
      setReward(rewardFor(task, TASKS, before, getProgress(), new Date()));
    }
    if (result.status === 'failed' || result.status === 'run-failed') {
      setFailedAttempts((count) => count + 1);
    }
  };

  return (
    <div className="container section task">
      <div className="task__intro">
        <Link to="/trainer" className="back-link">
          ← {t.task.backToTrainer}
        </Link>
        <h1>{task.title}</h1>
        <p className="task__meta">
          {t.home.modules[task.moduleId]} · {t.levels[task.level]}
          {isSolved && <span className="badge badge--solved">✓ {t.task.solvedBadge}</span>}
        </p>
        {lesson && (
          <p>
            <Link to={`/learn/${lesson.slug}`} className="lesson-link">
              {t.task.lessonLink}
            </Link>
          </p>
        )}
        <p>{task.theory}</p>
        {task.example && <pre className="code-block">{task.example}</pre>}
        <h2>{t.task.taskTitle}</h2>
        <p className="task__description">{task.description}</p>
        {firstCase.givens && (
          <p className="task__givens">
            {t.task.givensOnRun} <code>{formatGivens(firstCase.givens)}</code>
          </p>
        )}
        <HintPanel
          hints={task.hints}
          solution={task.solution}
          failedAttempts={failedAttempts}
          onHintShown={() => setHintUsed(true)}
        />
      </div>

      <div className="task__work">
        <CodeRunner
          initialCode={task.initialCode}
          startCode={startCode}
          givens={firstCase.givens}
          setup={task.setup}
          onCodeChange={onCodeChange}
          busy={checking}
          renderActions={(code) =>
            checking ? (
              <button type="button" className="button" onClick={() => checkRef.current?.stop()}>
                {t.task.stopCheck}
              </button>
            ) : (
              <button type="button" className="button button--check" onClick={() => void check(code)}>
                {t.task.check}
              </button>
            )
          }
        />
        {checkResult && !justPassed && (
          <div ref={feedbackRef}>
            <CheckFeedback result={checkResult} />
          </div>
        )}
        {justPassed && (
          <div ref={feedbackRef} className="feedback feedback--success" role="status">
            <h2>
              <span className="success-mark" aria-hidden="true">
                ✓
              </span>{' '}
              {t.task.passed}
            </h2>
            <p>{t.task.passedCases(task.cases.length)}</p>
            {reward && (
              <div className="reward">
                <p className="reward__points">
                  {t.task.pointsEarned(reward.points)}
                  {reward.clean && <span className="reward__bonus"> {t.task.cleanBonus}</span>}
                </p>
                {reward.newAchievements.map((id) => (
                  <p key={id} className="reward__achievement">
                    🏅 {t.task.newAchievement}: <b>{t.achievements[id].title}</b>
                  </p>
                ))}
                {reward.moduleDone && (
                  <p className="reward__achievement">🎉 {t.task.moduleDone}</p>
                )}
              </div>
            )}
            {reward?.moduleDone && <Confetti />}
            <p>{task.explanation}</p>
            <details>
              <summary>{t.task.referenceSolution}</summary>
              <pre className="code-block">{task.solution}</pre>
            </details>
            <p className="feedback__note">{t.task.savedLocally}</p>
            {next ? (
              <Link to={`/trainer/${next.id}`} className="button button--primary">
                {t.task.next}: {next.title}
              </Link>
            ) : (
              <Link to="/trainer" className="button button--primary">
                {t.task.allDone}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskPage() {
  const { id } = useParams();
  const progress = useProgress();
  const task = findTask(id);

  if (!task) return <NotFoundPage />;

  if (!isUnlocked(task, TASKS, progress.solved)) {
    return (
      <div className="container section">
        <div className="empty-state">
          <h1>{t.task.lockedTitle}</h1>
          <p>{t.task.lockedText}</p>
          <Link to="/trainer" className="button button--primary">
            {t.task.backToTrainer}
          </Link>
        </div>
      </div>
    );
  }

  // key: при переходе к другому заданию всё состояние создаётся заново.
  return <TaskWorkspace key={task.id} task={task} />;
}
