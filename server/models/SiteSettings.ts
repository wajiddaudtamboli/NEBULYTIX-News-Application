import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

export interface IContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface ISiteSettings extends Document {
  siteName: string;
  siteTagline: string;
  logoUrl: string;
  faviconUrl?: string;
  footerText: string;
  copyrightText: string;
  socialLinks: ISocialLinks;
  contactInfo: IContactInfo;
  enableNewsletter: boolean;
  newsletterTitle: string;
  newsletterDescription: string;
  metaTitle: string;
  metaDescription: string;
  analyticsId?: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      default: 'NEBULYTIX News',
    },
    siteTagline: {
      type: String,
      default: 'The Future Feed - Your Gateway to Tomorrow',
    },
    logoUrl: {
      type: String,
      default: '/logo.png',
    },
    faviconUrl: {
      type: String,
      default: '/favicon.ico',
    },
    footerText: {
      type: String,
      default: 'Stay informed with the latest news across technology, business, science, and more.',
    },
    copyrightText: {
      type: String,
      default: '© 2026 NEBULYTIX News. All rights reserved.',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    contactInfo: {
      email: { type: String, default: 'contact@nebulytix.com' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    enableNewsletter: {
      type: Boolean,
      default: true,
    },
    newsletterTitle: {
      type: String,
      default: 'Stay Updated',
    },
    newsletterDescription: {
      type: String,
      default: 'Subscribe to our newsletter for the latest news delivered to your inbox.',
    },
    metaTitle: {
      type: String,
      default: 'NEBULYTIX News - The Future Feed',
    },
    metaDescription: {
      type: String,
      default: 'Your comprehensive source for technology, business, science, world, and health news.',
    },
    analyticsId: String,
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently performing maintenance. Please check back soon.',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
