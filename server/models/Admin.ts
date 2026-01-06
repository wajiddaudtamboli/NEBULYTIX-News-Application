import mongoose, { Schema, Document } from 'mongoose';

interface IAdmin extends Document {
  clerkId: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
  createdAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    name: String,
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    permissions: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', adminSchema);
