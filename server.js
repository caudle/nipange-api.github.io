/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const express = require('express');

const app = express();

// eslint-disable-next-line no-unused-vars
const expressWs = require('express-ws')(app);

const cron = require('node-cron');

const cors = require('cors');

const mongoose = require('mongoose');

const dotEnv = require('dotenv');

const User = require('./models/User');
const Listing = require('./models/Listing');

dotEnv.config();

// connect to db
mongoose.connect(process.env.DB_CONNECTION,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log(err);
    console.log('database connected');
  });

// import routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listing');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const reviewRoutes = require('./routes/review');
const packageRoutes = require('./routes/package');
const reportRoutes = require('./routes/report');
const flagRoutes = require('./routes/flag');
const filterRoutes = require('./routes/filter');
const countryRoutes = require('./routes/countrys');
const regionRoutes = require('./routes/regions');
const districtRoutes = require('./routes/districts');
const wardRoutes = require('./routes/wards');
const streetRoutes = require('./routes/streets');
const amenityRoutes = require('./routes/amenity');

// home route
app.get('/', (req, res) => {
  res.send('<h1>Welcome to nipange api</h1>');
});

// api middlewares

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(cors());

// route middlewares
app.use('/user/auth', authRoutes);
app.use('/listing', listingRoutes);
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/review', reviewRoutes);
app.use('/package', packageRoutes);
app.use('/report', reportRoutes);
app.use('/flag', flagRoutes);
app.use('/filter', filterRoutes);
app.use('/location/country', countryRoutes);
app.use('/location/region', regionRoutes);
app.use('/location/district', districtRoutes);
app.use('/location/ward', wardRoutes);
app.use('/location/street', streetRoutes);
app.use('/amenity', amenityRoutes);
app.use('/public/images', express.static('public/images'));
app.use('/public/videos', express.static('public/videos'));
app.use('/public/dp', express.static('public/dp'));
app.use('/public/category', express.static('public/category'));

// change user plans evry day at 23 59
cron.schedule('59 23 * * *', async () => {
  console.log('Running Cron Job');
  const today = new Date();
  const todayTime = today.getTime();
  const users = await User.find({ 'package.key': 1 });

  if (users) {
    for (let i = 0; i < users.length; i = 1 + 1) {
      const user = users[i];

      // get user expire date premium plan
      const expireAt = user.package.expireAt.getTime();
      if (todayTime >= expireAt) {
        console.log('changing user to free package');
        // premium plan expired
        // update user plan to free
        User.updateOne({ _id: user._id }, {
          $set: {
            package: {
              key: 2, name: 'free', description: 'upgrade to premium to enjoy exclusive features', amount: 0, createdAt: Date.now(),
            },
          },
        }, (err) => {
          if (err) {
            console.log(err);
          }
          console.log(`${user.id}: user package changed`);
          // update all user listings to free
          user.listings.forEach(async (id) => {
            await Listing.updateOne({ _id: id }, {
              $set: {
                package: {
                  key: 2, name: 'free', description: 'upgrade to premium to enjoy exclusive features', amount: 0, createdAt: Date.now(),
                },
              },
            });
            console.log(` listing ${id}: package changed`);
          });
        });
      }
    }
  }
});
// start server and listen
app.listen(8080, (err) => {
  if (err) console.log(err);
  console.log('server started at 5000');
});
