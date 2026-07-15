import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    msg: { type: String, required: true },
    date: { type: String, required: true },
    targetShop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
