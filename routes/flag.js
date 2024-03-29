import express from 'express';
import Flag from '../models/Flag.js';

const router = express.Router();

// get flags
router.get('/', async (req, res) => {
  try {
    // get flags frm db
    const flags = await Flag.find();
    // return
    return res.status(200).json(flags);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// post flag
router.post('/', async (req, res) => {
  try {
    // create flag
    const flag = new Flag({
      value: req.body.value,
    });
    // save
    const savedFlag = await flag.save();
    // return
    return res.status(201).json(savedFlag);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// export
export default router;
