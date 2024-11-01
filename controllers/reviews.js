const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new review
const createReview = async (req, res) => {
    const { product_id, UserID, Rating, Comment } = req.body;
  
    try {
      const newReview = await prisma.reviews.create({
        data: {
          product_id: Number(product_id),
          UserID: Number(UserID),
          Rating: Number(Rating),
          Comment,
          CreatedAt: new Date(),
        },
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.reviews.findMany({
      include: {
        user: true,
        product: true,
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
};

// Update a review by ID
const updateReviews = async (req, res) => {
  const { id } = req.params;
  const { Comment, Rating } = req.body;
  try {
    const updatedReview = await prisma.reviews.update({
      where: { ReviewID: Number(id) },
      data: { Comment, Rating, CreatedAt: new Date() },
    });
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review by ID
const deleteReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReview = await prisma.reviews.delete({
      where: { ReviewID: Number(id) },
    });
    res.status(200).json(deletedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get review by ReviewID
const getReviewsByReviewID = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await prisma.reviews.findUnique({
      where: { ReviewID: Number(id) },
      include: {
        user: true,
        product: true,
      },
    });
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
    } else {
      res.status(200).json(review);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve review' });
  }
};

// Get reviews by UserID
const getReviewsByUserID = async (req, res) => {
  const { userID } = req.params;
  try {
    const reviews = await prisma.reviews.findMany({
      where: { UserID: Number(userID) },
      include: {
        product: true,
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve reviews for the user' });
  }
};

// Get reviews by productID
const getReviewsByProductID = async (req, res) => {
    const { productID } = req.params; // Extract productID from URL params
    try {
      const reviews = await prisma.reviews.findMany({
        where: { product_id: Number(productID) }, // Query by productID
        include: {
          user: {
            include: {
              healthInfo: true, // Include health_info for each user
            },
          },
        },
      });
      res.status(200).json(reviews); // Send back the reviews
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve reviews for the product' });
    }
  };
  

module.exports = {
  createReview,
  getReviews,
  updateReviews,
  deleteReviews,
  getReviewsByReviewID,
  getReviewsByUserID,
  getReviewsByProductID
};
