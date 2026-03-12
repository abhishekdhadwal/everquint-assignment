import roomService from "../services/roomService.js";
import { AppError } from "../utils/errors.js";
import { getValidatedData } from "../middleware/validation/commonValidation.js";

class RoomController {
  async createRoom(req, res) {
    try {
      const roomPayload = getValidatedData(req, ["body"]);
      roomPayload.amenities = roomPayload.amenities.map((item) => item.trim());
      const room = await roomService.createRoom(roomPayload);
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
      const filters = getValidatedData(req, ["query"]);
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
