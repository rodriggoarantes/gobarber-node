import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const list = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url']
        }
      ]
    });
    return res.json(list);
  }
}

export default new ProviderController();
