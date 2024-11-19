const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

beforeEach(async () => await helper.beforeEach(api))

describe('When database has initially one user with blogs', () => {
  test('user should be able to login using their credential', async () => {
    const user = {...helper.initialUser}
    delete user.name

    const res = await api.post('/api/login').send(user).expect(200)
    const {token,username,name} = res.body

    expect(token).toBeTruthy()
    expect(username).toBeTruthy()
    expect(name).toBeTruthy()
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})