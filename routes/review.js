/* eslint-disable prefer-template */
/* eslint-disable no-underscore-dangle */

import express from 'express';
import Review from '../models/Review.js';
import Listing from '../models/Listing.js';

const router = express.Router();

// to be removed
// get all reviews
router.post('/', async (req, res) => {
  try {
    const reviews = [];

    req.body.ids.forEach((id) => {
      reviews.push(Review.findById(id));
    });

    // return reviews
    return res.status(200).json(await Promise.all(reviews));
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// store user review
router.post('/:userId', async (req, res) => {
  try {
    // create review model
    const review = new Review({
      text: req.body.text,
      rate: req.body.rate,
      user: req.body.user,
      listing: req.body.listing,
    });
      // save
    const savedReview = await review.save();
    // add review id to listing
    await Listing.updateOne({ _id: req.body.listingId }, {
      $addToSet: { reviews: savedReview._id },
    });
    // return it
    return res.status(201).json('ok');
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
