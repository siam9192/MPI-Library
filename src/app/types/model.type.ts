import { Types } from 'mongoose';

export type TModelTimeStamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type TGender = `${EGender}`;

export enum EGender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export type TSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface IModelNecessaryFields extends TModelTimeStamps {
  _id: Types.ObjectId;
}
