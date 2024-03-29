import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6)
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const exists = await User.findOne({ where: { email: req.body.email } });
    if (exists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const { id, name, email, provider } = await User.create(req.body);
    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldpass: Yup.string(),
      password: Yup.string()
        .min(6)
        .when('oldpass', (oldpass, field) =>
          oldpass ? field.required() : field
        ),
      confirmpass: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const userId = req.params.id;
    const { email, oldpass, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    if (email !== user.email) {
      const emailExist = await User.findOne({ where: { email } });
      if (emailExist) {
        return res.status(401).json({ message: 'Usuário já existe' });
      }
    }

    if (oldpass && password && !(await user.checkPassword(oldpass))) {
      return res.status(401).json({ message: 'Password does not match' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });
    return res.json({ id, name, email, avatar });
  }
}

export default new UserController();
