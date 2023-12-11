import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';
import Input from './components/Shared/Input/Input';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Input type="password" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
