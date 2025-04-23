import { startSession } from 'mongoose';
import AppError from '../../Errors/AppError';
import { bcryptCompare, bcryptHash } from '../../helpers/bycryptHelpers';
import httpStatus from '../../shared/http-status';
import StudentRegistrationRequest from '../StudentRegistrationRequest/studentRegistrationRequest.model';
import User from '../User/user.model';
import {
  IChangePasswordPayload,
  ICreateStudentRegistrationRequestPayload,
  IManagementLoginData,
  IStudentLoginData,
  IStudentRegistrationRequestTokenPayload,
} from './auth.interface';
import { generateNumericOTP, objectId } from '../../helpers';
import EmailVerification from '../EmailVerification/emailVerification.model';
import jwtHelpers from '../../helpers/jwtHelpers';
import envConfig from '../../config/env.config';
import { IStudentRegistrationRequest } from '../StudentRegistrationRequest/studentRegistrationRequest.interface';
import { EEmailVerificationStatus } from '../EmailVerification/emailVerification.interface';
import { EUserRole, EUserStatus } from '../User/user.interface';
import { IAuthUser } from '../../types';
import { JwtPayload } from 'jsonwebtoken';
const createStudentRegistrationRequestIntoDB = async (
  payload: ICreateStudentRegistrationRequestPayload
) => {
  // Step 1: Check if the roll number already exists
  const existingUserByRoll = await User.findOne({ roll: payload.roll });
  if (existingUserByRoll) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This student is already registered');
  }

  // Step 2: Check if the email is already used
  const existingUserByEmail = await User.findOne({ email: payload.email });
  if (existingUserByEmail) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This email is already used, try another one');
  }

  // Step 3: Hash password
  const hashedPassword = await bcryptHash(payload.password);

  // Step 4: Calculate expiry dates
  const requestExpireAt = new Date();
  requestExpireAt.setDate(requestExpireAt.getDate() + 7); // 7-day expiry for registration request

  const verificationExpireAt = new Date();
  verificationExpireAt.setMinutes(verificationExpireAt.getMinutes() + 10); // 10-minute expiry for email verification

  // Step 5: Start MongoDB transaction session
  const session = await startSession();
  session.startTransaction();

  try {
    // Step 6: Create the student registration request
    const [createdRequest] = await StudentRegistrationRequest.create(
      [
        {
          fullName: payload.fullName,
          gender: payload.gender,
          roll: payload.roll,
          email: payload.email,
          department: payload.departmentId,
          semester: payload.semester,
          shift: payload.shift,
          session: payload.session,
          password: hashedPassword,
          expireAt: requestExpireAt,
        },
      ],
      { session }
    );

    if (!createdRequest) {
      throw new Error('Failed to create registration request');
    }

    // Step 7: Generate OTP and hash it
    const otp = generateNumericOTP().toString();
    console.log('Generated OTP:', otp); // Only for development — remove in production
    const hashedOtp = await bcryptHash(otp);

    // Step 8: Create email verification entry
    const [createdEmailVerification] = await EmailVerification.create(
      [
        {
          email: payload.email,
          otp: hashedOtp,
          request: createdRequest._id,
          expireAt: verificationExpireAt,
        },
      ],
      { session }
    );

    if (!createdEmailVerification) {
      throw new Error('Failed to create email verification');
    }

    // Step 9: Generate verification token
    const tokenPayload = {
      verificationId: createdEmailVerification._id,
      email: payload.email,
    };

    const token = await jwtHelpers.generateToken(
      tokenPayload,
      envConfig.jwt.registrationVerificationTokenSecret as string,
      envConfig.jwt.refreshTokenExpireTime as string
    );

    // Step 10: Commit the transaction
    await session.commitTransaction();
    await session.endSession();
    return { token };
  } catch (error) {
    // Rollback transaction and throw error
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
  }
};

const resendEmailVerificationOTP = async (token: string) => {
  // Step 1: Decode the JWT token
  let decodedPayload: IStudentRegistrationRequestTokenPayload;
  try {
    decodedPayload = jwtHelpers.verifyToken(
      token,
      envConfig.jwt.registrationVerificationTokenSecret as string
    ) as IStudentRegistrationRequestTokenPayload;

    if (!decodedPayload) throw new Error();
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token');
  }

  // Step 2: Retrieve the verification document and populate the request
  const verification = await EmailVerification.findById(decodedPayload.verificationId).populate(
    'request'
  );

  if (!verification?.request) {
    throw new AppError(httpStatus.NOT_FOUND, 'Request not found');
  }

  // Ensure the type for TypeScript safety
  verification.request = verification.request as IStudentRegistrationRequest;

  // Step 3: Check if already verified
  if (verification.status === EEmailVerificationStatus.VERIFIED) {
    throw new AppError(httpStatus.NOT_FOUND, 'Email is already verified');
  }

  // Step 4: Check if OTP has expired
  if (new Date(verification.expireAt).getTime() < Date.now()) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Your OTP request has expired');
  }

  // Step 5: Check if roll number is already registered
  const existingUserByRoll = await User.findOne({ roll: verification.request.roll });
  if (existingUserByRoll) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This student is already registered');
  }

  // Step 6: Check if email is already used
  const existingUserByEmail = await User.findOne({ email: verification.email });
  if (existingUserByEmail) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This email is already used, try another one');
  }

  // Step:7 Generate new OTP
  const newOtp = generateNumericOTP().toString();
  const hashedOtp = bcryptHash(newOtp);

  // Extend OTP expiration by another 10 minutes
  const newExpireAt = new Date();
  newExpireAt.setMinutes(newExpireAt.getMinutes() + 10);

  // Step:8 Update replace OTP,Expire At in document
  const updateResultStatus = await EmailVerification.updateOne(
    {
      _id: verification._id,
    },
    { otp: hashedOtp, expireAt: newExpireAt }
  );

  if (!updateResultStatus.modifiedCount) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong');
  }

  // Step 9: Reissue  verification token
  const tokenPayload = {
    verificationId: verification._id,
    email: verification.email,
  };

  const newToken = await jwtHelpers.generateToken(
    tokenPayload,
    envConfig.jwt.registrationVerificationTokenSecret as string,
    envConfig.jwt.refreshTokenExpireTime as string
  );

  return {
    token: newToken,
  };
};

const verifyStudentRegistrationRequestUsingOTP = async (payload: {
  token: string;
  otp: string;
}) => {
  // Step 1: Decode the JWT token
  let decodedPayload: IStudentRegistrationRequestTokenPayload;
  try {
    decodedPayload = jwtHelpers.verifyToken(
      payload.token,
      envConfig.jwt.registrationVerificationTokenSecret as string
    ) as IStudentRegistrationRequestTokenPayload;

    if (!decodedPayload) throw new Error();
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token');
  }

  // Step 2: Retrieve the verification document and populate the request
  const verification = await EmailVerification.findById(decodedPayload.verificationId).populate(
    'request'
  );

  if (!verification?.request) {
    throw new AppError(httpStatus.NOT_FOUND, 'Request not found');
  }

  // Ensure the type for TypeScript safety
  verification.request = verification.request as IStudentRegistrationRequest;

  // Step 3: Check if already verified
  if (verification.status === EEmailVerificationStatus.VERIFIED) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Email is already verified');
  }

  // Step 4: Check if OTP has expired
  if (new Date(verification.expireAt).getTime() < Date.now()) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Your OTP request has expired');
  }

  // Step 5: Check if roll number is already registered
  const existingUserByRoll = await User.findOne({ roll: verification.request.roll });
  if (existingUserByRoll) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This student is already registered');
  }

  // Step 6: Check if email is already used
  const existingUserByEmail = await User.findOne({ email: verification.email });
  if (existingUserByEmail) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'This email is already used, try another one');
  }

  // Step 7: Validate OTP
  const isOtpValid = await bcryptCompare(payload.otp, verification.otp);
  if (!isOtpValid) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Wrong OTP!');
  }

  // Step 8: Start database transaction
  const session = await startSession();
  session.startTransaction();

  try {
    // Step 9: Update verification status
    const updateVerificationStatus = await EmailVerification.updateOne(
      { _id: verification._id },
      { status: EEmailVerificationStatus.VERIFIED }
    );

    if (!updateVerificationStatus.modifiedCount) {
      throw new Error('Failed to update verification status');
    }

    // Step 10: Update registration request status
    const updateRequestStatus = await StudentRegistrationRequest.updateOne(
      { _id: verification.request._id },
      { isVerifiedEmail: true }
    );

    if (!updateRequestStatus.modifiedCount) {
      throw new Error('Failed to update request status');
    }

    // Commit transaction
    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Verification process failed');
  }
};

const studentLogin = async (loginData: IStudentLoginData) => {
  // Find the user by roll number and ensure the role is STUDENT
  const user = await User.findOne({
    roll: loginData.roll,
    role: EUserRole.STUDENT,
  });

  // Throw an error if the user is not found
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Account not found');
  }

  // Check if the account is blocked
  if (user.status === EUserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied: account is blocked');
  }

  // Compare the provided password with the stored hashed password
  const isMatchPassword = await bcryptCompare(loginData.password, user.password);
  if (!isMatchPassword) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wrong password!');
  }

  // Prepare the token payload
  const tokenPayload = {
    userId: user._id,
    profileId: user.student,
    role: user.role,
  };

  // Generate access token
  const accessToken = await jwtHelpers.generateToken(
    tokenPayload,
    envConfig.jwt.accessTokenSecret as string,
    envConfig.jwt.accessTokenExpireTime as string
  );

  // Generate refresh token
  const refreshToken = await jwtHelpers.generateToken(
    tokenPayload,
    envConfig.jwt.refreshTokenSecret as string,
    envConfig.jwt.refreshTokenExpireTime as string
  );

  // Return the tokens
  return {
    accessToken,
    refreshToken,
  };
};

const managementLogin = async (loginData: IManagementLoginData) => {
  // Find the user by email and ensure the role is not STUDENT
  const user = await User.findOne({
    email: loginData.email,
    role: {
      $not: EUserRole.STUDENT,
    },
  });

  // Throw an error if the user is not found
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Account not found');
  }

  // Check if the account is blocked
  if (user.status === EUserStatus.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, 'Access denied: account is blocked');
  }

  // Compare the provided password with the stored hashed password
  const isMatchPassword = await bcryptCompare(loginData.password, user.password);

  if (!isMatchPassword) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wrong password!');
  }

  // Prepare the token payload
  const tokenPayload = {
    userId: user._id,
    profileId: (user as any)[user.role.toLocaleLowerCase()],
    role: user.role,
  };

  // Generate access token
  const accessToken = await jwtHelpers.generateToken(
    tokenPayload,
    envConfig.jwt.accessTokenSecret as string,
    envConfig.jwt.accessTokenExpireTime as string
  );

  // Generate refresh token
  const refreshToken = await jwtHelpers.generateToken(
    tokenPayload,
    envConfig.jwt.refreshTokenSecret as string,
    envConfig.jwt.refreshTokenExpireTime as string
  );

  // Return the tokens
  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (authUser: IAuthUser, payload: IChangePasswordPayload) => {
  // Step 1: Find the user by ID and include the password field
  const user = await User.findById(authUser.userId, { password: true });

  // Step 2: Check if user exists
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found.');
  }

  // Step 3: Compare old password
  const isPasswordMatch = await bcryptCompare(payload.oldPassword, user.password);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Incorrect current password.');
  }

  // Step 4: Hash the new password
  const newHashedPassword = await bcryptHash(payload.newPassword);

  // Step 5: Update the password
  const updateResult = await User.updateOne(
    { _id: objectId(authUser.userId) },
    { password: newHashedPassword }
  );

  if (!updateResult.modifiedCount) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update password.');
  }

  // Step 6: Return success (can be null or a success message)
  return null;
};

const getNewAccessToken = async (refreshToken: string) => {
  try {
    // Step 1: Ensure refresh token exists
    if (!refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token is required.');
    }

    // Step 2: Verify and decode the token
    const decoded = jwtHelpers.verifyToken(
      refreshToken,
      envConfig.jwt.refreshTokenSecret as string
    ) as JwtPayload & IAuthUser;

    if (!decoded || !decoded.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token.');
    }

    // Step 3: Create a new access token
    const newAccessToken = await jwtHelpers.generateToken(
      {
        userId: decoded.userId,
        profileId: decoded.profileId,
        role: decoded.role,
      },
      envConfig.jwt.accessTokenSecret as string,
      envConfig.jwt.accessTokenExpireTime as string
    );

    // Step 4: Return both tokens
    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired refresh token.');
  }
};

const AuthServices = {
  createStudentRegistrationRequestIntoDB,
  resendEmailVerificationOTP,
  verifyStudentRegistrationRequestUsingOTP,
  studentLogin,
  managementLogin,
  changePassword,
  getNewAccessToken,
};

export default AuthServices;
