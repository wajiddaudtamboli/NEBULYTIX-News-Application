import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'other';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  folder?: string;
  uploadedBy?: string;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'other'],
      default: 'image',
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    alt: {
      type: String,
      default: '',
    },
    caption: {
      type: String,
      default: '',
    },
    folder: {
      type: String,
      default: 'general',
    },
    uploadedBy: String,
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for searching
mediaSchema.index({ originalName: 'text', alt: 'text', caption: 'text' });
mediaSchema.index({ type: 1, folder: 1 });

export default mongoose.model<IMedia>('Media', mediaSchema);
