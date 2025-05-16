import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Customers from './pages/Customers';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import WorkerDetail from './pages/WorkerDetail';
import CustomerDetail from './pages/CustomerDetail';
import RequestDetail from './pages/RequestDetail';
import { useAuth } from './utils/auth';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>} />
        <Route path="/workers/:id" element={<PrivateRoute><WorkerDetail /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/customers/:id" element={<PrivateRoute><CustomerDetail /></PrivateRoute>} />
        <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
        <Route path="/requests/:id" element={<PrivateRoute><RequestDetail /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;