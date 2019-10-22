import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    // prestador informado não é do tipo prestador
    const isNotProvider = await User.findOne({
      where: { id: req.userId, provider: false }
    });
    if (isNotProvider) {
      return res
        .status(401)
        .json({ message: 'Prestador informado não é válido' });
    }

    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
