import { Op, fn, col, where } from "sequelize";
import { Room } from "../models/index.js";

class RoomRepository {
  async create(roomData, options = {}) {
    return Room.create(roomData, options);
  }

  async findAll(filters = {}) {
    const query = {
      order: [["id", "ASC"]],
      where: {},
    };

    if (filters.minCapacity !== undefined) {
      query.where.capacity = { [Op.gte]: filters.minCapacity };
    }

    if (filters.amenity) {
      query.where = {
        ...query.where,
        amenities: { [Op.contains]: [filters.amenity] },
      };
    }

    return Room.findAll(query);
  }

  async findById(id, options = {}) {
    return Room.findByPk(id, options);
  }

  async findByName(name, options = {}) {
    return Room.findOne({
      ...options,
      where: where(fn("lower", col("name")), name.toLowerCase()),
    });
  }
}

export default new RoomRepository();
