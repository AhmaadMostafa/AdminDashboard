import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Customers from './pages/Customers';
import Requests from './pages/Requests';
import WorkerDetail from './pages/WorkerDetail';
import CustomerDetail from './pages/CustomerDetail';
import RequestDetail from './pages/RequestDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/workers/:id" element={<WorkerDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;