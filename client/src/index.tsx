import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Galleries from './Galleries';
import Gallery from './Gallery';
import Image from './Image';
import './index.css';
import reportWebVitals from './reportWebVitals';
import SearchResult from './SearchResult';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<SearchResult top={true} />} />
          <Route path="search" element={<SearchResult top={false} />} />
          <Route path="galleries" element={<Galleries />}>
            <Route path=":galleryId" element={<Gallery />} />
            <Route path=":galleryId/images/:imageId" element={<Image />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
