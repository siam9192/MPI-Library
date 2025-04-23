import { model, Schema, Types } from 'mongoose';
import { EDepartmentStatus, IDepartment } from './department.interface';

const DepartmentModelSchema = new Schema<IDepartment>(
  {
    _id: Types.ObjectId,
    name: {
      type: String,
      minlength: 1,
      maxlength: 30,
      required: true,
    },
    shortName: {
      type: String,
      minlength: 1,
      maxlength: 10,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EDepartmentStatus),
      default: EDepartmentStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

const Department = model<IDepartment>('Department', DepartmentModelSchema);
export default Department;
