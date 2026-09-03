import { Request, Response } from "express";
import BlogService from "../services/BlogService";
import { asyncHandler, AppError } from "../utils/error-handler";
import Joi from "joi";

export class BlogController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await BlogService.getAllPosts(page, limit);
    res.json({
      success: true,
      ...result,
    });
  });

  static getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.getPostBySlug(req.params.slug);
    res.json({
      success: true,
      data: post,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const schema = Joi.object({
      body: Joi.object({
        title: Joi.string().required(),
        excerpt: Joi.string().required(),
        content: Joi.string().required(),
        author: Joi.string().required(),
        category: Joi.string().required(),
        image: Joi.string().required(),
        tags: Joi.array().items(Joi.string()),
        published: Joi.boolean(),
      }).required(),
    });

    const { error, value } = schema.validate({ body: req.body });

    if (error) {
      throw new AppError("Validation failed", 400, error.details);
    }

    const post = await BlogService.createPost(value.body);
    res.status(201).json({
      success: true,
      data: post,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogService.updatePost(req.params.id, req.body);
    res.json({
      success: true,
      data: post,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await BlogService.deletePost(req.params.id);
    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  });
}

export default BlogController;
