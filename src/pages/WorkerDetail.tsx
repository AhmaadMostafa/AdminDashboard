import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Star, Briefcase, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Worker, ServiceRequest, workersApi, requestsApi } from '../utils/api';

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);

        const customerRes = await workersApi.getWorker(Number(id));
        const requestsRes = await requestsApi.getRequests({
          workerId: Number(id),
          pageSize: 10,
        });

        setWorker(customerRes.data);
        setRequests(requestsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const filteredRequests = statusFilter
    ? requests.filter((r) => r.status === statusFilter)
    : requests;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium mb-2">Worker not found</h2>
        <p className="text-gray-500 mb-4">The worker you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/workers')}>Back to Workers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/workers')}
        >
          Back to Workers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={worker.profilePictureUrl || "https://randomuser.me/api/portraits/men/1.jpg"}
                  alt={worker.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://randomuser.me/api/portraits/men/1.jpg";
                  }}
                />
              </div>

              <h2 className="text-2xl font-bold mb-1">{worker.name}</h2>
              <Badge variant="secondary" className="mb-4">{worker.serviceName}</Badge>

              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(worker.rating) ? "text-warning-500 fill-warning-500" : "text-gray-300"}
                  />
                ))}
                <span className="ml-1 text-gray-700 font-medium">{worker.rating.toFixed(1)}</span>
              </div>

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-500" />
                  <span>{worker.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-500" />
                  <span>{worker.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-500" />
                  <span>{worker.address}, {worker.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-500" />
                  <span>Completed {worker.completedRequests} requests</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-500" />
                  <span>Price range: ${worker.minPrice} - ${worker.maxPrice}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{worker.description}</p>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Recent Requests</h3>

              <div className="flex gap-2 mb-4 flex-wrap">
                {['All', 'Completed', 'In Progress', 'Pending', 'Rejected'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status || (status === 'All' && !statusFilter) ? 'primary' : 'secondary'}
                    onClick={() => setStatusFilter(status === 'All' ? null : status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {filteredRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.requestId} className="border-b">
                          <td className="py-3 px-4">#{request.requestId}</td>
                          <td className="py-3 px-4">{request.customerName}</td>
                          <td className="py-3 px-4">{new Date(request.requestDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="py-3 px-4">
                            ${request.finalAgreedPrice || request.customerSuggestedPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No matching requests.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
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
