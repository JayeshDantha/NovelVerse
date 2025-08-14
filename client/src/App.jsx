// client/src/App.jsx - FINAL VERSION (Corrected for Adaptive Header)

import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, useMediaQuery, createTheme, ThemeProvider } from '@mui/material';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import ProtectedRoute from './utils/ProtectedRoute';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import NovelDetailPage from './pages/NovelDetailPage';
import UserSearchPage from './pages/UserSearchPage';
import SchedulePage from './pages/schedule/SchedulePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import BookClubsPage from './pages/BookClubsPage.jsx';
import CreateBookClubPage from './pages/CreateBookClubPage.jsx';
import BookClubDetailPage from './pages/BookClubDetailPage.jsx';
import EditBookClubPage from './pages/EditBookClubPage.jsx';
import AddBookPage from './pages/AddBookPage.jsx';
import EditBookPage from './pages/EditBookPage.jsx';
import { AuthContext } from './context/AuthContext.jsx';

// The ThemeProvider is needed for the useMediaQuery hook to work correctly.
const AppWrapper = () => {
    return (
        <App />
    )
}

function App() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  const theme = createTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    // CHANGE 1: Switched to a Box and added padding for the nav bars
    <Box sx={{ pt: user ? '64px' : 0, pb: isMobile && user ? '56px' : 0 }}>
      {/* CHANGE 2: Header is now always shown when logged in. It will adapt internally. */}
      {user && <Header />}
      
      <main>
        <AnimatePresence mode='wait'>
          {/* All your routes are preserved and untouched below */}
          <Routes location={location} key={location.pathname}>
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                {user ? <HomePage /> : <LoginPage />}
              </motion.div>
            }/>
            <Route path="/search" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><SearchPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/chat" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><ChatPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/post/:postId" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <PostDetailPage />
              </motion.div>
            }/>
            <Route path="/book/:googleBooksId" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <NovelDetailPage />
              </motion.div>
            }/>
            <Route path="/search/users" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><UserSearchPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/schedule" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><SchedulePage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/notifications" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><NotificationsPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/books/view/:googleBooksId" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><NovelDetailPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/create-post" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><CreatePostPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/profile/:username" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/settings" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/bookclubs" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><BookClubsPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/bookclubs/new" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><CreateBookClubPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/bookclubs/:id" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><BookClubDetailPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/bookclubs/:id/edit" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><EditBookClubPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/add-book" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><AddBookPage /></ProtectedRoute>
              </motion.div>
            }/>
            <Route path="/book/:googleBooksId/edit" element={
              <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                <ProtectedRoute><EditBookPage /></ProtectedRoute>
              </motion.div>
            }/>
          </Routes>
        </AnimatePresence>
      </main>

      {/* This logic is unchanged */}
      {user && isMobile && <BottomNav />}
    </Box>
  );
}

export default AppWrapper;
