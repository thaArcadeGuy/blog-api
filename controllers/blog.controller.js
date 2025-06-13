const Blog = require("../models/model.blog");
const { readingTime } = require("../utils/utils");

const createBlog = async (req, res, next) => {
  try {
    const { title, description, tags, body } = req.body;
    const newBlog = new Blog({ 
      title,
      description: description || title,
      tags,
      author: req.user._id,
      body,
      reading_time: readingTime(body),
      owner: req.user.username,
    });

    const savedBlog = await newBlog.save();

    req.user.blogs.push(savedBlog._id);
    await req.user.save();

    return res.status(201).json({
      status: true,
      message: "Blog created successfully",
      data: savedBlog
    })
  } catch (error) {
    error.source = "Creating blog controller";
    next(error);
  }
}

const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog
      .find(req.findFilter)
      .select(req.fields)
      .populate("author", { username: 1 })
      .skip(req.pagination.start)
      .limit(req.pagination.sizePerPage)

    const  pageInfo = req.pageInfo;

    return res.json({
      status: true,
      message: "Blogs fetched successfully",
      pageInfo,
      data: blogs
    })
  } catch (error) {
    error.source = "Fetching published blogs controller";
    next(error)
  }
}

const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog
      .findById(req.params.id)
      .populate("author", { username: 1 });

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found"
      });
    }

    if (blog.state !== "published") {
      return res.status(403).json({
        status: false,
        message: "This blog is not published yet"
      });
    }

    blog.read_count += 1;
    await blog.save();

    return res.json({
      status: true,
      message: "Blog fetched successfully",
      data: blog
    })
  } catch (error) {
    error.source = "Fetching published blog controller";
    next(error);
  }
}

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found"
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this blog"
      });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...req.body, reading_time: readingTime(req.body.body || blog.body) },
      { new: true }
    );

    return res.json({
      status: true,
      message: "Blog updated successfully",
      data: updatedBlog
    });
  } catch (error) {
    error.source = "Updating blog controller";
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found"
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to delete this blog"
      });
    }

    await Blog.findByIdAndDelete(id);
    
    // Remove blog from user's blogs array
    req.user.blogs = req.user.blogs.filter(blogId => 
      blogId.toString() !== id.toString()
    );
    await req.user.save();

    return res.json({
      status: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    error.source = "Deleting blog controller";
    next(error);
  }
};

const updateBlogState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!['draft', 'published'].includes(state)) {
      return res.status(400).json({
        status: false,
        message: "Invalid state value. Use 'draft' or 'published'"
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "Blog not found"
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this blog's state"
      });
    }

    blog.state = state;
    await blog.save();

    return res.json({
      status: true,
      message: `Blog ${state === 'published' ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
  } catch (error) {
    error.source = "Updating blog state controller";
    next(error);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogState
};