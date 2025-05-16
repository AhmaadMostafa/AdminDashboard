import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Customer, ServiceRequest, customersApi, requestsApi } from '../utils/api';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);

        const customerRes = await customersApi.getCustomer(Number(id));
        const requestsRes = await requestsApi.getRequests({
          customerId: Number(id),
          pageSize: 10,
        });

        setCustomer(customerRes.data);
        setRequests(requestsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch customer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium mb-2">Customer not found</h2>
        <p className="text-gray-500 mb-4">The customer doesn't exist or was removed.</p>
        <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
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
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={customer.profilePictureUrl || 'https://randomuser.me/api/portraits/men/1.jpg'}
                  alt={customer.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold mb-1">{customer.name}</h2>
              <Badge variant="primary" className="mb-4">Customer</Badge>

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-500" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-500" />
                  <span>{customer.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-500" />
                  <span>{customer.address}, {customer.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-500" />
                  <span>Age: {customer.age}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-gray-700">
                Total requests: <span className="font-medium">{customer.requestsCount}</span>
              </p>
            </div>

            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Worker</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.requestId} className="border-b">
                        <td className="py-3 px-4">#{request.requestId}</td>
                        <td className="py-3 px-4">{request.workerName}</td>
                        <td className="py-3 px-4">{request.serviceName}</td>
                        <td className="py-3 px-4">{new Date(request.requestDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="py-3 px-4">${request.finalAgreedPrice || request.customerSuggestedPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No service history available.</p>
            )}
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

  return <Badge variant={getVariant()}>{status}</Badge>;
};
