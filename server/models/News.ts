import mongoose, { Schema, Document } from 'mongoose';

interface INews extends Document {
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: Date;
  coverImage: string;
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Business', 'Science', 'World', 'Health'],
      index: true,
    },
    source: String,
    publishedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Compound indexes for common queries
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ isFeatured: 1, publishedAt: -1 });
newsSchema.index({ isTrending: 1, views: -1 });
newsSchema.index({ publishedAt: -1, views: -1 });

// Text index for search
newsSchema.index({ title: 'text', summary: 'text', tags: 'text' });

export default mongoose.model<INews>('News', newsSchema);
