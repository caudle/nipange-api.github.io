import express from 'express';
import multer from 'multer';
import fs from 'fs'; // file system
import { promisify } from 'util';
import Category from '../models/Category.js';

const router = express.Router();

const unlinkAsync = promisify(fs.unlink);

// storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/category');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
});

// upload image
const upload = multer({
  storage,
});

// get all cats
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    // return them
    return res.status(200).json(categories);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// add cats

router.post('/', upload.single('image'), async (req, res) => {
  try {
    // create cat model
    const category = new Category({
      name: req.body.name,
      image: req.file.path,
      description: req.body.description,
    });
    // save
    const savedCategory = await category.save();
    // return it
    return res.status(201).json(savedCategory);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// update

router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    await Category.updateOne({ _id: req.params.id }, {
      $set: {
        name: req.body.name,
        image: req.file.path,
        description: req.body.description,
      },
    });
    // get update cat
    const updatedCategory = await Category.findById(req.params.id);
    // return cat
    return res.status(200).json(updatedCategory);
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    await Category.deleteOne({ _id: req.params.id });
    // delete file on server
    await unlinkAsync(category.image);
    return res.status(200).json('deleted');
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});
export default router;
