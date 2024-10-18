import React, { useState, useEffect } from 'react';
import { UserCircle, Truck, MapPin, Mail, Star } from 'lucide-react';
import Card from '../card';
import { CardContent, CardHeader, CardTitle } from '../cardContent';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found in localStorage');
        }
        
        // Remove quotes if they're present in the userId
        const cleanUserId = userId.replace(/^"|"$/g, '');
        
        const response = await fetch(`http://localhost:3001/api/v2/users/${cleanUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        setUser(userData.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

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
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location: {user.currentLocation.coordinates.join(', ')}</p>
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