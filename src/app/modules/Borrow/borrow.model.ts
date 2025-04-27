import { model, now, Schema } from 'mongoose';
import { EBorrowStatus, EReturnCondition, IBorrow } from './borrow.interface';

const BorrowModel = new Schema<IBorrow>(
  {
    request: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Librarian',
      required: true,
    },
    handedOveredBy: {
      type: Schema.Types.ObjectId,
      ref: 'Librarian',

      required: true,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Librarian',
      default: null,
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
