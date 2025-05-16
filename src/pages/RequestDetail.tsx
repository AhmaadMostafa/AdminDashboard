import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MessageSquare, DollarSign, User, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { ServiceRequest, requestsApi } from '../utils/api';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequestData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch the request data from the API
        const response = await requestsApi.getRequest(Number(id));
        setRequest(response.data);
        
      } catch (error) {
        console.error('Failed to fetch request data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequestData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-medium mb-2">Request not found</h2>
        <p className="text-gray-500 mb-4">The request you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/requests')}>Back to Requests</Button>
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
          onClick={() => navigate('/requests')}
        >
          Back to Requests
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Request #{request.requestId}</h1>
          <p className="text-gray-500">Service: {request.serviceName}</p>
        </div>
        <StatusBadge status={request.status} className="text-sm px-3 py-1" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Date Requested</p>
                  <p>{format(new Date(request.requestDate), 'MMMM dd, yyyy - h:mm a')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Comments</p>
                  <p>{request.comment}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <User size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Customer</p>
                  <p>{request.customerName}</p>
                  <p className="text-gray-500 text-sm">{request.customerAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Briefcase size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Worker</p>
                  <p>{request.workerName}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Negotiation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="primary" className="mb-2">
                {request.negotiationStatus}
              </Badge>
              <p className="text-sm text-gray-500">
                Negotiation status is {request.negotiationStatus.toLowerCase()}
                {request.negotiationStatus === 'Agreed' ? ' and service is ready to proceed.' : '.'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign size={20} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-700">Customer Suggested Price</p>
                  <p className="text-lg">${request.customerSuggestedPrice}</p>
                </div>
              </div>
              
              {request.workerSuggestedPrice > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign size={20} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Worker Suggested Price</p>
                    <p className="text-lg">${request.workerSuggestedPrice}</p>
                  </div>
                </div>
              )}
              
              {request.finalAgreedPrice > 0 && (
                <div className="flex items-start gap-3">
                  <DollarSign size={20} className="text-success-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-700">Final Agreed Price</p>
                    <p className="text-lg font-medium text-success-700">${request.finalAgreedPrice}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-medium mb-2">Timeline</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Request created</span> on {format(new Date(request.requestDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </li>
                {request.negotiationStatus !== 'Pending' && (
                  <li className="flex items-start">
                    <div className="mr-2 w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Negotiation started</span> on {format(new Date(new Date(request.requestDate).getTime() + 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </li>
                )}
                {request.negotiationStatus === 'Agreed' && (
                  <li className="flex items-start">
                    <div className="mr-2 w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Price agreed</span> on {format(new Date(new Date(request.requestDate).getTime() + 2 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </li>
                )}
                {request.status === 'In Progress' && (
                  <li className="flex items-start">
                    <div className="mr-2 w-2 h-2 rounded-full bg-primary-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Service started</span> on {format(new Date(new Date(request.requestDate).getTime() + 3 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </li>
                )}
                {request.status === 'Completed' && (
                  <>
                    <li className="flex items-start">
                      <div className="mr-2 w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Service started</span> on {format(new Date(new Date(request.requestDate).getTime() + 3 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 w-2 h-2 rounded-full bg-success-500 mt-1.5"></div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Service completed</span> on {format(new Date(new Date(request.requestDate).getTime() + 4 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </li>
                  </>
                )}
                {request.status === 'Rejected' && (
                  <li className="flex items-start">
                    <div className="mr-2 w-2 h-2 rounded-full bg-error-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Request cancelled</span> on {format(new Date(new Date(request.requestDate).getTime() + 2 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const getVariant = () => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };
  
  return <Badge variant={getVariant() as any} className={className}>{status}</Badge>;
};

// Mock data generator function for demo purposes
function getMockRequest(id: number): ServiceRequest {
  const requests = [
    { requestId: 1, workerName: "John Smith", customerName: "Alice Brown", customerAddress: "303 Maple St, Denver", serviceName: "Plumbing", requestDate: "2025-05-04T14:30:00.000Z", comment: "Leaking faucet needs repair", status: "Completed", customerSuggestedPrice: 75, workerSuggestedPrice: 85, finalAgreedPrice: 80, negotiationStatus: "Agreed" },
    { requestId: 2, workerName: "Emily Johnson", customerName: "Robert Lee", customerAddress: "404 Birch St, Seattle", serviceName: "Electrical", requestDate: "2025-05-05T10:15:00.000Z", comment: "Need to install new light fixtures", status: "In Progress", customerSuggestedPrice: 120, workerSuggestedPrice: 150, finalAgreedPrice: 135, negotiationStatus: "Agreed" },
    { requestId: 3, workerName: "Michael Chen", customerName: "Maria Garcia", customerAddress: "505 Spruce St, Miami", serviceName: "Carpentry", requestDate: "2025-05-05T16:45:00.000Z", comment: "Custom bookshelf installation", status: "Pending", customerSuggestedPrice: 200, workerSuggestedPrice: 0, finalAgreedPrice: 0, negotiationStatus: "Pending" },
    { requestId: 4, workerName: "Sarah Wilson", customerName: "James Taylor", customerAddress: "606 Poplar St, Dallas", serviceName: "Painting", requestDate: "2025-05-06T09:00:00.000Z", comment: "Paint living room and hallway", status: "Pending", customerSuggestedPrice: 300, workerSuggestedPrice: 350, finalAgreedPrice: 0, negotiationStatus: "Negotiating" },
    { requestId: 5, workerName: "David Rodriguez", customerName: "Jennifer Kim", customerAddress: "707 Walnut St, Atlanta", serviceName: "Lawn Care", requestDate: "2025-05-03T11:30:00.000Z", comment: "Weekly lawn maintenance needed", status: "Completed", customerSuggestedPrice: 50, workerSuggestedPrice: 60, finalAgreedPrice: 55, negotiationStatus: "Agreed" },
  ];
  
  const request = requests.find(r => r.requestId === id);
  return request || requests[0];
}