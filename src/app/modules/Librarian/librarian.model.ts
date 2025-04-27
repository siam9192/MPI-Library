import { model, Schema } from 'mongoose';
import { EGender } from '../../types/model.type';
import { ILibrarian } from './librarian.interface';

export const ContactSchema = new Schema({
  emailAddress: {
    type: String,
    minLength: 3,
    maxLength: 3,
    default: null,
  },
  phoneNumber: {
    type: String,
    minLength: 3,
    maxLength: 11,
    default: null,
  },
});

const LibrarianModelSchema = new Schema<ILibrarian>(
  {
    fullName: {
      type: String,
      minlength: 3,
      maxlength: 30,
      required: true,
      trim: true,
    },
    profilePhotoUrl: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(EGender),
      required: true,
    },

    about: {
      type: String,
      minlength: 20,
      maxlength: 1000,
      default: null,
    },
    contact: ContactSchema,
  },
  {
    timestamps: true,
  }
);

const Librarian = model<ILibrarian>('Librarian', LibrarianModelSchema);

export default Librarian;
