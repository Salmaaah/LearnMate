import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { DataProvider } from './contexts/DataContext';
import Welcome from './pages/Welcome/Welcome';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Courses from './pages/Courses/Courses';

function App() {
  return (
    <Router>
      <DataProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
          </Routes>
        </SidebarProvider>
      </DataProvider>
    </Router>
  );
}

export default App;
