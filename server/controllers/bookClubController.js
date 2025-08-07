const BookClub = require('../models/BookClub');
const User = require('../models/User');
const BookshelfItem = require('../models/BookshelfItem');

exports.getRecommendedClubs = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user data
    const currentUser = await User.findById(userId);
    const bookshelfItems = await BookshelfItem.find({ user: userId });
    const userGenres = bookshelfItems.length > 0 ? [...new Set(bookshelfItems.map(item => item.genres).flat())] : [];

    // 2. Fetch all book clubs the user is not a member of
    const allClubs = await BookClub.find({ members: { $ne: userId } })
      .populate('createdBy', 'username');

    // 3. Score and rank the clubs
    const scoredClubs = allClubs.map(club => {
      let score = 0;

      // Add points for each member in the club
      score += club.members.length;

      // Add points for each post in the club
      score += club.posts.length;

      // Add points if the club's description contains any of the user's favorite genres
      if (userGenres && userGenres.length > 0) {
        userGenres.forEach(genre => {
          if (genre && club.description.toLowerCase().includes(genre.toLowerCase())) {
            score += 5;
          }
        });
      }

      return { ...club.toObject(), score };
    });

    // 4. Sort by score
    const sortedClubs = scoredClubs.sort((a, b) => b.score - a.score);

    res.json(sortedClubs);
  } catch (error) {
    console.error("Error fetching recommended clubs:", error.message);
    res.status(500).send('Server Error');
  }
};
