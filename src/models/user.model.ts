/**
 * User Model
 * Interfaces and types for user-related data
 */

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  token: string;
  expiresIn: number;
  refreshToken?: string;
}
