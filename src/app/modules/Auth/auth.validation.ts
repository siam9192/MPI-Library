import { z } from 'zod';
import { EGender } from '../../types/model.type';
import { EShift } from '../Student/student.interface';

const CreateStudentAccountRequestValidation = z.object({
  fullName: z
    .string()
    .min(3, { message: 'Full name must be at least 3 characters long' })
    .max(30, { message: 'Full name must be at most 30 characters long' }),
  gender: z.nativeEnum(EGender),
  roll: z.number().min(1, { message: 'Roll must be a positive number and at least 1' }),
  email: z.string().email({ message: 'Invalid email address' }).max(100, 'Email is too long'),
  departmentId: z.string().nonempty('Department is required'),
  semester: z.number({ invalid_type_error: 'Invalid semester' }).int().min(1).max(8),
  shift: z.nativeEnum(EShift),
  session: z
    .string()
    .regex(/^\d{4}-\d{4}$/, {
      message: 'Session must be in the format YYYY-YYYY',
    })
    .refine(
      (val) => {
        const [start, end] = val.split('-').map(Number);
        return end === start + 1;
      },
      {
        message: 'The second year in session must be one greater than the first year',
      }
    ),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must be at least 6 characters and Maximum 32 characters longs' }),
});

const VerifyStudentRegistrationRequestUsingOTPValidation = z.object({
  token: z.string({ message: 'Token must be string type ' }).nonempty('Token is required'),
  otp: z.string({ message: 'OTP must be string type' }).length(6, 'OTP length is must be 6 '),
});

const StudentLoginValidation = z.object({
  email: z.string().email({ message: 'Invalid email address' }).max(100, 'Email is too long'),
  password: z.string().nonempty('Password is required'),
});

const ManagementLoginValidation = z.object({
  email: z.number().min(1, { message: 'Roll must be a positive number and at least 1' }),
  password: z.string().nonempty('Password is required'),
});

const ChangePasswordValidation = z.object({
  oldPassword: z.string().nonempty('Old password is required'),
  newPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must be at least 6 characters and Maximum 32 characters longs' }),
});

const AuthValidations = {
  CreateStudentAccountRequestValidation,
  StudentLoginValidation,
  ManagementLoginValidation,
  VerifyStudentRegistrationRequestUsingOTPValidation,
  ChangePasswordValidation,
};

export default AuthValidations;
