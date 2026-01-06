import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroSlide {
  id: string;
  isActive: boolean;
  heading: string;
  subtext: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  order: number;
}

export interface IIntroSection {
  isActive: boolean;
  title: string;
  description: string;
  imageUrl: string;
}

export interface IVideoSection {
  isActive: boolean;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface IGifSection {
  isActive: boolean;
  description: string;
  gifUrl: string;
}

export interface IBannerSection {
  id: string;
  isActive: boolean;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
}

export interface IHomeContent extends Document {
  heroSlides: IHeroSlide[];
  introSection: IIntroSection;
  videoSection: IVideoSection;
  gifSection: IGifSection;
  bannerSections: IBannerSection[];
  showFeaturedNews: boolean;
  showTrendingStrip: boolean;
  showCategories: boolean;
  showNewsletter: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlide>(
  {
    id: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    heading: { type: String, required: true },
    subtext: { type: String, default: '' },
    buttonText: { type: String, default: 'Read More' },
    buttonLink: { type: String, default: '/' },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const introSectionSchema = new Schema<IIntroSection>(
  {
    isActive: { type: Boolean, default: true },
    title: { type: String, default: 'Welcome to NEBULYTIX News' },
    description: {
      type: String,
      default: 'Your gateway to the latest news in technology, business, science, and more.',
    },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const videoSectionSchema = new Schema<IVideoSection>(
  {
    isActive: { type: Boolean, default: false },
    title: { type: String, default: 'Watch Our Latest' },
    description: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
  },
  { _id: false }
);

const gifSectionSchema = new Schema<IGifSection>(
  {
    isActive: { type: Boolean, default: false },
    description: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
  },
  { _id: false }
);

const bannerSectionSchema = new Schema<IBannerSection>(
  {
    id: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const homeContentSchema = new Schema<IHomeContent>(
  {
    heroSlides: {
      type: [heroSlideSchema],
      default: [
        {
          id: 'slide-1',
          isActive: true,
          heading: 'The Future of News is Here',
          subtext: 'Stay ahead with AI-curated stories from around the globe',
          buttonText: 'Explore Now',
          buttonLink: '/',
          imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920',
          order: 0,
        },
      ],
    },
    introSection: {
      type: introSectionSchema,
      default: () => ({}),
    },
    videoSection: {
      type: videoSectionSchema,
      default: () => ({}),
    },
    gifSection: {
      type: gifSectionSchema,
      default: () => ({}),
    },
    bannerSections: {
      type: [bannerSectionSchema],
      default: [],
    },
    showFeaturedNews: {
      type: Boolean,
      default: true,
    },
    showTrendingStrip: {
      type: Boolean,
      default: true,
    },
    showCategories: {
      type: Boolean,
      default: true,
    },
    showNewsletter: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IHomeContent>('HomeContent', homeContentSchema);
