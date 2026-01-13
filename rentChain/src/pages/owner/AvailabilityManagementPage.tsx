import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyDetails } from '@/hooks/useProperty';
import { PropertyService } from '@/services/property.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BlockDatesData } from '@/types/property.types';

export const AvailabilityManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id ? parseInt(id) : null;
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyDetails(propertyId);

  const [blockedDates, setBlockedDates] = useState<BlockDatesData[]>([]);
  const [newBlock, setNewBlock] = useState({ startDate: '', endDate: '', reason: '' });
  const [blocking, setBlocking] = useState(false);

  const handleAddBlock = async () => {
    if (!propertyId || !newBlock.startDate || !newBlock.endDate) return;

    setBlocking(true);
    try {
      await PropertyService.blockDates(propertyId, {
        startDate: newBlock.startDate,
        endDate: newBlock.endDate,
        reason: newBlock.reason || undefined,
      });
      setBlockedDates([...blockedDates, newBlock]);
      setNewBlock({ startDate: '', endDate: '', reason: '' });
      toast.success('Dates blocked successfully!');
    } catch (err) {
      console.error('Failed to block dates:', err);
      toast.error('Failed to block dates. Please try again.');
    } finally {
      setBlocking(false);
    }
  };

  const handleRemoveBlock = async (index: number) => {
    if (!propertyId) return;

    const blockToRemove = blockedDates[index];
    setBlocking(true);
    try {
      await PropertyService.unblockDates(propertyId, {
        startDate: blockToRemove.startDate,
        endDate: blockToRemove.endDate,
      });
      setBlockedDates(blockedDates.filter((_, i) => i !== index));
      toast.success('Dates unblocked successfully!');
    } catch (err) {
      console.error('Failed to unblock dates:', err);
      toast.error('Failed to unblock dates. Please try again.');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error || 'Property not found'}</p>
            <Button onClick={() => navigate('/my-listings')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/properties/${propertyId}/edit`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit Property
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Manage Availability</h1>
            <p className="text-muted-foreground">
              Block dates when your property is unavailable
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Dates Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Block Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newBlock.startDate}
                onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newBlock.endDate}
                onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                min={newBlock.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Maintenance, personal use"
                value={newBlock.reason}
                onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
              />
            </div>

            <Button
              onClick={handleAddBlock}
              disabled={!newBlock.startDate || !newBlock.endDate || blocking}
              className="w-full"
            >
              {blocking ? 'Blocking...' : 'Block Dates'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Blocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Blocked Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedDates.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dates blocked</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your property is available for booking
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedDates.map((block, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                      </p>
                      {block.reason && (
                        <p className="text-sm text-muted-foreground">{block.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBlock(index)}
                      disabled={blocking}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Preview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Calendar component would be displayed here
            </p>
            <p className="text-sm">
              Showing availability with blocked dates highlighted
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};