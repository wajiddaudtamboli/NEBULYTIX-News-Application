import mongoose, { Schema, Document } from 'mongoose';

export interface IPageSection {
  id: string;
  type: 'hero' | 'text' | 'image' | 'video' | 'gallery' | 'cta' | 'features' | 'stats';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
  settings?: Record<string, any>;
}

export interface IPage extends Document {
  title: string;
  slug: string;
  description?: string;
  sections: IPageSection[];
  isPublished: boolean;
  isSystemPage: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pageSectionSchema = new Schema<IPageSection>(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['hero', 'text', 'image', 'video', 'gallery', 'cta', 'features', 'stats'],
      required: true,
    },
    title: String,
    subtitle: String,
    content: String,
    imageUrl: String,
    videoUrl: String,
    buttonText: String,
    buttonLink: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const pageSchema = new Schema<IPage>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    sections: [pageSectionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isSystemPage: {
      type: Boolean,
      default: false,
    },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

export default mongoose.model<IPage>('Page', pageSchema);
