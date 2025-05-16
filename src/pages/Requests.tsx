import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { ServiceRequest, requestsApi, QueryParams } from '../utils/api';

const columnHelper = createColumnHelper<ServiceRequest>();

export default function Requests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination and filtering
  const [filters, setFilters] = useState<QueryParams>({
    status: null,
    serviceId: null,
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const params: QueryParams = {
          pageIndex,
          pageSize,
          ...filters,
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        const response = await requestsApi.getRequests(params);
        setRequests(response.data.data);
        setTotalCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        // Use mock data for demo purposes
        setRequests(getMockRequests());
        setTotalCount(87);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [pageIndex, pageSize, searchTerm, filters]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(0);
  };

  const handleFilterChange = (key: keyof QueryParams, value: number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPageIndex(0);
  };

  const resetFilters = () => {
    setFilters({
      status: 0,
      serviceId: 0,
    });
    setSearchTerm('');
    setPageIndex(0);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getNegotiationStatusVariant = (status: string) => {
    switch (status) {
      case 'Agreed': return 'success';
      case 'Negotiating': return 'warning';
      case 'Pending': return 'primary';
      case 'Rejected': return 'error';
      default: return 'secondary';
    }
  };

  const columns = [
    columnHelper.accessor('requestId', {
      header: 'ID',
      cell: (info) => (
        <Link 
          to={`/requests/${info.getValue()}`}
          className="font-medium text-primary-600 hover:underline"
        >
          #{info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('customerName', {
      header: 'Customer',
    }),
    columnHelper.accessor('workerName', {
      header: 'Worker',
    }),
    columnHelper.accessor('serviceName', {
      header: 'Service',
      cell: (info) => (
        <Badge variant="secondary">{info.getValue()}</Badge>
      ),
    }),
    columnHelper.accessor('requestDate', {
      header: 'Date',
      cell: (info) => format(new Date(info.getValue()), 'MMM dd, yyyy'),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={getStatusVariant(info.getValue()) as any}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('finalAgreedPrice', {
      header: 'Price',
      cell: (info) => {
        const { finalAgreedPrice, customerSuggestedPrice, workerSuggestedPrice, negotiationStatus } = info.row.original;
        
        if (finalAgreedPrice > 0) {
          return <span className="font-medium">${finalAgreedPrice}</span>;
        }
        
        if (negotiationStatus === 'Negotiating') {
          return (
            <div className="text-xs">
              <div>Customer: ${customerSuggestedPrice}</div>
              <div>Worker: ${workerSuggestedPrice}</div>
            </div>
          );
        }
        
        return <span>${customerSuggestedPrice}</span>;
      },
    }),
    columnHelper.accessor('negotiationStatus', {
      header: 'Negotiation',
      cell: (info) => (
        <Badge variant={getNegotiationStatusVariant(info.getValue()) as any}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('requestId', {
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <Link to={`/requests/${info.getValue()}`}>
          <Button size="sm">View</Button>
        </Link>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold">Service Requests</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 py-2 pr-3 text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-primary-500"
            />
          </form>
          
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', Number(e.target.value))}
              >
                <option value={0}>All Statuses</option>
                <option value={1}>Pending</option>
                <option value={2}>In Progress</option>
                <option value={3}>Completed</option>
                <option value={4}>Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select
                className="form-select"
                value={filters.serviceId}
                onChange={(e) => handleFilterChange('serviceId', Number(e.target.value))}
              >
                <option value={0}>All Services</option>
                <option value={1}>Plumbing</option>
                <option value={2}>Electrical</option>
                <option value={3}>Carpentry</option>
                <option value={4}>Painting</option>
                <option value={5}>Lawn Care</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Requests table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <DataTable
          columns={columns}
          data={isLoading ? [] : requests}
          pageCount={Math.ceil(totalCount / pageSize)}
          onPaginationChange={handlePaginationChange}
        />
      </div>
      
      {isLoading && (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

// Mock data generator function for demo purposes
function getMockRequests(): ServiceRequest[] {
  return [
    { requestId: 1, workerName: "John Smith", customerName: "Alice Brown", customerAddress: "303 Maple St, Denver", serviceName: "Plumbing", requestDate: "2025-05-04T14:30:00.000Z", comment: "Leaking faucet needs repair", status: "Completed", customerSuggestedPrice: 75, workerSuggestedPrice: 85, finalAgreedPrice: 80, negotiationStatus: "Agreed" },
    { requestId: 2, workerName: "Emily Johnson", customerName: "Robert Lee", customerAddress: "404 Birch St, Seattle", serviceName: "Electrical", requestDate: "2025-05-05T10:15:00.000Z", comment: "Need to install new light fixtures", status: "In Progress", customerSuggestedPrice: 120, workerSuggestedPrice: 150, finalAgreedPrice: 135, negotiationStatus: "Agreed" },
    { requestId: 3, workerName: "Michael Chen", customerName: "Maria Garcia", customerAddress: "505 Spruce St, Miami", serviceName: "Carpentry", requestDate: "2025-05-05T16:45:00.000Z", comment: "Custom bookshelf installation", status: "Pending", customerSuggestedPrice: 200, workerSuggestedPrice: 0, finalAgreedPrice: 0, negotiationStatus: "Pending" },
    { requestId: 4, workerName: "Sarah Wilson", customerName: "James Taylor", customerAddress: "606 Poplar St, Dallas", serviceName: "Painting", requestDate: "2025-05-06T09:00:00.000Z", comment: "Paint living room and hallway", status: "Pending", customerSuggestedPrice: 300, workerSuggestedPrice: 350, finalAgreedPrice: 0, negotiationStatus: "Negotiating" },
    { requestId: 5, workerName: "David Rodriguez", customerName: "Jennifer Kim", customerAddress: "707 Walnut St, Atlanta", serviceName: "Lawn Care", requestDate: "2025-05-03T11:30:00.000Z", comment: "Weekly lawn maintenance needed", status: "Completed", customerSuggestedPrice: 50, workerSuggestedPrice: 60, finalAgreedPrice: 55, negotiationStatus: "Agreed" },
    { requestId: 6, workerName: "Jennifer Lee", customerName: "Thomas Wilson", customerAddress: "808 Cedar St, Chicago", serviceName: "Cleaning", requestDate: "2025-05-02T13:00:00.000Z", comment: "Deep clean of entire house", status: "Completed", customerSuggestedPrice: 120, workerSuggestedPrice: 150, finalAgreedPrice: 135, negotiationStatus: "Agreed" },
    { requestId: 7, workerName: "Robert Garcia", customerName: "Jessica Martinez", customerAddress: "909 Pine St, Phoenix", serviceName: "HVAC", requestDate: "2025-05-07T15:30:00.000Z", comment: "AC not cooling properly", status: "Pending", customerSuggestedPrice: 80, workerSuggestedPrice: 100, finalAgreedPrice: 0, negotiationStatus: "Negotiating" },
    { requestId: 8, workerName: "Lisa Wang", customerName: "Daniel Anderson", customerAddress: "1010 Oak St, Houston", serviceName: "Plumbing", requestDate: "2025-05-04T09:45:00.000Z", comment: "Clogged drain in bathroom", status: "Cancelled", customerSuggestedPrice: 60, workerSuggestedPrice: 0, finalAgreedPrice: 0, negotiationStatus: "Rejected" },
    { requestId: 9, workerName: "Kevin Miller", customerName: "Sophia Thompson", customerAddress: "1111 Maple St, Boston", serviceName: "Electrical", requestDate: "2025-05-06T14:00:00.000Z", comment: "Outlet not working in kitchen", status: "In Progress", customerSuggestedPrice: 70, workerSuggestedPrice: 85, finalAgreedPrice: 75, negotiationStatus: "Agreed" },
    { requestId: 10, workerName: "Amanda Taylor", customerName: "William Davis", customerAddress: "1212 Elm St, San Francisco", serviceName: "Carpentry", requestDate: "2025-05-03T10:00:00.000Z", comment: "Repair broken cabinet door", status: "Completed", customerSuggestedPrice: 90, workerSuggestedPrice: 100, finalAgreedPrice: 95, negotiationStatus: "Agreed" }
  ];
}