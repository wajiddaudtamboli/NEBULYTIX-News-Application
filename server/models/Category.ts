import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  newsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    newsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Generate slug from name before save
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);
