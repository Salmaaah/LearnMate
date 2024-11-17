import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { DataProvider } from './contexts/DataContext';
import { EditorProvider } from './contexts/EditorContext';
import { OpenDeckProvider } from './contexts/DeckContext';
import Welcome from './pages/Welcome/Welcome';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';
import Courses from './pages/Courses/Courses';
import Learn from './pages/Learn/Learn';

function App() {
  return (
    <Router>
      <DataProvider>
        <SidebarProvider>
          <EditorProvider>
            <OpenDeckProvider>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/learn/:id" element={<Learn />} />
              </Routes>
            </OpenDeckProvider>
          </EditorProvider>
        </SidebarProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
