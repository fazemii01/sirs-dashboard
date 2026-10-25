import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/css/globals.css';
import App from './App.tsx';
import Spinner from './views/spinner/Spinner.tsx';
import { ThemeProvider } from './context/shadcntheme/ThemeContext.tsx';
import { worker } from './api/mocks/browser.ts';

async function prepareApp() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
    });
  } catch (error) {
    console.warn('MSW worker failed to start, proceeding with native requests:', error);
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Suspense fallback={<Spinner />}>
        <App />
      </Suspense>
    </ThemeProvider>,
  );
});
