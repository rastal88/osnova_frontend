export type Role = 'user' | 'root' | 'moderator';

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}
