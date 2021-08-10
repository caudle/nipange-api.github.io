/* eslint-disable prefer-template */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const router = require('express').Router();
const multer = require('multer');
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');

// dp storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/dp');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toISOString() + file.originalname);
  },
});

// upload dp
const upload = multer({
  storage,
});

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    // return users
    return res.status(200).json({ user: users });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // return users
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// user listings
router.get('/:id/listing', async (req, res) => {
  try {
    // get user
    const user = await User.findById(req.params.id);
    const listings = [];
    // get all listng frm user
    user.listings.forEach((id) => {
      listings.push(Listing.findById(id));
    });
    // return listings
    return res.status(200).json(await Promise.all(listings));
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// update dp
router.patch('/dp/:id', upload.single('dp'), async (req, res) => {
  try {
    // update dp
    await User.updateOne({ _id: req.params.id }, {
      $set: { dp: req.file.path },
    });
    // get update user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// update user
router.patch('/:id', async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id }, {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
      },
    });
    // get updated user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// switch user type
router.patch('/type/:id', async (req, res) => {
  console.log('switching');
  try {
    await User.updateOne({ _id: req.params.id }, {
      $set: {
        type: req.body.type,
      },
    });
    // get updated user
    const updatedUser = await User.findById(req.params.id);
    // return user
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// to be removed
// check if saved
router.ws('/saved/exis', async (ws) => {
  ws.on('message', async (message) => {
    console.log('received: %s', message);
    const obj = JSON.parse(message);
    console.log('parsed msg: %s', obj);
    // get user
    if (!obj.update) {
      if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
        const user = await User.findById(obj.userId);
        if (user) {
          const result = user.favourites.includes(obj.listingId);
          ws.send(JSON.stringify({
            exists: result,

          }));
        } else {
          ws.send(JSON.stringify({
            exists: false,

          }));
        }
      } else {
        ws.send(JSON.stringify({
          exists: false,

        }));
      }
    } else {
      // add
      console.log('updating......');
      if (obj.add) {
        console.log('adding......');
        await User.updateOne({ _id: obj.userId }, {
          $addToSet: { favourites: obj.listingId },
        });
        const data = {
          exists: true,

        };
        ws.send(JSON.stringify(data));
      } if (obj.delete) {
        console.log('deleting......');
        // delete
        await User.updateOne({ _id: obj.userId }, {
          $pull: { favourites: obj.listingId },
        });
        const data = {
          exists: false,

        };
        ws.send(JSON.stringify(data));
      }
    }
  });
  console.log('client connected');
});

// check if saved
router.ws('/saved/exists', async (ws) => {
  console.log('websocket inititated');

  ws.on('message', async (msg) => {
    const obj = JSON.parse(msg);
    console.log(obj);
    if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
      // check for user normally first when user visists the uri
      const user = await User.findById(obj.userId);
      if (user) {
        const exists = user.favourites.includes(obj.listingId);
        console.log(exists);
        ws.send(JSON.stringify(exists));
      } else {
        ws.send(JSON.stringify(false));
      }
      // watch user collection
      // filter only user docs with user id
      const pipeline = [{
        $match: {
          operationType: 'update',
          'fullDocument._id': mongoose.Types.ObjectId(obj.userId),
        },
      }];
      const options = { fullDocument: 'updateLookup' };
      // register change stream
      const changeStream = User.watch(pipeline, options);
      changeStream.on('change', (data) => {
        console.log('exists data: $' + data);
        console.log('stream' + obj.listingId);
        const favs = [];
        // converting array into array of strings
        data.fullDocument.favourites.forEach((e) => {
          favs.push(`${e}`);
        });
        const exists = favs.includes(obj.listingId);
        console.log(`exists: ${exists}`);
        ws.send(JSON.stringify(exists));
        console.log(`sent yet${exists}`);
      });
    } else {
      ws.send(JSON.stringify(false));
    }
  });
});

// add fav listing
router.patch('/saved/:id', async (req, res) => {
  console.log('adding favs');
  console.log(req.params.id);
  console.log(req.body.listingId);
  try {
    await User.updateOne({ _id: req.params.id }, {
      $addToSet: { favourites: [req.body.listingId] },
    });

    return res.status(200).json();
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// delete fav listing
router.delete('/saved/:id', async (req, res) => {
  console.log('delete favs');
  try {
    // delete
    await User.updateOne({ _id: req.params.id }, {
      $pull: { favourites: req.body.listingId },
    });

    return res.status(200).json();
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

// get all saved
router.ws('/saved', async (ws) => {
  console.log('connected');
  ws.on('message', async (msg) => {
    // parse msg
    const obj = JSON.parse(msg);
    console.log('parsed msg: %s', obj);
    // if valid id
    if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
      // do it noirmally when user first access the uri
      const user = await User.findById(obj.userId);
      if (user) {
        const favourites = [];
        user.favourites.forEach((id) => {
          favourites.push(Listing.findById(id));
        });
        ws.send(JSON.stringify(await Promise.all(favourites)));
      } else ws.send(JSON.stringify([]));

      // watch user collection
      const pipeline = [{
        $match: {
          operationType: 'update',
          'fullDocument._id': mongoose.Types.ObjectId(obj.userId),
        },
      }];
      const options = { fullDocument: 'updateLookup' };
      // register change stream
      const changeStream = User.watch(pipeline, options);
      changeStream.on('change', async (data) => {
        const favourites = [];
        console.log(`saved data: ${data}`);
        data.fullDocument.favourites.forEach((id) => {
          favourites.push(Listing.findById(id));
        });
        ws.send(JSON.stringify(await Promise.all(favourites)));
      });
    } else {
      ws.send(JSON.stringify([]));
    }
  });
});

// get user package
router.get('/:id/package', async (req, res) => {
  try {
    // find user
    const user = await User.findById(req.params.id);
    const userPackage = user.package;
    console.log(userPackage);
    return res.status(200).json(userPackage);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

module.exports = router;
