import { useState } from 'react';
import { Upload, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authStore } from '@/store/auth.store';
import { api } from '@/lib/axios';

interface ProfilePictureUploadProps {
  currentPhotoUrl?: string;
  onUpdate: () => void;
}

export const ProfilePictureUpload = ({ currentPhotoUrl, onUpdate }: ProfilePictureUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend
      await api.post('/users/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reload user data to get updated photo URL
      await authStore.getState().loadUser();
      onUpdate();
      setPreview(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>Upload a profile picture</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview || currentPhotoUrl} />
            <AvatarFallback>
              {authStore.getState().user?.firstName?.[0]}{authStore.getState().user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
              disabled={uploading}
            />
            <label htmlFor="photo-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              JPG, PNG up to 5MB
            </p>
          </div>
        </div>

        {preview && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <span className="text-sm">Preview ready</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};