import axios from 'axios'
const baseUrl = '/api/blogs'

const getToken = () => {
  const user = JSON.parse(window.localStorage.getItem('loggedBlogappUser'))
  if (user) {
    return user.token
  }
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async newObject => {
  const config = {
    headers: { Authorization: 'Bearer ' + getToken() }
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (id, newObject) => {
  const config = {
    headers: { Authorization: 'Bearer ' + getToken() }
  }

  const response = await axios.put(`${baseUrl}/${id}`, newObject, config)
  return response.data
}

const remove = async (id) => {
  const config = {
    headers: { Authorization: 'Bearer ' + getToken() }
  }

  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

export default { getAll, create, update, remove }