const router = require("express").Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {title: 1, url: 1, author: 1, likes: 1, id: 1})
  response.json(users)
})

router.post('/', async (request, response) => {
  const { username, name, password } = request.body
  let error = new Error("password must be at least 3 characters")
  error.name = "ValidationError"

  if (password.length < 3) throw error
  
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const result = await user.save()
  response.status(201).json(result)
})

module.exports = router