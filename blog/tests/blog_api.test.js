const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper');
const _ = require('lodash')

var token = null

beforeEach(async () => {
  await helper.beforeEach(api)
  token = await helper.login(api)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blogs has property named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    for (const blog of blogs) {
      expect(blog).toHaveProperty('id')
    }
  })

  test('blogs has property named likes', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    for (const blog of blogs) {
      expect(blog).toHaveProperty('likes')
    }
  })

  test('blogs has property user object with properties: username, id, name', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    for (const blog of blogs) {
      expect(blog).toHaveProperty('user')

      expect(blog.user).toHaveProperty('username')
      expect(blog.user).toHaveProperty('id')
      expect(blog.user).toHaveProperty('name')
    }
  })
})

// tests with token based authentication
describe('addition of a new note when user is authenticated', () => {
  const newBlog = {
    "title": "Frozen Operations e-services actuating",
    "author": "Lakin, Oberbrunner and Harvey",
    "url": "https://cayla.com",
    "likes": 452
  }

  test('should succeed with valid data', async () => {
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body
    const blog = _.find(blogs, newBlog)

    expect(blogs).toHaveLength(helper.initialBlogs.length + 1)

    // beware of the types, using wrong type may result an error
    expect(blogs).toEqual(
      expect.arrayContaining([expect.objectContaining(newBlog)])
    )
    expect(blog).toMatchObject(newBlog)
  })

  test('should succeed and result in a blog containing user object, and the user object should be the same one as the one authenticated', async () => {
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body

    const blog = _.find(blogs, newBlog)
    expect(blog).toMatchObject(newBlog)

    const user = { ...helper.initialUser }
    delete user.password

    expect(blog.user).toMatchObject(user)
  })

  test('should return status 400 when form is missing title', async () => {
    const blogNoTitle = {
      "author": "Lakin, Oberbrunner and Harvey",
      "url": "https://cayla.com",
      "likes": 452
    }
    const response = await api.post('/api/blogs').send(blogNoTitle).set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(400)
  })

  test('should return status 400 when form is missing url', async () => {
    const blogNoUrl = {
      "title": "Frozen Operations e-services actuating",
      "author": "Lakin, Oberbrunner and Harvey",
      "likes": 452
    }
    const response = await api.post('/api/blogs').send(blogNoUrl).set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(400)
  })
})

describe('addition of a new note when user is not authenticated', () => {
  const newBlog = {
    "title": "Frozen Operations e-services actuating",
    "author": "Lakin, Oberbrunner and Harvey",
    "url": "https://cayla.com",
    "likes": 452
  }

  // return 401 when token is not provided
  test('should fail even with valid data', async () => {
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const blogs = response.body
    const blog = _.find(blogs, newBlog)

    expect(blogs).toHaveLength(helper.initialBlogs.length)

    // beware of the types, using wrong type may result an error
    expect(blogs).not.toEqual(
      expect.arrayContaining([expect.objectContaining(newBlog)])
    )
    expect(blog).toBeUndefined()
  })
})

describe('deletion of a blog when authenticated', () => {
  test('should succeed with status code 204 when the token owner is the same as the blog owner', async () => {
    const blogBefore = await helper.blogsInDb()
    const blogToDelete = blogBefore[0]
    await api.delete('/api/blogs/' + blogToDelete.id)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogAfter = await helper.blogsInDb()

    expect(blogAfter).toHaveLength(blogBefore.length - 1)

    expect(blogAfter).not.toEqual(
      expect.arrayContaining([expect.objectContaining(blogToDelete)])
    )
  })

  test('should fail with status code 403 when the token given does not match the blog owner', async () => {
    const dummyUser = helper.initialUser
    dummyUser.username = "dummy"
    await helper.registerUser(api, dummyUser)
    const localToken = await helper.login(api, dummyUser)

    const blogBefore = await helper.blogsInDb()
    const blogToDelete = blogBefore[0]
    await api.delete('/api/blogs/' + blogToDelete.id)
      .set('Authorization', `Bearer ${localToken}`)
      .expect(403)

    const blogAfter = await helper.blogsInDb()

    expect(blogAfter).toHaveLength(blogBefore.length)

    expect(blogAfter).toEqual(
      expect.arrayContaining([expect.objectContaining(blogToDelete)])
    )
  })
})

describe('deletion of a blog when not authenticated', () => {
  test('should fail with status code 401', async () => {
    const blogBefore = await helper.blogsInDb()
    const blogToDelete = blogBefore[0]
    await api.delete('/api/blogs/' + blogToDelete.id)
      .expect(401)

    const blogAfter = await helper.blogsInDb()

    expect(blogAfter).toHaveLength(blogBefore.length)

    expect(blogAfter).toEqual(
      expect.arrayContaining([expect.objectContaining(blogToDelete)])
    )
  })
})

describe('modification of a blog', () => {
  test('should return 200 when blog is successfully modified', async () => {
    const blogBefore = await helper.blogsInDb()
    const blogToUpdate = { ...blogBefore[0] } // sprading the object to avoid the original ones from being overridden
    blogToUpdate.likes = 300

    const response = await api.put('/api/blogs/' + blogToUpdate.id).send(blogToUpdate)
    expect(response.statusCode).toEqual(200)

    const blogAfter = await helper.blogsInDb()

    expect(blogAfter).toEqual(
      expect.arrayContaining([expect.objectContaining(blogToUpdate)])
    )
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})