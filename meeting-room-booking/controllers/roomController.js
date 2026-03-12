import roomService from "../services/roomService.js";
import { AppError } from "../utils/errors.js";
import { normalizeRoomPayload, validateRoomPayload } from "../utils/validators.js";

class RoomController {
  async createRoom(req, res) {
    try {
      const validation = validateRoomPayload(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          error: "ValidationError",
          message: validation.message,
        });
      }

      const room = await roomService.createRoom(normalizeRoomPayload(req.body));
      return res.status(201).json(room);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.status).json({
          error: error.error,
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to create room",
      });
    }
  }

  async getRooms(req, res) {
    try {
      const filters = {};

      if (req.query.minCapacity !== undefined) {
        const parsed = Number.parseInt(req.query.minCapacity, 10);
        if (!Number.isInteger(parsed) || parsed < 1) {
          return res.status(400).json({
            error: "ValidationError",
            message: "minCapacity must be an integer >= 1",
          });
        }

        filters.minCapacity = parsed;
      }

      if (req.query.amenity) {
        filters.amenity = String(req.query.amenity).trim();
      }

      const rooms = await roomService.listRooms(filters);
      return res.json(rooms);
    } catch (error) {
      return res.status(500).json({
        error: "InternalServerError",
        message: "failed to fetch rooms",
      });
    }
  }
}

export default new RoomController();
