import { model, Schema } from 'mongoose';
import { EUserRole, EUserStatus, IUser } from './user.interface';

const UserModelSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      minlength: 3,
      maxlength: 100,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: 0,
      required: true,
    },
    roll: {
      type: Number,
      min: 1000,
      default: null,
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(EUserRole),
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastPasswordChangedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(EUserStatus),
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    librarian: {
      type: Schema.Types.ObjectId,
      ref: 'Librarian',
      default: null,
    },
    administrator: {
      type: Schema.Types.ObjectId,
      ref: 'Administrator',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>('User', UserModelSchema);

export default User;
