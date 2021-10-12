/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v1 as uuidv1 } from 'uuid';
import AWS from 'aws-sdk';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import {
  validatePropertyType, validateLocation, validateAmenities,
  validatePrice,
} from './validation.js';

const router = express.Router();

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
});

const imageFilter = (req, file, callback) => {
  callback(null, true);
};

const videoFilter = (req, file, callback) => {
  callback(null, true);
};

const uploadImages = multer({
  storage: multerS3({
    s3,
    bucket: 'nipange-bucket/images',
    acl: 'public-read',
    key: (request, file, cb) => {
      console.log(file);
      cb(null, uuidv1() + file.originalname);
    },
  }),
  fileFilter: imageFilter,
});

const uploadVideos = multer({
  storage: multerS3({
    s3,
    bucket: 'nipange-bucket/videos',
    acl: 'public-read',
    key: (request, file, cb) => {
      console.log(file);
      cb(null, uuidv1() + file.originalname);
    },
  }),
  fileFilter: videoFilter,
});

// all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find();
    // return listings
    return res.status(200).json(listings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// all listings by type
router.get('/:type', async (req, res) => {
  // get all listings with premium first
  // premium =1
  // ascending order = 1
  try {
    const listings = await Listing.find({ propertyType: req.params.type, complete: 6 }).sort({ _id: -1, 'package.key': 1 });
    // return listings
    return res.status(200).json(listings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// add property type
router.post('/property', async (req, res) => {
  const completed = 1;
  // validate details
  const { error } = validatePropertyType(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    // if listing already exist, only upadte it
    // check if id can be coverted to objectid
    if (req.body.listingId.match(/^[0-9a-fA-F]{24}$/)) {
      const exists = await Listing.exists({ _id: req.body.listingId });
      if (exists) {
        await Listing.updateOne({ _id: req.body.listingId }, {
          $set: {
            name: req.body.name,
            propertyType: req.body.propertyType,
            hostId: req.body.hostId,
            bathroom: req.body.bathroom,
            bedroom: req.body.bedroom,
            size: req.body.size,
            building: req.body.building,
          },
        });
        const updatedListing = await Listing.findById(req.body.listingId);
        // return updated listing
        return res.status(201).json(updatedListing);
      }
    }
    // if listing doesnt exist, create one
    // create listing in db
    const listing = new Listing({
      name: req.body.name,
      propertyType: req.body.propertyType,
      hostId: req.body.hostId,
      bathroom: req.body.bathroom,
      bedroom: req.body.bedroom,
      size: req.body.size,
      building: req.body.building,
      complete: completed,
    });

    const savedListing = await listing.save();
    // update user with listing
    await User.updateOne({ _id: req.body.hostId }, {
      $addToSet: { listings: [savedListing._id] },
      $set: { type: 'host' },
    });
    // return saved listing
    return res.status(201).json(savedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// add location
router.patch('/location/:id', async (req, res) => {
  let completed = 2;
  // validate details
  const { error } = validateLocation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // update listing
  try {
    // check if already saved
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const savedListing = await Listing.findById(req.params.id);
      if (savedListing && savedListing.complete > 2) {
        completed = savedListing.complete;
      }
    }
    await Listing.updateOne({ _id: req.params.id }, {
      $set: { location: req.body.location, complete: completed },
    });
    // get listing
    const updatedListing = await Listing.findById(req.params.id);
    // return listing
    return res.status(201).json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// add amenities
router.patch('/amenities/:id', async (req, res) => {
  let completed = 3;
  // validate details
  const { error } = validateAmenities(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // update listing
  try {
    // check if already saved
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const savedListing = await Listing.findById(req.params.id);
      if (savedListing && savedListing.complete > 3) {
        completed = savedListing.complete;
      }
    }
    await Listing.updateOne({ _id: req.params.id }, {
      $set: { amenities: req.body.amenities, complete: completed },
    });
    // get listing
    const updatedListing = await Listing.findById(req.params.id);
    // return listing
    return res.status(201).json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// add photos

router.patch('/photos/:id', uploadImages.array('images', 4), async (req, res) => {
  let completed = 4;
  // update listing
  try {
    // check if already saved
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const savedListing = await Listing.findById(req.params.id);
      if (savedListing && savedListing.complete > 4) {
        completed = savedListing.complete;
      }
    }

    // create an array with only path names
    const photos = [];
    // fill the array with paths

    req.files.forEach((image) => {
      const url = `${image.location.slice(0, 28)}cdn.${image.location.slice(28)}`;
      photos.push(url);
    });
    await Listing.updateOne({ _id: req.params.id }, {
      $addToSet: { photos },
      $set: { complete: completed },
    });

    // get listing
    const updatedListing = await Listing.findById(req.params.id);
    // return listing
    return res.status(201).json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// delete photos
router.delete('/photos/:id', async (req, res) => {
  try {
    // delete photos from bucket
    req.body.images.forEach(async (url) => {
      const splits = url.split('images/');
      const key = splits[1];
      console.log(key);
      const params = {
        Bucket: 'nipange-bucket/images',
        Key: key,
      };
      s3.deleteObject(params, (err) => {
        if (err) return res.status(400).json({ error: err });
      });
    });

    await Listing.updateOne({ _id: req.params.id }, {
      $pullAll: { photos: req.body.images },
    });

    return res.status(200).json('image deleted');
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add videos
router.patch('/videos/:id', uploadVideos.array('videos', 2), async (req, res) => {
  let completed = 5;
  // update listing
  try {
    // check if already saved
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const savedListing = await Listing.findById(req.params.id);
      if (savedListing && savedListing.complete > 5) {
        completed = savedListing.complete;
      }
    }

    // create an array with only path names
    const videos = [];
    // fill the array with paths
    req.files.forEach((video) => {
      const url = `${video.location.slice(0, 28)}cdn.${video.location.slice(28)}`;
      videos.push(url);
    });
    // updt listing
    await Listing.updateOne({ _id: req.params.id }, {
      $addToSet: { videos },
      $set: { complete: completed },
    });
    // get listing
    const updatedListing = await Listing.findById(req.params.id);
    // return listing
    return res.status(201).json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// delete videos
router.delete('/videos/:id', async (req, res) => {
  try {
    // delete photos from bucket
    req.body.videos.forEach(async (url) => {
      const splits = url.split('videos/');
      const key = splits[1];
      console.log(key);
      const params = {
        Bucket: 'nipange-bucket/videos',
        Key: key,
      };
      s3.deleteObject(params, (err) => {
        if (err) return res.status(400).json({ error: err });
      });
    });
    await Listing.updateOne({ _id: req.params.id }, {
      $pullAll: { videos: req.body.videos },
    });
    return res.status(200).json('video deleted');
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add price
router.patch('/price/:id', async (req, res) => {
  let completed = 6;
  // validate details
  const { error } = validatePrice(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // update listing
  try {
    // check if already saved
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const savedListing = await Listing.findById(req.params.id);
      if (savedListing && savedListing.complete > 6) {
        completed = savedListing.complete;
      }
    }
    await Listing.updateOne({ _id: req.params.id }, {
      $set: {
        price: req.body.price,
        description: req.body.description,
        fee: req.body.fee,
        terms: req.body.terms,
        complete: completed,
      },
    });
    // get listing
    const updatedListing = await Listing.findById(req.params.id);
    // return listing
    return res.status(201).json(updatedListing);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// get search results
router.get('/search/:search', async (req, res) => {
  const search = decodeURI(req.params.search);
  try {
    const listings = await Listing.find({
      $or: [
        { name: search },
        { building: search },
        { 'location.country': search },
        { 'location.region': search },
        { 'location.district': search },
        { 'location.street': search },
      ],
    }).limit(20);
    // return
    return res.status(200).json(listings);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// get filter results
router.post('/filter', async (req, res) => {
  try {
    // create query
    console.log(req.amenities);
    const query = {};
    if (req.body.type) {
      query.propertyType = req.body.type;
    }
    if (req.body.price) {
      query.price = { $gte: req.body.price[0], $lte: req.body.price[1] };
    }
    if (req.body.bed) {
      query.bedroom = req.body.bed;
    }
    if (req.body.bath) {
      query.bathroom = req.body.bath;
    }
    if (req.body.terms) {
      query.terms = req.body.terms;
    }
    if (req.body.size) {
      query.size = { $gte: req.body.size[0], $lte: req.body.size[1] };
    }
    if (req.body.amenities) {
      console.log('im in');
      query.amenities = { $all: req.body.amenities };
    }
    const listings = await Listing.find(query).limit(20);
    // return
    return res.status(200).json(listings);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// more like this
router.post('/more', async (req, res) => {
  try {
    const listings = await Listing.find({
      $and: [
        { propertyType: req.body.type },
        { 'location.district': req.body.district },
        { _id: { $ne: req.body.id } },
      ],
    }).limit(6);
    // return
    return res.status(200).json(listings);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// delete listing
router.delete('/:id', async (req, res) => {
  try {
    // delete media frm space
    const listing = await Listing.findById(req.params.id);
    if (listing.photos.length > 0) {
      listing.photos.forEach((url) => {
        const splits = url.split('images/');
        const key = splits[1];
        console.log(key);
        const params = {
          Bucket: 'nipange-bucket/images',
          Key: key,
        };
        s3.deleteObject(params, (err) => {
          if (err) return res.status(400).json({ error: err });
        });
      });
    }
    if (listing.videos.length > 0) {
      listing.videos.forEach((url) => {
        const splits = url.split('videos/');
        const key = splits[1];
        console.log(key);
        const params = {
          Bucket: 'nipange-bucket/videos',
          Key: key,
        };
        s3.deleteObject(params, (err) => {
          if (err) return res.status(400).json({ error: err });
        });
      });
    }
    // delete listing frm db
    const deleted = await Listing.deleteOne({ _id: req.params.id });
    await User.updateOne({ _id: req.body.userId }, {
      $pull: { listings: req.params.id, favourites: req.params.id },
    });
    // see if user has listings
    const user = await User.findById(req.body.userId);
    if (user.listings.length === 0) {
      // update user to customer
      await User.updateOne({ _id: req.body.userId }, {
        $set: { type: 'customer' },
      });
    }
    // return
    return res.status(200).json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add views
router.patch('/views/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await Listing.updateOne({ _id: id }, {
      $inc: { views: 1 },
    });
    return res.status(200).json(updatedListing);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

export default router;
