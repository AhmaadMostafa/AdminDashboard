import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Search, Filter } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import { Customer, customersApi, QueryParams } from '../utils/api';

const columnHelper = createColumnHelper<Customer>();

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination and filtering
  const [filters, setFilters] = useState<QueryParams>({
    cityId: null,
  });

  useEffect(() => {
    const fetchCustomers = async () => {
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
        
        const response = await customersApi.getCustomers(params);
        setCustomers(response.data.data);
        setTotalCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
        // Use mock data for demo purposes
        setCustomers(getMockCustomers());
        setTotalCount(156);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
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
          to={`/customers/${info.row.original.id}`}
          className="font-medium text-primary-600 hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('phoneNumber', {
      header: 'Phone',
    }),
    columnHelper.accessor('city', {
      header: 'City',
    }),
    columnHelper.accessor('requestsCount', {
      header: 'Requests',
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Link to={`/customers/${info.getValue()}`}>
          <Button size="sm">View</Button>
        </Link>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2">
          <UserRound size={24} className="text-primary-500" />
          <h1 className="text-2xl font-bold">Customers</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search customers..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      
      {/* Customers table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <DataTable
          columns={columns}
          data={isLoading ? [] : customers}
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
