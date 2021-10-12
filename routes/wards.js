/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */

import express from 'express';
import District from '../models/District.js';
import Ward from '../models/Ward.js';

const router = express.Router();

// get all wards
router.get('/', async (req, res) => {
  try {
    const wards = await Ward.find().populate('streets');
    return res.status(200).json(wards);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get a ward
router.get('/:id', async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id).populate('streets');
    return res.status(200).json(ward);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get wards of a district with streets
router.get('/:districtId/wards', async (req, res) => {
  try {
    const wards = await Ward.find({ location: req.params.districtId }).populate('streets');
    return res.status(200).json(wards);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add wards
router.post('/:id', async (req, res) => {
  const savedWards = [];
  try {
    req.body.wards.forEach(async (element) => {
      const ward = new Ward({
        wardName: element,
        location: req.params.id,
      });
      // save ward
      savedWards.push(await ward.save());
    });
    // get wards by loctn id
    const wards = await Ward.find({ _id: req.params.id }, '_id');
    // get only ids of wards
    const wardIds = [];
    wards.forEach((ward) => {
      wardIds.push(ward._id);
    });
    // update district
    await District.updateOne({ _id: req.params.id }, {
      $set: { wards: wardIds },
    });
    return res.status(201).json(savedWards);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete ward
router.delete('/:id', async (req, res) => {
  try {
    const removedWard = await Ward.deleteOne({ _id: req.params.id });
    // TODO
    // DELETE WARD FROM DISTRICT
    return res.status(200).json({ removedWard });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get streets
router.get('/:id/streets', async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id).populate('streets');
    return res.status(200).json(ward.streets);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
