import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Star } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { Worker, workersApi, QueryParams } from '../utils/api';

const columnHelper = createColumnHelper<Worker>();

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination and filtering
  const [filters, setFilters] = useState<QueryParams>({
    cityId: null,
    serviceId: null,
  });

  useEffect(() => {
    const fetchWorkers = async () => {
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
        
        const response = await workersApi.getWorkers(params);
        setWorkers(response.data.data);
        setTotalCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch workers:', error);
        // Use mock data for demo purposes
        setWorkers(getMockWorkers());
        setTotalCount(48);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkers();
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
      cityId: 0,
      serviceId: 0,
    });
    setSearchTerm('');
    setPageIndex(0);
  };

  const columns = [
    columnHelper.accessor('profilePictureUrl', {
      header: '',
      cell: (info) => (
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img 
            src={info.getValue() || 'https://randomuser.me/api/portraits/men/1.jpg'} 
            alt={`${info.row.original.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://randomuser.me/api/portraits/men/1.jpg';
            }}
          />
        </div>
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <Link 
          to={`/workers/${info.row.original.id}`}
          className="font-medium text-primary-600 hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('serviceName', {
      header: 'Service',
      cell: (info) => (
        <Badge variant="secondary">{info.getValue()}</Badge>
      ),
    }),
    columnHelper.accessor('city', {
      header: 'City',
    }),
    columnHelper.accessor('rating', {
      header: 'Rating',
      cell: (info) => (
        <div className="flex items-center">
          <Star className="w-4 h-4 text-warning-500 mr-1" />
          <span>{info.getValue().toFixed(1)}</span>
        </div>
      ),
    }),
    columnHelper.accessor('completedRequests', {
      header: 'Completed',
    }),
    columnHelper.accessor('minPrice', {
      header: 'Price Range',
      cell: (info) => (
        <span>${info.getValue()} - ${info.row.original.maxPrice}</span>
      ),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Link to={`/workers/${info.getValue()}`}>
          <Button size="sm">View</Button>
        </Link>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold">Workers</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search workers..."
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
                City
              </label>
              <select
                className="form-select"
                value={filters.cityId}
                onChange={(e) => handleFilterChange('cityId', Number(e.target.value))}
              >
                <option value={0}>All Cities</option>
                <option value={1}>New York</option>
                <option value={2}>Los Angeles</option>
                <option value={3}>Chicago</option>
                <option value={4}>Houston</option>
                <option value={5}>Miami</option>
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
      
      {/* Workers table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <DataTable
          columns={columns}
          data={isLoading ? [] : workers}
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
function getMockWorkers(): Worker[] {
  return [
    { id: 1, name: "John Smith", email: "john@example.com", city: "New York", phoneNumber: "555-123-4567", profilePictureUrl: "https://randomuser.me/api/portraits/men/1.jpg", age: 35, address: "123 Main St", serviceName: "Plumbing", rating: 4.8, description: "Professional plumber with over 10 years of experience", minPrice: 50, maxPrice: 150, completedRequests: 48 },
    { id: 2, name: "Emily Johnson", email: "emily@example.com", city: "Chicago", phoneNumber: "555-234-5678", profilePictureUrl: "https://randomuser.me/api/portraits/women/2.jpg", age: 29, address: "456 Oak St", serviceName: "Electrical", rating: 4.9, description: "Licensed electrician specializing in residential properties", minPrice: 60, maxPrice: 180, completedRequests: 36 },
    { id: 3, name: "Michael Chen", email: "michael@example.com", city: "Los Angeles", phoneNumber: "555-345-6789", profilePictureUrl: "https://randomuser.me/api/portraits/men/3.jpg", age: 42, address: "789 Pine St", serviceName: "Carpentry", rating: 4.7, description: "Skilled carpenter for all your woodworking needs", minPrice: 55, maxPrice: 165, completedRequests: 52 },
    { id: 4, name: "Sarah Wilson", email: "sarah@example.com", city: "Boston", phoneNumber: "555-456-7890", profilePictureUrl: "https://randomuser.me/api/portraits/women/4.jpg", age: 31, address: "101 Cedar St", serviceName: "Painting", rating: 4.6, description: "Interior and exterior painting specialist", minPrice: 45, maxPrice: 135, completedRequests: 29 },
    { id: 5, name: "David Rodriguez", email: "david@example.com", city: "Houston", phoneNumber: "555-567-8901", profilePictureUrl: "https://randomuser.me/api/portraits/men/5.jpg", age: 38, address: "202 Elm St", serviceName: "Lawn Care", rating: 4.5, description: "Complete lawn maintenance and landscaping", minPrice: 40, maxPrice: 120, completedRequests: 63 },
    { id: 6, name: "Jennifer Lee", email: "jennifer@example.com", city: "Seattle", phoneNumber: "555-678-9012", profilePictureUrl: "https://randomuser.me/api/portraits/women/6.jpg", age: 33, address: "303 Maple St", serviceName: "Cleaning", rating: 4.7, description: "Thorough residential cleaning services", minPrice: 35, maxPrice: 95, completedRequests: 42 },
    { id: 7, name: "Robert Garcia", email: "robert@example.com", city: "Phoenix", phoneNumber: "555-789-0123", profilePictureUrl: "https://randomuser.me/api/portraits/men/7.jpg", age: 40, address: "404 Birch St", serviceName: "HVAC", rating: 4.8, description: "Heating and cooling system specialist", minPrice: 70, maxPrice: 200, completedRequests: 38 },
    { id: 8, name: "Lisa Wang", email: "lisa@example.com", city: "San Francisco", phoneNumber: "555-890-1234", profilePictureUrl: "https://randomuser.me/api/portraits/women/8.jpg", age: 36, address: "505 Walnut St", serviceName: "Plumbing", rating: 4.6, description: "Specializing in bathroom and kitchen plumbing", minPrice: 55, maxPrice: 160, completedRequests: 27 },
    { id: 9, name: "Kevin Miller", email: "kevin@example.com", city: "Miami", phoneNumber: "555-901-2345", profilePictureUrl: "https://randomuser.me/api/portraits/men/9.jpg", age: 45, address: "606 Pine St", serviceName: "Electrical", rating: 4.9, description: "Master electrician with commercial and residential experience", minPrice: 65, maxPrice: 190, completedRequests: 56 },
    { id: 10, name: "Amanda Taylor", email: "amanda@example.com", city: "Denver", phoneNumber: "555-012-3456", profilePictureUrl: "https://randomuser.me/api/portraits/women/10.jpg", age: 34, address: "707 Oak St", serviceName: "Carpentry", rating: 4.7, description: "Custom furniture and cabinetry specialist", minPrice: 60, maxPrice: 170, completedRequests: 31 }
  ];
}