import { Types } from 'mongoose';
import { TModelTimeStamps } from '../../types/model.type';

export interface IBook extends TModelTimeStamps {
  _id: Types.ObjectId;
  name: string;
  coverPhotoUrl: string;
  genre: Types.ObjectId;
  authorId: Types.ObjectId;
  availableCopies: number;
  rating: number;
  reviewCount: number;
  exceptedAvailableDate?: Date;
  status: TBookStatus;
  index: number;
}

type TBookStatus = `${EBookStatus}`;

export enum EBookStatus {
  AVAILABLE = 'Available',
  UNAVAILABLE = 'Unavailable',
  PAUSED = 'Paused',
  DELETED = 'Deleted',
}
