/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import express from 'express';
import Amenity from '../models/Amenity.js';

const router = express.Router();

// get all amenities
router.get('/', async (req, res) => {
  try {
    const amenities = await Amenity.find();
    return res.status(200).json(amenities);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add amenity
router.post('/', async (req, res) => {
  const amenity = new Amenity({
    name: req.body.name,
  });
  try {
    const savedAmenity = await amenity.save();
    return res.status(201).json(savedAmenity);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete amenity
router.delete('/:id', async (req, res) => {
  try {
    const deleted = Amenity.deleteOne({ _id: req.params.id });

    return res.status(200).json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// update
router.patch('/:id', async (req, res) => {
  try {
    const updated = Amenity.updateOne({ _id: req.params.id }, {
      $set: { name: req.body.name },
    });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
