import { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { authStore } from '@/store/auth.store';

interface KYCDocumentUploadProps {
  documentType: 'recto' | 'verso';
  currentUrl?: string;
  onUpdate: () => void;
}

export const KYCDocumentUpload = ({ documentType, currentUrl, onUpdate }: KYCDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Please select an image or PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend with specific KYC route
      const uploadUrl = documentType === 'recto' ? '/users/me/kyc-recto' : '/users/me/kyc-verso';
      await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reload user data to get updated document URLs
      await authStore.getState().loadUser();
      onUpdate();
      setUploaded(true);

      setTimeout(() => setUploaded(false), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const title = documentType === 'recto' ? 'ID Card Front' : 'ID Card Back';
  const description = documentType === 'recto'
    ? 'Upload the front side of your ID card'
    : 'Upload the back side of your ID card';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">
                {currentUrl ? 'Document uploaded' : 'No document uploaded'}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUrl ? 'Click to replace' : 'Upload your ID document'}
              </p>
            </div>
          </div>

          <Badge variant={currentUrl ? 'default' : 'secondary'}>
            {currentUrl ? 'Uploaded' : 'Pending'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id={`${documentType}-upload`}
            disabled={uploading}
          />
          <label htmlFor={`${documentType}-upload`}>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : currentUrl ? 'Replace' : 'Upload'}
              </span>
            </Button>
          </label>
        </div>

        {uploaded && (
          <div className="flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Document uploaded successfully</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Accepted formats: JPG, PNG, PDF. Max size: 10MB
        </p>
      </CardContent>
    </Card>
  );
};