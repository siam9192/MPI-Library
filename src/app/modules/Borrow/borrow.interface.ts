import { Types } from 'mongoose';
import { IModelNecessaryFields } from '../../types/model.type';

export interface IBorrow extends IModelNecessaryFields {
  request: Types.ObjectId;
  handedOveredBy: Types.ObjectId;
  collectedBy?: Types.ObjectId;
  book: Types.ObjectId;
  student: Types.ObjectId;
  exceptedReturnDate: Date;
  returnDate?: Date;
  returnCondition?: TReturnCondition;
  status: TBorrowStatus;
}

export type TBorrowStatus = `${EBorrowStatus}`;

export enum EBorrowStatus {
  ONGOING = 'Ongoing',
  OVERDUE = 'Overdue',
  LOST = 'Lost',
  RETURNED = 'Returned',
}

export type TReturnCondition = `${EReturnCondition}`;
export enum EReturnCondition {
  GOOD = 'GOOD',
  DAMAGED = 'DAMAGED',
}
