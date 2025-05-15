import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(<App />);
