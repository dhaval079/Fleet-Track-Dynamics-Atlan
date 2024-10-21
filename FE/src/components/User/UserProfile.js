import React from 'react';
import { UserCircle, Truck, MapPin, Mail, Star } from 'lucide-react';
import Card from '../card';
import { CardContent, CardHeader, CardTitle } from '../cardContent';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found. Please log in.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="w-8 h-8 mr-2" />
            {user.username}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> {user.email}</p>
            <p className="flex items-center"><Star className="w-4 h-4 mr-2" /> Role: {user.role}</p>
            {user.role === 'driver' && (
              <>
                <p className="flex items-center"><Truck className="w-4 h-4 mr-2" /> License: {user.licenseNumber}</p>
                <p className="flex items-center"><Star className="w-4 h-4 mr-2" /> Experience: {user.experienceYears} years</p>
                {user.currentLocation && (
                  <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location: {user.currentLocation.coordinates.join(', ')}</p>
                )}
                <p className="flex items-center"><Star className="w-4 h-4 mr-2" /> Available: {user.isAvailable ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;