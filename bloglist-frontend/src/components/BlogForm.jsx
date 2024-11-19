import { useState } from "react"

const blogForm = ({
  handleSubmit,
}) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '', likes: 0 })

  const handleNewBlogChange = (state, action) => {
    switch (action.type) {
      case 'changed_title':
        setNewBlog({
          ...state,
          title: action.value
        })
        break
      case 'changed_author':
        setNewBlog({
          ...state,
          author: action.value
        })
        break
      case 'changed_url':
        setNewBlog({
          ...state,
          url: action.value
        })
        break
      case 'changed_likes':
        setNewBlog({
          ...state,
          likes: action.value
        })
        break
      default:
        break
    }
  }

  const addBlog = (event) => {
    event.preventDefault()
    handleSubmit(newBlog)
    setNewBlog({ title: '', author: '', url: '', likes: 0 })
  }

  return (
    <>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          title
          <input
            type="text"
            value={newBlog.title}
            name="Title"
            placeholder="Blog title"
            onChange={({ target }) => handleNewBlogChange(newBlog, { type: 'changed_title', value: target.value })}
          />
        </div>
        <div>
          author
          <input
            type="text"
            value={newBlog.author}
            name="Author"
            placeholder="Blog author"
            onChange={({ target }) => handleNewBlogChange(newBlog, { type: 'changed_author', value: target.value })}
          />
        </div>
        <div>
          url
          <input
            type="text"
            value={newBlog.url}
            name="Url"
            placeholder="Blog url"
            onChange={({ target }) => handleNewBlogChange(newBlog, { type: 'changed_url', value: target.value })}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </>
  )
}

export default blogForm