const express = require("express");
const blogRouter = express.Router();

const blogController = require("../controllers/blog.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const queryMiddleware = require("../middlewares/query.middleware");
const pagination = require("../middlewares/pagination");

// Public routes
blogRouter.get("/", queryMiddleware.filterAndSort, queryMiddleware.filterByPublished, pagination, blogController.getAllBlogs);

blogRouter.get("/:id", queryMiddleware.filterByPublished, blogController.getBlogById);

// Protected Routes
blogRouter.use(authMiddleware);


blogRouter.get("/user/blogs",  queryMiddleware.filterAndSort, pagination, blogController.getUserBlogs);



blogRouter.post("/", blogController.createBlog);
blogRouter.put("/:id", blogController.updateBlog);
blogRouter.delete("/:id", blogController.deleteBlog);
blogRouter.put("/:id/state", blogController.updateBlogState);

module.exports = blogRouter;