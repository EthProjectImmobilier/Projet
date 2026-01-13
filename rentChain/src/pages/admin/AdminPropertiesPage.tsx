import React, { useState, useMemo } from 'react';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Calendar,
  Building2,
  Home,
  Castle,
  Warehouse,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AdminProperty } from '@/types/property.types';

// Simple date formatting utility
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Property type icons
const getPropertyTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'APARTMENT': return <Building2 className="w-4 h-4" />;
    case 'HOUSE': return <Home className="w-4 h-4" />;
    case 'CASTLE': return <Castle className="w-4 h-4" />;
    case 'LOFT': return <Warehouse className="w-4 h-4" />;
    default: return <Home className="w-4 h-4" />;
  }
};

export const AdminPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    property: AdminProperty | null;
    reason?: string;
  }>({
    open: false,
    type: null,
    property: null,
  });

  // Extract unique values for filters
  const uniqueCountries = useMemo(() => {
    const countries = [...new Set(properties.map(p => p.address.country))];
    return countries.sort();
  }, [properties]);

  const uniqueCities = useMemo(() => {
    const cities = [...new Set(properties.map(p => p.address.city))];
    return cities.sort();
  }, [properties]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(properties.map(p => p.type))];
    return types.sort();
  }, [properties]);

  const fetchProperties = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await PropertyService.adminList(pageNum, 20);
      setProperties(response.content as unknown as AdminProperty[]);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProperties();
  }, []);

  // Filtered properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = !searchQuery ||
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.ownerFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.ownerLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.country.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesCountry = countryFilter === 'all' || property.address.country === countryFilter;
      const matchesCity = cityFilter === 'all' || property.address.city === cityFilter;
      const matchesType = typeFilter === 'all' || property.type === typeFilter;

      return matchesSearch && matchesStatus && matchesCountry && matchesCity && matchesType;
    });
  }, [properties, searchQuery, statusFilter, countryFilter, cityFilter, typeFilter]);

  const handleApprove = async (property: AdminProperty) => {
    try {
      await PropertyService.adminApprove(property.id);
      toast.success('Property approved successfully!');
      fetchProperties(page);
      setActionDialog({ open: false, type: null, property: null });
    } catch (err) {
      console.error('Failed to approve property:', err);
      toast.error('Failed to approve property');
    }
  };

  const handleViewOwnershipDocument = (documentUrl: string) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('No ownership document available');
    }
  };

  const handleReject = async (property: AdminProperty, reason: string) => {
    try {
      await PropertyService.adminReject(property.id, reason);
      toast.success('Property rejected successfully!');
      fetchProperties(page);
      setActionDialog({ open: false, type: null, property: null, reason: '' });
    } catch (err) {
      console.error('Failed to reject property:', err);
      toast.error('Failed to reject property');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING_ADMIN': return 'secondary';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'PENDING_ADMIN': return 'Pending Review';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = properties.length;
    const active = properties.filter(p => p.status === 'ACTIVE').length;
    const pending = properties.filter(p => p.status === 'PENDING_ADMIN').length;
    const rejected = properties.filter(p => p.status === 'REJECTED').length;

    return { total, active, pending, rejected };
  }, [properties]);

  if (loading && properties.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => fetchProperties()} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Management</h1>
          <p className="text-muted-foreground">Review and manage all property submissions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search properties, owners, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING_ADMIN">Pending Review</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {property.images && property.images.length > 0 && (
                            <img
                              src={property.images[0].imageUrl}
                              alt={property.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {getPropertyTypeIcon(property.type)}
                              {property.title}
                            </div>
                            <div className="text-sm text-muted-foreground">{property.type}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={property.ownerProfilePicture} />
                            <AvatarFallback>
                              {property.ownerFirstName[0]}{property.ownerLastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {property.ownerFirstName} {property.ownerLastName}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {property.ownerWalletAddress.slice(0, 6)}...{property.ownerWalletAddress.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{property.address.city}</div>
                            <div className="text-xs text-muted-foreground">{property.address.country}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {property.maxGuests}
                            </div>
                            <div className="flex items-center gap-1">
                              <Bed className="w-3 h-3" />
                              {property.bedrooms}
                            </div>
                            <div className="flex items-center gap-1">
                              <Bath className="w-3 h-3" />
                              {property.bathrooms}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min stay: {property.minStayNights} nights
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">${property.pricePerNight.toFixed(2)}</div>
                          {property.securityDeposit > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Deposit: ${property.securityDeposit.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(property.status)}>
                          {getStatusDisplayName(property.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {property.averageRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({property.totalReviews})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No reviews</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {formatDate(property.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/properties/${property.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {property.ownershipDocumentUrl && (
                              <DropdownMenuItem onClick={() => handleViewOwnershipDocument(property.ownershipDocumentUrl!)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Ownership Document
                              </DropdownMenuItem>
                            )}
                            {property.status === 'PENDING_ADMIN' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApprove(property)}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setActionDialog({
                                    open: true,
                                    type: 'reject',
                                    property,
                                  })}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {page * 20 + 1} to {Math.min((page + 1) * 20, totalElements)} of {totalElements} properties
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProperties(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProperties(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      <AlertDialog
        open={actionDialog.open && actionDialog.type === 'reject'}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, property: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this property. The owner will see this feedback.
              {actionDialog.property && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{actionDialog.property.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {actionDialog.property.ownerFirstName} {actionDialog.property.ownerLastName} • {actionDialog.property.address.city}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Rejection Reason</label>
            <Input
              placeholder="e.g., Property images are unclear, description is incomplete..."
              value={actionDialog.reason || ''}
              onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionDialog.property && actionDialog.reason) {
                  handleReject(actionDialog.property, actionDialog.reason);
                }
              }}
              disabled={!actionDialog.reason || !actionDialog.property}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};