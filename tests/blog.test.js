const request = require('supertest');
const mongoose = require('mongoose');
const app  = require('../app');
const Blog = require('../models/model.blog');
const User = require('../models/model.user');

describe('Blog Endpoints', () => {
  let token;
  let testUser;
  let testBlog;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_DB_URI);
    
     // First create a user directly in the database
    testUser = await User.create({
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      blogs: []
    });

    // Then login to get the token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    token = loginResponse.body.token;
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
    
    // Create a test blog
    testBlog = await Blog.create({
      title: 'Test Blog',
      description: 'Test Description',
      body: 'Test Body Content',
      author: testUser._id,
      state: 'draft',
      owner: 'testUser.username'
    });

    testUser.blogs.push(testBlog._id);
    await testUser.save();
  });

  afterEach(async () => {
    await Blog.deleteMany({});
  });

  afterAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/blogs', () => {
    it('should create a new blog', async () => {
      const newBlog = {
        title: 'New Test Blog',
        description: 'New Description',
        body: 'New Blog Content',
        tags: ['test', 'blog']
      };

      const res = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: true,
        message: 'Blog created successfully',
        data: expect.objectContaining({
          title: newBlog.title,
          description: newBlog.description,
          author: testUser._id.toString(),
          reading_time: expect.any(Number)
        })
      });
    });
  });

  describe('GET /api/blogs', () => {
    it('should return published blogs with pagination', async () => {
      await Blog.findByIdAndUpdate(testBlog._id, { state: 'published' });

      const res = await request(app)
        .get('/api/blogs')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: true,
        message: 'Blogs fetched successfully',
        pageInfo: expect.any(Object),
        data: expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Blog',
            state: 'published'
          })
        ])
      });
    });

    it('should return 404 when no blogs found', async () => {
      await Blog.deleteMany({});

      const res = await request(app).get('/api/blogs');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe(false);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/blogs/user/blogs', () => {
    it('should return authenticated user blogs', async () => {
      const res = await request(app)
        .get('/api/blogs/user/blogs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].author).toHaveProperty('username', 'testuser');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/blogs/user/blogs');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return a published blog', async () => {
      await Blog.findByIdAndUpdate(testBlog._id, { state: 'published' });

      const res = await request(app).get(`/api/blogs/${testBlog._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.read_count).toBe(1);
    });

    it('should not return unpublished blog', async () => {
      const res = await request(app).get(`/api/blogs/${testBlog._id}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/blogs/:id', () => {
    it('should update user\'s own blog', async () => {
      const updates = {
        title: 'Updated Title',
        body: 'Updated content'
      };

      const res = await request(app)
        .put(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe(updates.title);
      expect(res.body.data.reading_time).toBe(1);
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should delete user\'s own blog', async () => {
      const res = await request(app)
        .delete(`/api/blogs/${testBlog._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Blog deleted successfully');

      const blogExists = await Blog.findById(testBlog._id);
      expect(blogExists).toBeNull();
    });
  });

  describe('PUT /api/blogs/:id/state', () => {
    it('should update blog state to published', async () => {
      const res = await request(app)
        .put(`/api/blogs/${testBlog._id}/state`)
        .set('Authorization', `Bearer ${token}`)
        .send({ state: 'published' });

      expect(res.status).toBe(200);
      expect(res.body.data.state).toBe('published');
    });

    it('should reject invalid state', async () => {
      const res = await request(app)
        .put(`/api/blogs/${testBlog._id}/state`)
        .set('Authorization', `Bearer ${token}`)
        .send({ state: 'invalid' });

      expect(res.status).toBe(400);
    });
  });
});