import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const { date, provider_id } = req.body;

    const isNotProvider = await User.findOne({
      where: { id: provider_id, provider: false }
    });

    if (isNotProvider) {
      return res
        .status(401)
        .json({ message: 'Prestador informado não é válido' });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    });
    return res.json(appointment);
  }
}

export default new AppointmentController();
