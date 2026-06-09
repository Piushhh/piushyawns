import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

// GET /api/blogs — list all published blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true })
      .select('title slug tags createdAt')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET /api/blogs/:slug — single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

export default router;
