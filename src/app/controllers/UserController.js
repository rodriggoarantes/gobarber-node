import User from '../models/User';

class UserController {
  async store(req, res) {
    const exists = await User.findOne({ where: { email: req.body.email } });
    if (exists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const user = await User.create(req.body);
    return res.json(user);
  }
}

export default new UserController();
