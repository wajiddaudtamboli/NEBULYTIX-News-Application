import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  readTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: 'NEBULYTIX Team',
    },
    category: {
      type: String,
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

// Generate slug and calculate read time before save
blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (this.isModified('content')) {
    // Estimate read time (200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

export default mongoose.model<IBlog>('Blog', blogSchema);
