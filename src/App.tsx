import { lazy, Suspense, type ComponentType } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { t } from './i18n';
import { HomePage } from './pages/HomePage';

// Главная загружается сразу, а остальные страницы и весь учебный контент отдельно:
// первый запуск кода не должен ждать загрузки всего курса на медленном интернете.
function page<Name extends string>(load: () => Promise<Record<Name, ComponentType>>, name: Name) {
  return lazy(() => load().then((module) => ({ default: module[name] })));
}

const AboutPage = page(() => import('./pages/AboutPage'), 'AboutPage');
const LearnPage = page(() => import('./pages/LearnPage'), 'LearnPage');
const LessonPage = page(() => import('./pages/LessonPage'), 'LessonPage');
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage');
const PlaygroundPage = page(() => import('./pages/PlaygroundPage'), 'PlaygroundPage');
const ProjectsPage = page(() => import('./pages/ProjectsPage'), 'ProjectsPage');
const ProfilePage = page(() => import('./pages/ProfilePage'), 'ProfilePage');
const TaskPage = page(() => import('./pages/TaskPage'), 'TaskPage');
const TrainerPage = page(() => import('./pages/TrainerPage'), 'TrainerPage');

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route
              path="*"
              element={
                <Suspense fallback={<p className="container section page-loading">{t.loading}</p>}>
                  <Routes>
                    <Route path="learn" element={<LearnPage />} />
                    <Route path="learn/:slug" element={<LessonPage />} />
                    <Route path="trainer" element={<TrainerPage />} />
                    <Route path="trainer/:id" element={<TaskPage />} />
                    <Route path="playground" element={<PlaygroundPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
