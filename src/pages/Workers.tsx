import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, Star, Lock, Unlock, RefreshCw } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { Worker, workersApi, QueryParams } from '../utils/api';
import { toast } from 'react-hot-toast';

const columnHelper = createColumnHelper<Worker>();

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Pagination and filtering
  const [filters, setFilters] = useState<QueryParams>({
    cityId: null,
    serviceId: null,
  });

  useEffect(() => {
    fetchWorkers();
  }, [pageIndex, pageSize, searchTerm, filters, refreshKey]);

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
      toast.error('Failed to load workers data');
    } finally {
      setIsLoading(false);
    }
  };

  // Force a refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1); // Reset to first page
  };

  const handleFilterChange = (key: keyof QueryParams, value: number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 0 ? null : value,
    }));
    setPageIndex(1); // Reset to first page
  };

  const resetFilters = () => {
    setFilters({
      cityId: null,
      serviceId: null,
    });
    setSearchTerm('');
    setPageIndex(1); // Reset to first page
  };

  const handleToggleUserLock = async (worker: Worker) => {
    const workerId = worker.id;
    try {
      setProcessingIds(prev => [...prev, workerId]);
      
      await workersApi.toggleUserLock(worker);
      
      toast.success(`User ${worker.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      
      // Force a refresh after a small delay
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error(`Failed to ${worker.isBlocked ? 'unblock' : 'block'} user:`, error);
      toast.error(`Failed to ${worker.isBlocked ? 'unblock' : 'block'} user. Please try again.`);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== workerId));
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const columns = [
    columnHelper.accessor('profilePictureUrl', {
      header: '',
      cell: (info) => {
        const worker = info.row.original;
        const profileUrl = info.getValue();
        const hasValidProfilePic = profileUrl && profileUrl.trim() !== '';
        const nameInitial = getInitials(worker.name);
        
        return (
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            {hasValidProfilePic ? (
              <img 
                src={profileUrl} 
                alt={`${worker.name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // On error, replace with initial
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full bg-primary-500 text-white flex items-center justify-center font-medium text-lg ${hasValidProfilePic ? 'hidden' : ''}`}
            >
              {nameInitial}
            </div>
          </div>
        );
      },
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
      cell: (info) => {
        const serviceName = info.getValue();
        return serviceName ? (
          <Badge variant="secondary">{serviceName}</Badge>
        ) : (
          <span className="text-gray-400">No service</span>
        );
      },
    }),
    columnHelper.accessor('city', {
      header: 'City',
    }),
    columnHelper.accessor('rating', {
      header: 'Rating',
      cell: (info) => {
        const rating = info.getValue();
        return rating === null ? (
          <span className="text-gray-400">No rating</span>
        ) : (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('completedRequests', {
      header: 'Completed',
      cell: (info) => {
        const completedRequests = info.getValue();
        return completedRequests === null ? 0 : completedRequests;
      },
    }),
    columnHelper.accessor('isBlocked', {
      header: () => <div className="text-center w-full">Status</div>,
      cell: (info) => {
        const isBlocked = info.getValue();
        const worker = info.row.original;
        const isProcessing = processingIds.includes(worker.id);

        return (
          <div className="flex flex-col items-center justify-center w-full">
            <div
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {isBlocked ? 'Blocked' : 'Active'}
            </div>

            <Button
              size="sm"
              variant="ghost"
              className={`p-0 mt-1 text-xs font-medium text-center ${
                isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
              }`}
              onClick={() => handleToggleUserLock(worker)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <div className="flex items-center justify-center gap-0.5">
                  {isBlocked ? <Unlock size={12} /> : <Lock size={12} />}
                  <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                </div>
              )}
            </Button>
          </div>
        );
      },
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
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filter
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
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
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={filters.cityId || 0}
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
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={filters.serviceId || 0}
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
                className="w-full md:w-auto"
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
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}