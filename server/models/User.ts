import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  savedArticles: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    name: String,
    savedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'News',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
