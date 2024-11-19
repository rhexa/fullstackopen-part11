const logger = require('./logger')
const {getToken,decodeToken,getUserId} = require('./token_helper')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const authenticateToken = (request, response, next) => {
  const decodedToken = decodeToken(request.token)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  next()
}

const tokenExtractor = (request, response, next) => {
  request.token = getToken(request)
  next()
}

const userExtractor = async (request, response, next) => {
  const userId = getUserId(request)
  if (userId) {
    request.user = await User.findById(userId)
  }
  next()
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authenticateToken,
  tokenExtractor,
  userExtractor
}