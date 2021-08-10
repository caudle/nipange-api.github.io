/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const router = require('express').Router();
const multer = require('multer');

const {
  validatePropertyTYpe, validateLocation, validateAmenities,
  validatePrice,
} = require('./validation');
const Listing = require('../models/Listing');
const User = require('../models/User');

const imageStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/videos');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
});

const imageFilter = (req, file, callback) => {
  callback(null, true);
};

const videoFilter = (req, file, callback) => {
  callback(null, true);
};

const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
});
const uploadVideos = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
});

// all listings
router.get('/', async (req, res) => {
  // get all listings with premium first
  // premium =1
  // ascending order = 1
  try {
    const listings = await Listing.find({ complete: 6 }).sort({ 'package.key': 1 });
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
  const { error } = validatePropertyTYpe(req.body);
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
    // get user plan
    const user = await User.findById({ _id: req.body.hostId });
    const userPackage = user.package;
    // create listing in db
    const listing = new Listing({
      name: req.body.name,
      propertyType: req.body.propertyType,
      hostId: req.body.hostId,
      bathroom: req.body.bathroom,
      bedroom: req.body.bedroom,
      size: req.body.size,
      building: req.body.building,
      package: userPackage,
      complete: completed,
    });

    const savedListing = await listing.save();
    // update user with listing
    await User.updateOne({ _id: req.body.hostId }, {
      $addToSet: { listings: [savedListing._id] },
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
      photos.push(image.path);
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
      videos.push(video.path);
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

// specific prop type
router.get('/property/:type', async (req, res) => {
  try {
    const listings = await Listing.find({ propertyType: req.params.type });
    // return listings
    return res.status(200).json(listings);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// get search results
router.get('/search/:search', async (req, res) => {
  const name = decodeURI(req.params.search);
  console.log(name);
  try {
    const listings = await Listing.find({
      $or: [
        { name },
        { 'location.country': req.params.search },
        { 'location.region': req.params.search },
        { 'location.district': req.params.search },
        { 'location.street': req.params.search },
      ],
    });
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
    const listings = await Listing.find(query);
    // return
    return res.status(200).json(listings);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

module.exports = router;
