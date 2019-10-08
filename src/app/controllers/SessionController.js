import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Password does not match' });
    }

    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, auth.secret, {
        expiresIn: auth.expireIn
      })
    });
  }
}

export default new SessionController();
