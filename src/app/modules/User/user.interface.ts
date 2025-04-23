import { Document, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  role: TUserRole;
  roll?: number;
  email: string;
  password: string;
  lastLoginAt?: Date;
  lastPasswordChangedAt?: Date;
  status: TUserStatus;
  student: Types.ObjectId;
  librarian: Types.ObjectId;
  administrator: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserRole = `${EUserRole}`;

export enum EUserRole {
  STUDENT = 'Student',
  LIBRARIAN = 'Librarian',
  MODERATOR = 'Moderator',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super_Admin',
}

export type TUserStatus = `${EUserStatus}`;
export enum EUserStatus {
  ACTIVE = 'Active',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}
