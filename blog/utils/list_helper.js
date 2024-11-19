const _ = require('lodash');

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((n, {likes}) => n + likes, 0)
}

const favoriteBlog = (blogs) => {
  const {title, author, likes} = blogs.reduce((maxLikesBlog, currentBlog) => {
    return currentBlog.likes > maxLikesBlog.likes ? currentBlog : maxLikesBlog
  }, blogs[0])
  return {title, author, likes}
}

const mostBlogs = (blogs) => {
  let authorCounts = _.countBy(blogs, 'author')
  authorCounts = _.map(authorCounts, (blogs, author) => {
    return { author: author, blogs: blogs };
  })
  const authorWithMostBlogs = _.maxBy(authorCounts, author => author.blogs )
  return authorWithMostBlogs
}

// return author which blog posts have the largest amount of likes
const mostLikes  = (blogs) => {
  let authorLikes = _.groupBy(blogs, 'author');
  const authorsWithLikes = _.map(authorLikes, (blogs, author) => {
    const totalLikes = _.sumBy(blogs, 'likes');
    return { author: author, likes: totalLikes };
  })
  const authorWithMostLikes = _.maxBy(authorsWithLikes, 'likes')
  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}