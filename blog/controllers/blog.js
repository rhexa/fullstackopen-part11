const router = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const { getToken, decodeToken } = require("../utils/token_helper");
const { authenticateToken } = require("../utils/middleware");

router.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

router.post("/", authenticateToken, async (request, response) => {
  const { title, author, url, likes } = request.body;

  const user = request.user;

  const blog = new Blog({
    title,
    author,
    url,
    likes,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

router.delete("/:id", authenticateToken, async (request, response) => {
  const decodedToken = decodeToken(request.token);

  const blogToDelete = await Blog.findById(request.params.id);

  if (decodedToken.id.toString() === blogToDelete.user.toString()) {
    const user = request.user;
    const deletedBlog = await Blog.findByIdAndDelete(
      blogToDelete._id.toString()
    );
    user.blogs = user.blogs.filter(
      (b) => b.toString() !== blogToDelete._id.toString()
    );
    await user.save();
    response.status(204).json(deletedBlog);
  } else {
    response
      .status(403)
      .json({ error: "You don't have permission to perform the request" });
  }
});

router.put("/:id", async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  );
  response.status(200).json(updatedBlog);
});

// Blog's comments
router.get("/:id/comments", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  response.status(200).json(blog.comments);
});

router.post("/:id/comments", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  blog.comments = blog.comments.concat(request.body.comment);
  const savedBlog = await blog.save();
  response.status(201).json(savedBlog);
});

// delete all comments of a blog
router.delete("/:id/comments", async (request, response) => {
  const blog = await Blog.findById(request.params.id);
  blog.comments = [];
  const savedBlog = await blog.save();
  response.status(204).json(savedBlog);
});

module.exports = router;
