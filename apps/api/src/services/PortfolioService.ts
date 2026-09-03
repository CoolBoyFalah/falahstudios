import PortfolioProject from "../models/PortfolioProject";
import { AppError } from "../utils/error-handler";

export class PortfolioService {
  async getAllProjects(category?: string) {
    const query = category ? { category } : {};
    const projects = await PortfolioProject.find(query).sort({
      createdAt: -1,
    });
    return projects;
  }

  async getFeaturedProjects() {
    const projects = await PortfolioProject.find({ featured: true })
      .limit(6)
      .sort({ createdAt: -1 });
    return projects;
  }

  async getProjectById(id: string) {
    const project = await PortfolioProject.findById(id);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    return project;
  }

  async getProjectBySlug(slug: string) {
    const project = await PortfolioProject.findOne({ slug });
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    return project;
  }

  async createProject(data: any) {
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");
    const project = new PortfolioProject({
      ...data,
      slug,
    });
    await project.save();
    return project;
  }

  async updateProject(id: string, data: any) {
    const project = await PortfolioProject.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    return project;
  }

  async deleteProject(id: string) {
    const project = await PortfolioProject.findByIdAndDelete(id);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    return project;
  }
}

export default new PortfolioService();
