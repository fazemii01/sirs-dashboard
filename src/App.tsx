import { RouterProvider } from 'react-router';
import router from './routes/Router';
import { Toaster } from 'src/components/ui/sonner';
import './css/globals.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
