import express from 'express';
import Report from '../models/Report.js';

const router = express.Router();

// get reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find();
    // return
    return res.status(200).json(reports);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// post report
router.post('/', async (req, res) => {
  try {
    // create report
    const report = new Report({
      email: req.body.email,
      type: req.body.type,
      userType: req.body.userType,
      comment: req.body.comment,
    });
    // save
    const savedReport = await report.save();
    // return
    return res.status(201).json(savedReport);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// export
export default router;
