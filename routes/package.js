import express from 'express';
import Package from '../models/Package.js';

const router = express.Router();

// get packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find();
    // return packeages
    return res.status(200).json(packages);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// insert packg
router.post('/', async (req, res) => {
  try {
    // create package
    const pkg = new Package({
      key: req.body.key,
      name: req.body.name,
      description: req.body.description,
      amount: req.body.amount,
    });

    const savedPackage = await pkg.save();
    return res.status(201).json({ package: savedPackage });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

export default router;
