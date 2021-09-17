/* eslint-disable linebreak-style */

const router = require('express').Router();
const Country = require('../models/Country');

// get all countries
router.get('/', async (req, res) => {
  try {
    const countrys = await Country.find().populate('regions');
    return res.status(200).json(countrys);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add country
router.post('/', async (req, res) => {
  const country = new Country({
    countryName: req.body.countryName,
  });
  try {
    const savedCountry = await country.save();
    return res.status(201).json({ savedCountry });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get coiuntry by id
router.get('/:id', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id).populate('regions');
    return res.status(200).json(country);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete country
router.delete('/:id', async (req, res) => {
  try {
    const removedCountry = await Country.deleteOne({ _id: req.params.idd });
    return res.status(200).json(removedCountry);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get regions of a country
router.get('/:id/regions', async (req, res) => {
  try {
    const country = await Country.findById(req.params.id).populate('regions');
    return res.status(200).json(country.regions);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

module.exports = router;
