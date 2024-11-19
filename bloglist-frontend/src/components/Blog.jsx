import { useRef, useState } from 'react'
import Togglable from './Togglable'

const Blog = ({ blog, handleLike, handleBlogRemove }) => {
  const blogRef = useRef()
  const [detailVisible, setDetailVisible] = useState(false)

  const toggleDetailVisibility = () => {
    setDetailVisible(!detailVisible)
    blogRef.current.toggleVisibility()
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const removeButtonStyle = {
    backgroundColor: '#4567b7',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: 10,
    cursor: 'pointer',
  }

  return (
    <div style={blogStyle}>
      <div>
        <h2 className='blog-title'>{blog.title}</h2>
        <p className='blog-author'>{blog.author}</p>
        <button onClick={() => toggleDetailVisibility()}>{detailVisible ? 'hide' : 'view'}</button>
      </div>
      <Togglable buttonLabel="view" type="2" ref={blogRef}>
        <div>
          {blog.url}
        </div>
        <div>
          likes {blog.likes}
          <button onClick={(e) => handleLike(e, blog)} >like</button>
        </div>
        <div>
          {blog.user.username}
        </div>
        {
          blog.user.username === JSON.parse(window.localStorage.getItem('loggedBlogappUser')).username &&
          <div>
            <button style={removeButtonStyle} onClick={(e) => handleBlogRemove(e, blog)}>remove</button>
          </div>
        }
      </Togglable>
    </div>
  )
}

export default Blog