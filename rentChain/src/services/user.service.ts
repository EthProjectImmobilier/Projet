// src/services/user.service.ts

import { api } from '@/lib/axios';
import type { UserProfileResponse } from '@/types/property.types';

export class UserService {
  static async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const response = await api.get(`/users/${userId}/full`);
    return response.data;
  }
}