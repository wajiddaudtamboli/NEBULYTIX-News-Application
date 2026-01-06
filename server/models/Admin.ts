import mongoose, { Schema, Document } from 'mongoose';

interface IAdmin extends Document {
  clerkId?: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    clerkId: {
      type: String,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    name: {
      type: String,
      default: 'Admin',
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    permissions: {
      type: [String],
      default: ['create', 'edit', 'delete', 'feature', 'trend'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Add index for common queries
adminSchema.index({ email: 1, isActive: 1 });

export default mongoose.model<IAdmin>('Admin', adminSchema);
