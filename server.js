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

const Listing = require('./models/Listing');

dotEnv.config();

// connect to db
mongoose.connect(process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsCAFile: './ca-certificate.crt',
  },
  (err) => {
    if (err)console.log(err);
    console.log(`database connected: ${process.env.DATABASE_URL}`);
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

// verify token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  console.log(`header: ${bearerHeader}`);
  if (typeof bearerHeader !== 'undefined') {
    const splits = bearerHeader.split(' ');
    const bearerToken = splits[1];
    console.log(`token: ${bearerToken}`);
    if (bearerToken === process.env.API_KEY) {
      next();
    } else {
      res.status(403).json({ error: 'invalid token' });
    }
  } else {
    res.status(403).json({ error: 'invalid token' });
  }
};

// api middlewares

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));
app.use(cors());
app.use(verifyToken);

// home route
app.get('/', verifyToken, (req, res) => {
  res.send('<h1>Welcome to nipange api</h1>');
});

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

// change listing plans evry day at 23 59
cron.schedule('59 23 * * *', async () => {
  console.log('Running Cron Job');
  const today = new Date();
  const todayTime = today.getTime();
  const listings = await Listing.find({ 'package.key': 1 });

  if (listings) {
    for (let i = 0; i < listings.length; i = 1 + 1) {
      const listing = listings[i];

      // get user expire date premium plan
      const expireAt = listing.package.expireAt.getTime();
      if (todayTime >= expireAt) {
        console.log('changing listing to free package');
        // premium plan expired
        // update user plan to free
        Listing.updateOne({ _id: listing._id }, {
          $set: {
            package: {
              key: 2, name: 'free', description: 'upgrade to premium to enjoy exclusive features', amount: 0, createdAt: Date.now(),
            },
          },
        }, (err) => {
          if (err) {
            console.log(err);
          }
          console.log(`${listing._id}: listing package changed`);
        });
      }
    }
  }
});
// start server and listen
app.listen(5000, (err) => {
  if (err) console.log(err);
  console.log('server started at 5000');
});
