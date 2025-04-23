import { Types } from 'mongoose';
import { TModelTimeStamps } from '../../types/model.type';

export interface IGenre extends TModelTimeStamps {
  _id: Types.ObjectId;
  name: string;
  imageUrl: string;
  status: TGenreStatus;
}

export type TGenreStatus = `${EGenreStatus}`;

export enum EGenreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'Inactive',
}
