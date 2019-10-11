import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import File from '../models/File';
import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  /**
   * Busca a lista de agendamentos existentes para o
   * Prestador de Serviço.
   */
  async index(req, res) {
    const { page = 1, pageSize = 10 } = req.query;

    const checkUserProvider = await User.findOne({
      where: { id: req.userId, provider: true }
    });
    if (!checkUserProvider) {
      return res
        .status(401)
        .json({ message: 'Usuário não é um prestador de serviço' });
    }

    let dateCondition = {};
    const { date } = req.query;
    if (date) {
      const parsedDate = parseISO(date);
      dateCondition = {
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      };
    }

    const filterCondition = { provider_id: req.userId, canceled_at: null };

    const appointments = await Appointment.findAll({
      where: Object.assign(filterCondition, dateCondition),
      order: ['date'],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'user',
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
}

export default new ScheduleController();
