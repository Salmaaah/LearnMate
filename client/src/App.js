import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { DataProvider } from './contexts/DataContext';
import { EditorProvider } from './contexts/EditorContext';
import Welcome from './pages/Welcome/Welcome';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Courses from './pages/Courses/Courses';
import Learn from './pages/Learn/Learn';

function App() {
  return (
    <Router>
      <DataProvider>
        <SidebarProvider>
          <EditorProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/learn/:id" element={<Learn />} />
            </Routes>
          </EditorProvider>
        </SidebarProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
