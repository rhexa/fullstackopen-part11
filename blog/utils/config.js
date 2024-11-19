require('dotenv').config()

const PORT = process.env.PORT || 3003
const DB_STRING = process.env.DB_STRING

module.exports = {
  DB_STRING,
  PORT
}