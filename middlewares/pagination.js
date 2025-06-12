const Blog = require("../models/model.blog");

const pagination = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1) {
      return res.status(400).json({
        status: false,
        message: "Page number must be greater than 0"
      });
    } 

    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments(req.findFilter || {}); 

    const totalPages = Math.ceil(totalBlogs / limit);

    if (totalPages > 0 && page > totalPages) {
      return res.status(404).json({
        status: false,
        message: `Page ${page} not found. Total pages available: ${totalPages}`
      });
    }

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    req.pagination = {
      skip,
      limit,
      page
    };

    req.pageInfo = {
      currentPage: page,
      totalPages,
      totalBlogs,
      hasNextPage,
      hasPreviousPage,
      limit,
      resultsOnPage: Math.min(limit, totalBlogs - skip)
    };

    if (hasNextPage) {
      req.pageInfo.nextPage = page + 1;
    }

    if (hasPreviousPage) {
      req.pageInfo.previousPage = page - 1;
    }

    if (totalBlogs > 0) {
      req.pageInfo.startResult = skip + 1;
      req.pageInfo.endResult = Math.min(skip + limit, totalBlogs);
    } else {
      req.pageInfo.startResult = 0;
      req.pageInfo.endResult = 0;
    }

    next();
  } catch (error) {
    error.source = "Pagination middleware";
    next(error);
  }
};

module.exports = pagination;