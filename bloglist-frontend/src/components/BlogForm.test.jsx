import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import BlogForm from './BlogForm';

describe('BlogForm component', () => {
  test('calls event handler with the right details when a new blog is created', async () => {
    const mockHandler = vi.fn();
    const ue = userEvent.setup();
    const newBlog = { title: 'Test blog', author: 'John Doe', url: 'https://example.com', likes: 0 };

    render(<BlogForm handleSubmit={mockHandler} />);

    const titleInput = screen.getByPlaceholderText('Blog title');
    const authorInput = screen.getByPlaceholderText('Blog author');
    const urlInput = screen.getByPlaceholderText('Blog url');
    const createButton = screen.getByText('create');

    await ue.type(titleInput, newBlog.title);
    await ue.type(authorInput, newBlog.author);
    await ue.type(urlInput, newBlog.url);
    await ue.click(createButton);

    expect(mockHandler.mock.calls).toHaveLength(1);
    expect(mockHandler.mock.calls[0][0]).toEqual(newBlog);
  });
});