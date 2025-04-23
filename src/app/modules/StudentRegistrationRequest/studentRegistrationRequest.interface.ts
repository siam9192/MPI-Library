import { Types } from 'mongoose';
import { TGender, TModelTimeStamps, TSemester } from '../../types/model.type';
import { TShift } from '../Student/student.interface';
import e from 'express';

export interface IStudentRegistrationRequest extends TModelTimeStamps {
  _id: Types.ObjectId;
  fullName: string;
  gender: TGender;
  roll: number;
  email: string;
  department: string;
  semester: TSemester;
  shift: TShift;
  session: string;
  password: string;
  isVerifiedEmail: boolean;
  expireAt: Date;
  status: TStudentRegistrationRequestStatus;
  reasonForReject?: string;
  index: number;
}

export type TStudentRegistrationRequestStatus = `${EStudentRegistrationRequestStatus}`;

export enum EStudentRegistrationRequestStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  EXPIRED = 'EXPIRED',
}

export interface IRejectStudentRegistrationRequestPayload {
  requestId: string;
  reasonForReject?: string;
}

export interface IStudentRegistrationRequestFilterPayload {
  searchTerm?: string;
}
