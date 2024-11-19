import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';
import { beforeEach } from 'vitest';

describe('Blog component', () => {
  const user = {
    name: 'John Doe',
    username: 'johndoe',
  };

  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    url: 'https://example.com',
    likes: 10,
    user: user
  };

  localStorage.setItem('loggedBlogappUser', JSON.stringify(user));

  let container;
  const likeHandler = vi.fn();

  beforeEach(() => {
    container = render(<Blog blog={blog} handleLike={likeHandler} />).container;
  })

  test('renders blog title and author', () => {
    const blogTitle = container.querySelector('.blog-title');
    const blogAuthor = container.querySelector('.blog-author');

    expect(blogTitle).toHaveTextContent(blog.title);
    expect(blogAuthor).toHaveTextContent(blog.author);
  });

  test('does not render blog URL by default', () => {
    const div = container.querySelector('.togglableContent');

    // expect blog url is a child of togglableContent and is not displayed
    expect(div).toHaveTextContent(blog.url);
    expect(div).toHaveStyle('display: none');
  });
  
  test('does not render blog likes by default', () => {
    const div = container.querySelector('.togglableContent');
  
    // expect blog likes is a child of togglableContent and is not displayed
    expect(div).toHaveTextContent(`likes ${blog.likes}`);
    expect(div).toHaveStyle('display: none');
  });

  test('shows blog URL and likes when view button is clicked', async () => {
    const ue = userEvent.setup();
    const viewButton = screen.getByText('view');
    await ue.click(viewButton);
    
    // expect blog URL and likes are children of togglableContent and are displayed
    const div = container.querySelector('.togglableContent');
    expect(div).not.toHaveStyle('display: none');
    expect(div).toHaveTextContent(blog.url);
    expect(div).toHaveTextContent(`likes ${blog.likes}`);
  });
  
  test('calls like event handler twice when like button is clicked twice', async () => {
    const ue = userEvent.setup();
    const viewButton = screen.getByText('view');
    await ue.click(viewButton);

    const likeButton = screen.getByText('like');
    await ue.click(likeButton);
    await ue.click(likeButton);
    expect(likeHandler.mock.calls).toHaveLength(2);
  });
});