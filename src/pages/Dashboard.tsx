import { useState, useEffect } from 'react';
import { Users, UserRound, ClipboardList, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import StatsCard from '../components/ui/StatsCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { Worker, Customer, ServiceRequest, workersApi, customersApi, requestsApi } from '../utils/api';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent data with small page sizes
        const [workersRes, customersRes, requestsRes] = await Promise.all([
          workersApi.getWorkers({ pageSize: 5, pageIndex: 1 }),
          customersApi.getCustomers({ pageSize: 5, pageIndex: 1 }),
          requestsApi.getRequests({ pageSize: 10, pageIndex: 1 }),
        ]);
        
        setWorkers(workersRes.data.data);
        setCustomers(customersRes.data.data);
        setRequests(requestsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Use mock data for demo purposes
        setWorkers(getMockWorkers());
        setCustomers(getMockCustomers());
        setRequests(getMockRequests());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getRequestStatusCounts = () => {
    const statusCounts: Record<string, number> = {};
    
    requests.forEach(request => {
      statusCounts[request.status] = (statusCounts[request.status] || 0) + 1;
    });
    
    return statusCounts;
  };

  const getWorkerRatingDistribution = () => {
    const ratingCounts = [0, 0, 0, 0, 0]; // 5 ratings (1-5)
    
    workers.forEach(worker => {
      const ratingIndex = Math.min(Math.floor(worker.rating), 5) - 1;
      if (ratingIndex >= 0) {
        ratingCounts[ratingIndex]++;
      }
    });
    
    return ratingCounts;
  };

  const requestActivityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Requests',
        data: [30, 40, 35, 50, 45, 60],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Completed Requests',
        data: [25, 35, 30, 45, 40, 55],
        borderColor: '#14b8a6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
      },
    ],
  };

  const workerRatingData = {
    labels: ['★', '★★', '★★★', '★★★★', '★★★★★'],
    datasets: [
      {
        label: 'Workers',
        data: getWorkerRatingDistribution(),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(37, 99, 235, 0.7)',
        ],
      },
    ],
  };

  const requestsByStatusData = {
    labels: Object.keys(getRequestStatusCounts()),
    datasets: [
      {
        label: 'Requests',
        data: Object.values(getRequestStatusCounts()),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Workers"
          value={workers.length || 48}
          icon={<Users size={20} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Customers"
          value={customers.length || 156}
          icon={<UserRound size={20} />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Requests"
          value={requests.filter(r => r.status === 'Pending').length || 24}
          icon={<ClipboardList size={20} />}
          trend={{ value: 5, isPositive: false }}
        />
        <StatsCard
          title="Average Rating"
          value="4.6"
          icon={<Star size={20} />}
          trend={{ value: 0.3, isPositive: true }}
        />
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={requestActivityData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Worker Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={workerRatingData} />
          </CardContent>
        </Card>
      </div>
      
      {/* Request by status */}
      <Card>
        <CardHeader>
          <CardTitle>Requests by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={requestsByStatusData} />
        </CardContent>
      </Card>
      
      {/* Recent requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Worker</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="py-3 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : (
                  (requests.length > 0 ? requests : getMockRequests()).slice(0, 5).map((request, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{request.customerName}</td>
                      <td className="py-3 px-4">{request.workerName}</td>
                      <td className="py-3 px-4">{request.serviceName}</td>
                      <td className="py-3 px-4">{new Date(request.requestDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="py-3 px-4">${request.finalAgreedPrice || request.customerSuggestedPrice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };
  
  return <Badge variant={getVariant() as any}>{status}</Badge>;
};

