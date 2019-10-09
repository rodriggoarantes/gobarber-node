import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import File from '../models/File';
import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
  async index(req, res) {
    const { page = 1, pageSize = 10 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url']
          }
        }
      ]
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const { date, provider_id } = req.body;

    // prestador informado não é do tipo prestador
    const isNotProvider = await User.findOne({
      where: { id: provider_id, provider: false }
    });
    if (isNotProvider) {
      return res
        .status(401)
        .json({ message: 'Prestador informado não é válido' });
    }

    // verifica se a data de agendamento é após a data atual
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ message: 'Data passada não é permitida' });
    }

    // verificar agendamento disponivel
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    });

    if (checkAvailability) {
      return res
        .status(401)
        .json({ message: 'Agendamento não diponivel para data informada' });
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
