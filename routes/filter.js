const router = require('express').Router();
const Filter = require('../models/Filter');

// get all
router.get('/', async (req, res) => {
  try {
    const filters = await Filter.find();
    // return
    return res.status(200).json(filters);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get specific filter
router.get('/:filter', async (req, res) => {
  try {
    // find filter
    const filter = await Filter.findOne({ name: req.params.filter });
    // return
    return res.status(200).json(filter);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// create filter
router.post('/', async (req, res) => {
  try {
    // create
    const filter = new Filter({
      name: req.body.name,
      values: req.body.values,
    });
    // save
    const savedFilter = await filter.save();
    // return
    return res.status(201).json(savedFilter);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// update filter
router.patch('/:id', async (req, res) => {
  try {
    // update
    const updated = await Filter.updateOne({ _id: req.params.id }, {
      $set: { name: req.body.name },
      $addToSet: { values: req.body.values },
    });
    // return
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete filter
router.delete('/:id', async (req, res) => {
  try {
    // delete
    const deleted = await Filter.deleteOne({ _id: req.params.id });
    // return
    return res.status(200).json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
// export
module.exports = router;
