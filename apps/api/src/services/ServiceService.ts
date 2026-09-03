import Service from "../models/Service";
import { AppError } from "../utils/error-handler";

export class ServiceService {
  async getAllServices() {
    const services = await Service.find().sort({ createdAt: -1 });
    return services;
  }

  async getServiceById(id: string) {
    const service = await Service.findById(id);
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    return service;
  }

  async getServiceBySlug(slug: string) {
    const service = await Service.findOne({ slug });
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    return service;
  }

  async createService(data: any) {
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");
    const service = new Service({
      ...data,
      slug,
    });
    await service.save();
    return service;
  }

  async updateService(id: string, data: any) {
    const service = await Service.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    return service;
  }

  async deleteService(id: string) {
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new AppError("Service not found", 404);
    }
    return service;
  }
}

export default new ServiceService();
