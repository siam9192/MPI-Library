import { model, now, Schema } from 'mongoose';
import { EBorrowStatus, EReturnCondition, IBorrow } from './borrow.interface';

const BorrowModel = new Schema<IBorrow>(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: true,
    },
    librarian: {
      type: Schema.Types.ObjectId,
      ref: 'Librarian',
      required: true,
    },
    exceptedReturnDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    returnCondition: {
      type: String,
      enum: Object.values(EReturnCondition),
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EBorrowStatus),
    },
  },
  {
    timestamps: true,
  }
);

const Borrow = model<IBorrow>('Borrow', BorrowModel);

export default Borrow;
