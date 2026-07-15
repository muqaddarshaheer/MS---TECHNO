import { Announcement } from '../models/Announcement.js';

function today() {
  return new Date().toISOString().split('T')[0];
}

export async function listAnnouncements(req, res, next) {
  try {
    let filter = {};
    if (req.user.role === 'shop') {
      filter = {
        $or: [{ targetShop: null }, { targetShop: req.user.shop }],
      };
    }
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.create({
      title: req.body.title || 'Announcement',
      msg: req.body.msg || '',
      date: today(),
      targetShop: req.body.targetShop || null,
    });
    res.status(201).json({ announcement });
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(req, res, next) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
}
