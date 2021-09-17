/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */

const router = require('express').Router();
const Country = require('../models/Country');
const Region = require('../models/Region');

// get all regions
router.get('/', async (req, res) => {
  try {
    const regions = await Region.find().populate('districts');
    return res.status(200).json(regions);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get a region
router.get('/:id', async (req, res) => {
  try {
    const region = await Region.findById(req.params.id).populate('districts');
    return res.status(200).json(region);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add regions
router.post('/:id', async (req, res) => {
  const savedRegions = [];
  try {
    req.body.regions.forEach(async (element) => {
      const region = new Region({
        regionName: element,
        location: req.params.id,
      });
        // save region
      savedRegions.push(await region.save());
    });
    // get regions by loctn id
    const regions = await Region.find({ _id: req.params.id }, '_id');
    // get only ids of regions
    const regionIds = [];
    regions.forEach((region) => {
      regionIds.push(region._id);
    });
    // update country
    await Country.updateOne({ _id: req.params.id }, {
      $set: { regions: regionIds },
    });
    return res.status(201).json(savedRegions);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
// delete region
router.delete('/:id', async (req, res) => {
  try {
    const removedRegion = await Region.deleteOne({ _id: req.params.id });
    return res.status(200).json({ removedRegion });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get districts
router.get('/:id/districts', async (req, res) => {
  try {
    const region = await Region.findById(req.params.id).populate('districts');
    return res.status(200).json(region.districts);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

module.exports = router;
