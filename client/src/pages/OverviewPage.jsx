
import React from 'react';
import './OverviewPage.css';
import { Link } from 'react-router-dom';

// Import your images
import shareThoughtsImage from '/Users/jayeshdantha/Desktop/NovelVerse/Screenshot 2025-08-23 at 8.22.38 AM.png';
import virtualBookshelfImage from '/Users/jayeshdantha/Desktop/NovelVerse/Screenshot 2025-08-23 at 8.16.47 AM.png';
import readingScheduleImage from '/Users/jayeshdantha/Desktop/NovelVerse/Screenshot 2025-08-23 at 8.24.57 AM.png';
import findFriendsImage from '/Users/jayeshdantha/Desktop/NovelVerse/Screenshot 2025-08-23 at 8.25.58 AM.png';

function OverviewPage() {
  return (
    <div className="overview-page">
      <header className="hero-section">
        <h1>Welcome to NovelVerse</h1>
        <p>Your universe for all things books. Connect with fellow readers, discover new novels, and enhance your reading experience.</p>
        <Link to="/register">
          <button>Get Started</button>
        </Link>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <img src={shareThoughtsImage} alt="Share your thoughts" />
          <div className="feature-content">
            <h2>Share Your Thoughts</h2>
            <p>Engage in discussions, share your reviews, and connect with authors and readers alike. Your voice matters in the NovelVerse.</p>
          </div>
        </div>
        <div className="feature-card">
          <img src={virtualBookshelfImage} alt="Virtual Bookshelf" />
          <div className="feature-content">
            <h2>Create Your Virtual Bookshelf</h2>
            <p>Organize your reading life. Keep track of what you’ve read, what you’re reading, and what you want to read next.</p>
          </div>
        </div>
        <div className="feature-card">
          <img src={readingScheduleImage} alt="Reading Schedule" />
          <div className="feature-content">
            <h2>Develop a Reading Schedule</h2>
            <p>Stay on track with your reading goals. Set up a personalized schedule and get reminders to help you meet your targets.</p>
          </div>
        </div>
        <div className="feature-card">
          <img src={findFriendsImage} alt="Find new friends and communities" />
          <div className="feature-content">
            <h2>Find New Friends & Communities</h2>
            <p>Join book clubs, participate in reading challenges, and connect with readers who share your interests. Your next book bestie is waiting.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OverviewPage;
