import { model, Schema } from 'mongoose';
import {
  EStudentRegistrationRequestStatus,
  IStudentRegistrationRequest,
} from './studentRegistrationRequest.interface';
import { EGender } from '../../types/model.type';
import { EShift } from '../Student/student.interface';

const StudentRegistrationRequestModelSchema = new Schema<IStudentRegistrationRequest>(
  {
    fullName: {
      type: String,
      minlength: 3,
      maxlength: 30,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(EGender),
      required: true,
    },

    roll: {
      type: Number,
      required: true,
      min: 0,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      required: true,
    },
    shift: {
      type: String,
      enum: Object.values(EShift),
      required: true,
    },
    session: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          const match = v.match(/^(\d{4})-(\d{4})$/);
          if (!match) return false;
          const start = parseInt(match[1], 10);
          const end = parseInt(match[2], 10);

          return end === start + 1;
        },
        message: (props) => `${props.value} is not a valid session!`,
      },
    },
    password: {
      type: String,
      minlength: 1,
      required: true,
    },
    isVerifiedEmail: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EStudentRegistrationRequestStatus),
      default: EStudentRegistrationRequestStatus.PENDING,
    },
    reasonForReject: {
      type: String,
      minlength: 1,
      default: null,
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

const StudentRegistrationRequest = model<IStudentRegistrationRequest>(
  'StudentRegistrationRequest',
  StudentRegistrationRequestModelSchema
);

export default StudentRegistrationRequest;
