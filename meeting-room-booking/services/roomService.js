import roomRepository from "../repositories/roomRepository.js";
import { conflictError } from "../utils/errors.js";

class RoomService {
  async createRoom(roomPayload) {
    const existingRoom = await roomRepository.findByName(roomPayload.name);
    if (existingRoom) {
      throw conflictError("room name must be unique (case-insensitive)");
    }

    return roomRepository.create(roomPayload);
  }

  async listRooms(filters) {
    return roomRepository.findAll(filters);
  }
}

export default new RoomService();
