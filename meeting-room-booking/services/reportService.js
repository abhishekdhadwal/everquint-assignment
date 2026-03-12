import bookingService from "./bookingService.js";
import roomRepository from "../repositories/roomRepository.js";

class ReportService {
  async generateUtilizationReport(from, to) {
    const rooms = await roomRepository.findAll();
    return bookingService.buildUtilizationReport(from, to, rooms);
  }
}

export default new ReportService();
