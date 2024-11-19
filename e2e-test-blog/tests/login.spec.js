// Create a new npm project for tests and configure Playwright there.
// Make a test to ensure that the application displays the login form by default.

const { test, expect, beforeEach, describe } = require('@playwright/test')
const { faker } = require('@faker-js/faker')

const randomBlog = () => ({
  title: faker.lorem.words(3),
  author: faker.person.fullName(),
  url: faker.internet.url(),
})

const testBlog = {
  title: 'Test Blog',
  author: 'Test Author',
  url: 'https://example.com',
}

const testUser = {
  name: 'Test User',
  username: 'testuser',
  password: 'testpassword',
}

const user = {
  name: 'Matti Luukkainen',
  username: 'mluukkai',
  password: 'salainen',
}

const createBlog = async (page, blog) => {
  await page.getByRole('button', { name: 'new blog' }).click()

  await page.locator('input[name="Title"]').fill(blog.title)
  await page.locator('input[name="Author"]').fill(blog.author)
  await page.locator('input[name="Url"]').fill(blog.url)
  await page.getByRole('button', { name: 'create' }).click()

  await page.getByRole('heading', { name: blog.title }).waitFor()
}

const loginWith = async (page, username, password) => {
  await page.locator('input[name="Username"]').fill(username)
  await page.locator('input[name="Password"]').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

// TODO: create a function to check if an array is sorted by the greatest number first
const isSorted = (obj) => {
  const before = [...obj]
  let after = [...obj]
  after = after.sort((a, b) => b - a)
  return JSON.stringify(before) === JSON.stringify(after)
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the db here
    const response = await request.post(
      'http://localhost:3003/api/testing/reset'
    )
    expect(response.status()).toBe(204)

    // create a user for the backend here
    const response2 = await request.post('http://localhost:3003/api/users', {
      data: testUser,
    })
    expect(response2.status()).toBe(201)

    // go to the login page
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const lusername = await page.locator('input[name="Username"]')
    const lpassword = await page.locator('input[name="Password"]')
    const lloginButton = await page.getByRole('button', { name: 'login' })

    await expect(lusername).toBeVisible()
    await expect(lpassword).toBeVisible()
    await expect(lloginButton).toBeVisible()
  })

  // Do the tests for login. Test both successful and failed login.
  // For tests, create a user in the beforeEach block.
  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')

      await expect(await page.getByText(`Test User logged in`)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'wronguser', 'wrongpassword')
      const lfailedLogin = await page
        .locator('.notification.error')
        .getByText('Wrong credentials')
      await expect(lfailedLogin).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')
    })

    // Create a test that verifies that a logged in user can create a blog
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, testBlog)

      await expect(
        await page.locator('h2[class="blog-title"]').getByText('Test Blog')
      ).toBeVisible()
      await expect(
        await page.locator('p[class="blog-author"]').getByText('Test Author')
      ).toBeVisible()
      await expect(await page.getByText('https://example.com')).toBeHidden()
    })

    // Do a test that makes sure the blog can be liked
    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, testBlog)

      await page.getByRole('button', { name: 'view' }).click()

      await expect(
        await page.locator('.togglableContent').first().getByText('likes')
      ).toBeVisible()

      const currentLikes = await (
        await page
          .locator('.togglableContent')
          .first()
          .getByText('likes 0')
          .innerHTML()
      ).match(/\d+/)[0]

      await page.getByRole('button', { name: 'like' }).first().click()

      const newLikes = await (
        await page
          .locator('.togglableContent')
          .first()
          .getByText('likes 1')
          .innerHTML()
      ).match(/\d+/)[0]

      expect(parseInt(newLikes)).toBe(parseInt(currentLikes) + 1)
    })

    // Make a test that ensures that the user who added the blog can delete the blog.
    test('a blog can be deleted', async ({ page }) => {
      await createBlog(page, testBlog)
      await page.getByRole('button', { name: 'view' }).click()
      await page
        .locator('h2[class="blog-title"]')
        .getByText(testBlog.title)
        .waitFor()
      page.on('dialog', (dialog) => {
        console.log(dialog.message())
        const dialogText = `Remove blog ${testBlog.title} by ${testBlog.author}?`
        if (dialog.message() === dialogText) {
          dialog.accept()
        }
      })
      await page.getByRole('button', { name: 'remove' }).click()

      const lblogTitle = await page
        .locator('h2[class="blog-title"]')
        .getByText(testBlog.title)
        .waitFor({ state: 'detached' })
      await expect(lblogTitle).toBeFalsy()
    })

    // Make a test that ensures that only the user who added the blog sees the blog's delete button
    test('only the user who added the blog can delete the blog', async ({
      page,
      request,
    }) => {
      const testUser2 = {
        name: 'Test User 2',
        username: 'testuser2',
        password: 'testpassword2',
      }

      await request.post('http://localhost:3003/api/users', {
        data: testUser2,
      })

      await createBlog(page, testBlog)
      await page.getByRole('heading').getByText(testBlog.title).waitFor()

      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, testUser2.username, testUser2.password)

      await page.getByRole('button', { name: 'view' }).click()
      await page
        .locator('h2[class="blog-title"]')
        .getByText(testBlog.title)
        .waitFor()
      const lremoveButton = await page
        .getByRole('button', { name: 'remove' })
        .waitFor({ state: 'detached' })
      await expect(lremoveButton).toBeFalsy
    })

    // Do a test that ensures that the blogs are arranged in the order according to the likes, the blog with the most likes first.
    test('blogs are arranged in the order according to the likes count', async ({
      page,
    }) => {
      // create 3 blogs
      const initBlogs = Array(3)
        .fill()
        .map(() => randomBlog())
      await createBlog(page, initBlogs[0])
      await createBlog(page, initBlogs[1])
      await createBlog(page, initBlogs[2])

      const lblogs = await page.locator(':has(> h2.blog-title)')

      // verify that the 3 blogs are created
      await expect(await lblogs.count()).toEqual(initBlogs.length)

      // 2nd blog is liked 5 times
      await lblogs.nth(1).getByRole('button', { name: 'view' }).click()
      let ldetails = await lblogs.nth(1).locator('xpath=..')
      await ldetails
        .getByRole('button', { name: 'like' })
        .waitFor({ state: 'visible' })
      for (let i = 0; i < 5; i++) {
        let currentLikes = parseInt(
          await (await ldetails.getByText('likes').innerHTML()).match(/\d+/)[0]
        )
        await ldetails.getByRole('button', { name: 'like' }).click()
        await ldetails.getByText('likes ' + (currentLikes + 1)).waitFor()
      }
      await expect(ldetails.getByText('likes 5')).toBeVisible()

      // 3rd blog is liked 3 times
      await lblogs.nth(2).getByRole('button', { name: 'view' }).click()
      ldetails = await lblogs.nth(2).locator('xpath=..')
      await ldetails
        .getByRole('button', { name: 'like' })
        .waitFor({ state: 'visible' })
      for (let i = 0; i < 3; i++) {
        let currentLikes = parseInt(
          await (await ldetails.getByText('likes').innerHTML()).match(/\d+/)[0]
        )
        await ldetails.getByRole('button', { name: 'like' }).click()
        await ldetails.getByText('likes ' + (currentLikes + 1)).waitFor()
      }
      await expect(ldetails.getByText('likes 3')).toBeVisible()

      // get all blogs likes
      const llikes = await lblogs.locator('xpath=..').getByText('likes').all()
      let likes = []
      for (const llike of llikes) {
        const llikeHtml = await llike.innerHTML()
        const extractedlike = parseInt(llikeHtml.match(/\d+/)[0])
        likes.push(extractedlike)
      }

      // likes should be unsorted
      expect(isSorted(likes)).toBeFalsy()

      // sort likes
      await page.locator('select[name="sort-blogs"]').selectOption('likes')
      await page.locator('select[name="sort-blogs"]').waitFor()

      // get all blogs likes
      const llikesAfterSort = await lblogs
        .locator('xpath=..')
        .getByText('likes')
        .all()
      let likesAfterSort = []
      for (const llike of llikesAfterSort) {
        const llikeHtml = await llike.innerHTML()
        const extractedlike = parseInt(llikeHtml.match(/\d+/)[0])
        likesAfterSort.push(extractedlike)
      }

      // likes should be sorted
      expect(isSorted(likesAfterSort)).toBeTruthy()
    })
  })
})
