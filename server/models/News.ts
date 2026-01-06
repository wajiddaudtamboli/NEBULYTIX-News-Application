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
    },
    tags: [String],
  },
  { timestamps: true }
);

export default mongoose.model<INews>('News', newsSchema);
