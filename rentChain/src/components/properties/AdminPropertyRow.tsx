// src/components/properties/AdminPropertyRow.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Property } from '@/types/property.types';

interface AdminPropertyRowProps {
  property: Property;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

export const AdminPropertyRow: React.FC<AdminPropertyRowProps> = ({
  property,
  onApprove,
  onReject,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <tr>
      <td className="px-4 py-2">{property.id}</td>
      <td className="px-4 py-2">{property.title}</td>
      <td className="px-4 py-2">{property.ownerId}</td>
      <td className="px-4 py-2">{property.type}</td>
      <td className="px-4 py-2">{getStatusBadge(property.status)}</td>
      <td className="px-4 py-2">
        {new Date(property.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          {property.status === 'PENDING_ADMIN' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(property.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(property.id)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(property.id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
};