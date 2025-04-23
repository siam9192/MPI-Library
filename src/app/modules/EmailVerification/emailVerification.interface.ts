import { Types } from 'mongoose';
import { TModelTimeStamps } from '../../types/model.type';
import { IStudentRegistrationRequest } from '../StudentRegistrationRequest/studentRegistrationRequest.interface';

export interface IEmailVerification extends TModelTimeStamps {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  otpResendCount: number;
  request: Types.ObjectId | IStudentRegistrationRequest;
  expireAt: Date;
  status: TEmailVerificationStatus;
}

export type TEmailVerificationStatus = `${EEmailVerificationStatus}`;

export enum EEmailVerificationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  EXPIRED = 'Expired',
}
