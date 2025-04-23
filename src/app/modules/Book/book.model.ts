import { model, Schema } from 'mongoose';
import { EBookStatus, IBook } from './book.interface';

const BookModelSchema = new Schema<IBook>(
  {
    name: {
      type: String,
      minlength: 3,
      maxlength: 20,
      required: true,
    },
    coverPhotoUrl: {
      type: String,
      required: true,
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: 'Genre',
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    availableCopies: {
      type: Number,
      min: 0,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(EBookStatus),
      default: EBookStatus.AVAILABLE,
    },
    exceptedAvailableDate: {
      type: Date,
      default: false,
    },
    index: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Book = model<IBook>('Book', BookModelSchema);

export default Book;
