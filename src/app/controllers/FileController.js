import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    if (!name || !path) {
      return res.status(401).json({ message: 'Campos informados inválidos' });
    }

    const file = await File.create({
      name,
      path
    });
    return res.json(file);
  }
}

export default new FileController();
