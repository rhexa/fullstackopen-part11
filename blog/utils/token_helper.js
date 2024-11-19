const jwt = require('jsonwebtoken')

const getToken = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const decodeToken = (token) => {
  return jwt.verify(token, process.env.SECRET)
}

const getUserId = request => {
  if (!request.token) return
  const decodedToken = decodeToken(request.token)
  return decodedToken.id.toString()
}

module.exports = {
  getToken,
  decodeToken,
  getUserId
}