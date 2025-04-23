import { Types } from 'mongoose';
import { TGender, TModelTimeStamps } from '../../types/model.type';

export interface ILibrarian extends TModelTimeStamps {
  _id: Types.ObjectId;
  userId: string;
  fullName: string;
  gender: TGender;
  profilePhotoUrl: string;
  about: string;
  contact: Contact;
}

type Contact = {
  emailAddress: string;
  phoneNumber: string;
};
