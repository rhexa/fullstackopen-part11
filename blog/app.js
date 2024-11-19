const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const { DB_STRING } = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose
  .connect(DB_STRING)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use(express.static('dist'))

app.use(require('./controllers'))

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
