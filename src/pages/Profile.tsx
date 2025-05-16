import { User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../utils/auth';

export default function Profile() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                {profile.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-600">
                    {profile.displayName.charAt(0)}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-1">{profile.displayName}</h2>
              <p className="text-gray-500 mb-4">Administrator</p>

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                {profile.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span>{profile.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-500" />
                  <span>{profile.cityName}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="text-lg font-medium text-primary-900">Total Earnings</h3>
                <p className="text-2xl font-bold text-primary-700">
                  ${profile.totalEarnings.toFixed(2)}
                </p>
              </div>
              
              <div className="p-4 bg-success-50 rounded-lg">
                <h3 className="text-lg font-medium text-success-900">Total Workers</h3>
                <p className="text-2xl font-bold text-success-700">
                  {profile.totalWorkers}
                </p>
              </div>
              
              <div className="p-4 bg-warning-50 rounded-lg">
                <h3 className="text-lg font-medium text-warning-900">Total Customers</h3>
                <p className="text-2xl font-bold text-warning-700">
                  {profile.totalCustomers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}