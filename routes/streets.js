/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import Ward from '../models/Ward.js';
import Street from '../models/Street.js';

const router = express.Router();

// get all streets
router.get('/', async (req, res) => {
  try {
    const streets = await Street.find();
    return res.status(200).json(streets);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get a street
router.get('/:id', async (req, res) => {
  try {
    const street = await Street.findById(req.params.id);
    return res.status(200).json(street);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add street
router.post('/:id', async (req, res) => {
  const savedStreets = [];
  try {
    req.body.streets.forEach(async (element) => {
      const street = new Street({
        streetName: element,
        location: req.params.id,
      });
      // save street
      savedStreets.push(await street.save());
    });
    // get streets by loctn id
    const streets = await Street.find({ _id: req.params.id }, '_id');
    // get only ids of streets
    const streetIds = [];
    streets.forEach((street) => {
      streetIds.push(street._id);
    });
    // update ward
    await Ward.updateOne({ _id: req.params.id }, {
      $set: { streets: streetIds },
    });
    return res.status(201).json(savedStreets);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
// delete street
router.delete('/:id', async (req, res) => {
  try {
    const removedStreet = await Street.deleteOne({ _id: req.params.id });
    return res.status(200).json({ removedStreet });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
