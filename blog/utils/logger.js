let [isInfo,isError] = [true,true]

process.env.NODE_ENV === "test" && (isInfo = isError = false)

const info = (...params) => {
  isInfo && console.log(...params)
}

const error = (...params) => {
  isError && console.error(...params)
}

module.exports = {
  info, error
}