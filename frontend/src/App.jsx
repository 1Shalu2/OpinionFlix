import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import Dashboard from './pages/Dashboard';
import MoodPicker from './pages/MoodPicker';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth pages - no layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Main pages - with layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/search" element={<Layout><Search /></Layout>} />
            <Route path="/movie/:id" element={<Layout><MovieDetail /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/mood" element={<Layout><MoodPicker /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
