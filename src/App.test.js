import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders humpty dance', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/step off/i);
  expect(linkElement).toBeInTheDocument();
});
