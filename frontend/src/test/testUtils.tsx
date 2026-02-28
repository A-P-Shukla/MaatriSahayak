import React from 'react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';

/**
 * MemoryRouter with React Router v7 future flags enabled
 * Use this in tests instead of the default MemoryRouter
 */
export const TestMemoryRouter: React.FC<{
  children: React.ReactNode;
  initialEntries?: any[];
  initialIndex?: number;
}> = ({ children, initialEntries, initialIndex }) => {
  return (
    <MemoryRouter
      initialEntries={initialEntries}
      initialIndex={initialIndex}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </MemoryRouter>
  );
};

/**
 * BrowserRouter with React Router v7 future flags enabled
 * Use this in tests instead of the default BrowserRouter
 */
export const TestBrowserRouter: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </BrowserRouter>
  );
};
