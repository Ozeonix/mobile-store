const db = require('../db');

exports.getReviewsPage = async (req, res) => {
  try {
    const reviewsResult = await db.query('SELECT * FROM reviews ORDER BY id DESC');
    const reviews = reviewsResult.rows;

    // Calculate rating breakdown
    const totalCount = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = totalCount > 0 ? (sum / totalCount).toFixed(1) : '5.0';

    res.render('reviews', {
      title: 'Customer Reviews (5.0 Google Verified) — Tech Talk Mobile',
      page: 'reviews',
      reviews,
      totalCount,
      ratingCounts,
      averageRating,
      successMsg: req.query.msg || null
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).render('reviews', {
      title: 'Reviews — Tech Talk Mobile',
      page: 'reviews',
      reviews: [],
      totalCount: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageRating: '5.0',
      successMsg: null,
      errorMsg: 'Could not load reviews. Please try again.'
    });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { author_name, rating, comment } = req.body;

    if (!author_name || !rating || !comment) {
      return res.redirect('/reviews?msg=Please+fill+all+review+fields');
    }

    const cleanRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    await db.query(
      `INSERT INTO reviews (author_name, rating, comment, source, review_date, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [author_name.trim(), cleanRating, comment.trim(), 'Website Verified', 'Just now', true]
    );

    res.redirect('/reviews?msg=Thank+you+for+your+valuable+feedback!');
  } catch (error) {
    console.error('Error submitting review:', error);
    res.redirect('/reviews?msg=Could+not+submit+review.+Please+try+again.');
  }
};
