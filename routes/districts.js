/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */

import express from 'express';
import Region from '../models/Region.js';
import District from '../models/District.js';

const router = express.Router();

// get all districts
router.get('/', async (req, res) => {
  try {
    const districts = await District.find().populate('wards');
    return res.status(200).json(districts);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get a district
router.get('/:id', async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('wards');
    return res.status(200).json(district);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get districts of a region with wards
router.get('/:regionId/districts', async (req, res) => {
  try {
    const districts = await District.find({ location: req.params.regionId }).populate('wards');
    return res.status(200).json(districts);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add districts
router.post('/:id', async (req, res) => {
  const savedDistricts = [];
  try {
    req.body.districts.forEach(async (element) => {
      const district = new District({
        districtName: element,
        location: req.params.id,
      });
      // save district
      savedDistricts.push(await district.save());
    });
    // get districts by loctn id
    const districts = await District.find({ _id: req.params.id }, '_id');
    // get only ids of districts
    const districtIds = [];
    districts.forEach((district) => {
      districtIds.push(district._id);
    });
    // update region
    await Region.updateOne({ _id: req.params.id }, {
      $set: { districts: districtIds },
    });
    return res.status(201).json(savedDistricts);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete district
router.delete('/:id', async (req, res) => {
  try {
    const removedDistrict = await District.deleteOne({ _id: req.params.id });
    return res.status(200).json({ removedDistrict });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get wards
router.get('/:id/wards', async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('wards');
    return res.status(200).json(district.wards);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
