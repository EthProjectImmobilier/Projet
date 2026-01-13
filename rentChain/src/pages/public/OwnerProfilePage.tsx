import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, ArrowLeft, Mail, Phone } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { OwnerPropertyCard } from '@/components/properties/OwnerPropertyCard';
import type { UserProfileResponse } from '@/types/property.types';

export const OwnerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id) : null;
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await UserService.getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { userInfo, properties } = profile;
  const activeProperties = properties.filter(p => p.status === 'ACTIVE');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button asChild variant="outline" className="mb-4">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* User Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 mx-auto md:mx-0">
              <AvatarImage src={userInfo.photoUrl} alt={`${userInfo.firstName} ${userInfo.lastName}`} />
              <AvatarFallback className="text-2xl">
                {userInfo.firstName?.[0]}{userInfo.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userInfo.firstName} {userInfo.lastName}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="capitalize">
                  {userInfo.role === 'ROLE_OWNER' ? 'Host' : userInfo.role === 'ROLE_TENANT' ? 'Guest' : 'Admin'}
                </Badge>
                {userInfo.emailVerified && (
                  <Badge variant="outline" className="text-green-600">
                    ✓ Email Verified
                  </Badge>
                )}
                {userInfo.walletVerified && (
                  <Badge variant="outline" className="text-green-600">
                    ✓ Wallet Verified
                  </Badge>
                )}
              </div>

              {userInfo.description && (
                <p className="text-muted-foreground mb-4">{userInfo.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {userInfo.city && userInfo.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{userInfo.city}, {userInfo.country}</span>
                  </div>
                )}

                {userInfo.dateNaissance && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Born {new Date(userInfo.dateNaissance).toLocaleDateString()}</span>
                  </div>
                )}

                {userInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{userInfo.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{userInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {userInfo.role === 'ROLE_OWNER' ? 'Properties' : 'Booked Properties'} ({activeProperties.length})
        </h2>

        {activeProperties.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {userInfo.role === 'ROLE_OWNER'
                  ? 'This host hasn\'t listed any properties yet.'
                  : 'No active properties found.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProperties.map((property) => (
              <OwnerPropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};