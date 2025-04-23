import { Types } from 'mongoose';
import { TGender, TModelTimeStamps } from '../../types/model.type';
import { IUser } from '../User/user.interface';

export interface IStudent extends TModelTimeStamps {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  fullName: string;
  roll: number;
  gender: TGender;
  profilePhotoUrl: string;
  department: Types.ObjectId;
  currentSemester: number;
  shift: TShift;
  session: string;
  phoneNumber?: string;
  address?: string;
  reputationIndex: number;
}

export type TShift = `${EShift}`;

export enum EShift {
  MORNING = 'Morning',
  DAY = 'Day',
}
