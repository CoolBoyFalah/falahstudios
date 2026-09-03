import { Request, Response } from "express";
import BlogService from "../services/BlogService";
import { asyncHandler } from "../utils/error-handler";

export class BlogController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const posts = await BlogService.getAllPosts(page, limit);

    res.json({
      success: true,
      data: posts,
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
    const post = await BlogService.createPost(req.body);

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
