import BlogPost from "../models/BlogPost";
import { AppError } from "../utils/error-handler";

export class BlogService {
  async getAllPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const posts = await BlogPost.find({ published: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments({ published: true });

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPostBySlug(slug: string) {
    const post = await BlogPost.findOne({ slug, published: true });
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    // Increment views
    await BlogPost.findByIdAndUpdate(post._id, {
      views: post.views + 1,
    });

    return post;
  }

  async createPost(data: any) {
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");
    const post = new BlogPost({
      ...data,
      slug,
    });
    await post.save();
    return post;
  }

  async updatePost(id: string, data: any) {
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return post;
  }

  async deletePost(id: string) {
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return post;
  }
}

export default new BlogService();
