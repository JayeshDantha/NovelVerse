// client/src/App.jsx - FINAL VERSION

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import ProtectedRoute from './utils/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage'; // --- ADD THIS IMPORT
import NovelDetailPage from './pages/NovelDetailPage'; // --- ADD THIS IMPORT ---
import UserSearchPage from './pages/UserSearchPage'; // --- ADD THIS IMPORT ---



function App() {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> {/* --- ADD THIS LINE --- */}
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/book/:googleBooksId" element={<NovelDetailPage />} /> {/* --- ADD THIS ROUTE --- */}
          <Route path="/search/users" element={<ProtectedRoute><UserSearchPage /></ProtectedRoute>} /> {/* --- ADD THIS LINE --- */}
          <Route path="/books/view/:googleBooksId" element={<ProtectedRoute><NovelDetailPage /></ProtectedRoute>} />



          {/* Protected Routes */}
          <Route 
            path="/create-post" 
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:username" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;