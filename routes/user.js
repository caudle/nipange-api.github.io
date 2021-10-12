/* eslint-disable consistent-return */
/* eslint-disable prefer-template */
/* eslint-disable no-underscore-dangle */

import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v1 as uuidv1 } from 'uuid';
import AWS from 'aws-sdk';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import favEmitter from '../events/myevents.js';

const router = express.Router();

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
});

const dpFilter = (req, file, callback) => {
  callback(null, true);
};

// upload dp
const uploadDp = multer({
  storage: multerS3({
    s3,
    bucket: 'nipange-bucket/profiles',
    acl: 'public-read',
    key: (request, file, cb) => {
      cb(null, uuidv1() + file.originalname);
    },
  }),
  fileFilter: dpFilter,
});

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    // return users
    return res.status(200).json({ user: users });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // return users
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// user listings
router.get('/:id/listing', async (req, res) => {
  try {
    // get user
    const user = await User.findById(req.params.id).populate('listings');
    let listings = [];
    listings = user.listings;
    // return listings
    return res.status(200).json(listings);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// premium user listings
router.get('/:id/listings/premium', async (req, res) => {
  try {
    // get user
    const user = await User.findById(req.params.id).populate('listings');
    let listings = [];
    user.listings.forEach((listing) => {
      if (listing.package.key === 1) {
        listing.push(listing);
      }
    });
    listings = user.listings;
    return res.status(200).json(listings);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// update dp
router.patch('/dp/:id', uploadDp.single('dp'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const oldDp = user.dp;
    // delete old dp frm space
    if (oldDp.length > 2) {
      const splits = oldDp.split('profiles/');
      // get old dp filename
      const key = splits[1];

      const params = {
        Bucket: 'nipange-bucket/profiles',
        Key: key,
      };
      await s3.deleteObject(params, (err) => {
        if (err) return res.status(400).json({ error: err });
      });
    }

    // get url & update dp
    const url = `${req.file.location.slice(0, 28)}cdn.${req.file.location.slice(28)}`;
    await User.updateOne({ _id: req.params.id }, {
      $set: { dp: url },
    });
    // get update user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// update user
router.patch('/:id', async (req, res) => {
  try {
    const email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).json({ error: 'email not available' });
    const phone = await User.findOne({ phone: req.body.phone });
    if (phone) return res.status(400).json({ error: 'phone number not available' });
    const username = await User.findOne({ username: req.body.username });
    if (username) return res.status(400).json({ error: 'username not available' });
    await User.updateOne({ _id: req.params.id }, {
      $set: {
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
      },
    });
    // get updated user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// switch user type
router.patch('/type/:id', async (req, res) => {
  console.log('switching');
  try {
    await User.updateOne({ _id: req.params.id }, {
      $set: {
        type: req.body.type,
      },
    });
    // get updated user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add fav listing
router.patch('/saved/:id', async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id }, {
      $addToSet: { favourites: [req.body.listingId] },
    });

    // add event
    const user = await User.findById(req.params.id);
    favEmitter.emit('done', user.favourites);
    // add likes
    await Listing.updateOne({ _id: req.body.listingId }, {
      $inc: { likes: 1 },
    });

    return res.status(200).json();
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete fav listing
router.delete('/saved/:id', async (req, res) => {
  try {
    // delete
    await User.updateOne({ _id: req.params.id }, {
      $pull: { favourites: req.body.listingId },
    });
    // add event
    const user = await User.findById(req.params.id);
    favEmitter.emit('done', user.favourites);
    // delete likes
    await Listing.updateOne({ _id: req.body.listingId }, {
      $inc: { likes: -1 },
    });
    return res.status(200).json();
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});


// get user package
router.get('/:id/package', async (req, res) => {
  try {
    // find user
    const user = await User.findById(req.params.id);
    const userPackage = user.package;

    return res.status(200).json(userPackage);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

export default router;
