/* eslint-disable prefer-template */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
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

// get all reviews for a listing
/* router.ws('/', async (ws) => {
  console.log('websocket inititaed');
  ws.on('message', async (msg) => {
    const obj = JSON.parse(msg);
    console.log(obj.id);
    // store reviews
    // const reviews = [];
    // check if id is objectId
    if (obj.id.match(/^[0-9a-fA-F]{24}$/)) {
      // do it normal
      const reviews = await Review.find({ listing: mongoose.Types.ObjectId(obj.id) });
      console.log(reviews);
      if (reviews) {
        // send
        ws.send(JSON.stringify(reviews));
      } else {
        ws.send(JSON.stringify([]));
      }
    } else {
      ws.send(JSON.stringify([]));
    }
  });
}); */

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
