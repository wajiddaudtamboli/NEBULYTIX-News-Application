import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'feedback' | 'partnership' | 'other';
  status: 'new' | 'read' | 'replied' | 'archived';
  isImportant: boolean;
  reply?: string;
  repliedAt?: Date;
  repliedBy?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['general', 'support', 'feedback', 'partnership', 'other'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    reply: String,
    repliedAt: Date,
    repliedBy: String,
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Indexes for efficient queries
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ email: 1 });

export default mongoose.model<IEnquiry>('Enquiry', enquirySchema);
