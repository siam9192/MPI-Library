import { model, Schema } from 'mongoose';
import { EEmailVerificationStatus, IEmailVerification } from './emailVerification.interface';

const EmailVerificationModelSchema = new Schema<IEmailVerification>(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      minlength: 6,
      maxlength: 6,
      required: true,
    },
    otpResendCount: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: 'StudentRegistrationRequest',
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EEmailVerificationStatus),
      default: EEmailVerificationStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

const EmailVerification = model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationModelSchema
);

export default EmailVerification;
