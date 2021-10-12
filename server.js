/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { parse } from 'url';
import cron from 'node-cron';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import verifyToken from './routes/verifyToken.js';

// import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listing.js';
import userRoutes from './routes/user.js';
import categoryRoutes from './routes/category.js';
import reviewRoutes from './routes/review.js';
import packageRoutes from './routes/package.js';
import reportRoutes from './routes/report.js';
import flagRoutes from './routes/flag.js';
import filterRoutes from './routes/filter.js';
import countryRoutes from './routes/countrys.js';
import regionRoutes from './routes/regions.js';
import districtRoutes from './routes/districts.js';
import wardRoutes from './routes/wards.js';
import streetRoutes from './routes/streets.js';
import amenityRoutes from './routes/amenity.js';
import Listing from './models/Listing.js';
import User from './models/User.js';
import Review from './models/Review.js';

import favEmitter from './events/myevents.js';

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

const app = express();

const server = http.createServer(app);

// eslint-disable-next-line no-unused-vars
// const expressWs = require('express-ws')(app);

// eslint-disable-next-line no-unused-vars

dotenv.config();

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

// websockets
const existsWs = new WebSocketServer({ noServer: true });
const savedWs = new WebSocketServer({ noServer: true });
const detailsWs = new WebSocketServer({ noServer: true });
const reviewsWs = new WebSocketServer({ noServer: true });

existsWs.on('connection', (ws) => {
  console.log(ws);
  ws.on('message', async (msg) => {
    const obj = JSON.parse(msg);
    console.log(obj);
    if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
      // check for user normally first when user visists the uri
      const user = await User.findById(obj.userId);
      if (user) {
        const exists = user.favourites.includes(obj.listingId);

        ws.send(JSON.stringify(exists));
      } else {
        ws.send(JSON.stringify(false));
      }
      // listen to event
      favEmitter.on('done', (favs) => {
        const exists = favs.includes(obj.listingId);

        ws.send(JSON.stringify(exists));
      });
    } else {
      ws.send(JSON.stringify(false));
    }
  });
});

savedWs.on('connection', (ws) => {
  console.log(ws);
  ws.on('message', async (msg) => {
    // parse msg
    const obj = JSON.parse(msg);
    console.log('parsed msg: %s', obj);
    // if valid id
    if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
      // do it noirmally when user first access the uri
      const user = await User.findOne({ _id: obj.userId }).populate('favourites');

      if (user) {
        let favourites = [];
        favourites = user.favourites;
        ws.send(JSON.stringify(favourites));
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

detailsWs.on('connection', (ws) => {
  ws.on('message', async (msg) => {
    const obj = JSON.parse(msg);
    console.log(obj);
    if (obj.userId.match(/^[0-9a-fA-F]{24}$/)) {
      // check for user normally first when user visists the uri
      const user = await User.findById(obj.userId);
      if (user) {
        const exists = user.favourites.includes(obj.listingId);

        ws.send(JSON.stringify(exists));
      } else {
        ws.send(JSON.stringify(false));
      }
      // listen to event
      favEmitter.on('done', (favs) => {
        const exists = favs.includes(obj.listingId);

        ws.send(JSON.stringify(exists));
      });
    } else {
      ws.send(JSON.stringify(false));
    }
  });
});

reviewsWs.on('connection', (ws) => {
  console.log('websocket inititaed');
  ws.on('message', async (msg) => {
    const obj = JSON.parse(msg);
    console.log(obj.id);
    // store reviewsWs
    // const reviewsWs = [];
    // check if id is objectId
    if (obj.id.match(/^[0-9a-fA-F]{24}$/)) {
      // do it normal
      const reviews = await Review.find({ listing: mongoose.Types.ObjectId(obj.id) });
      console.log(reviews);
      if (reviews) {
        // send
        ws.send(JSON.stringify(reviews));
      } else {
        ws.send(JSON.stringify([]));
      }
    } else {
      ws.send(JSON.stringify([]));
    }
  });
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url);

  if (pathname === '/user/saved/exists') {
    existsWs.handleUpgrade(request, socket, head, (ws) => {
      existsWs.emit('connection', ws, request);
    });
  } else if (pathname === '/user/saved/exists/details') {
    detailsWs.handleUpgrade(request, socket, head, (ws) => {
      detailsWs.emit('connection', ws, request);
    });
  } else if (pathname === '/user/saved') {
    savedWs.handleUpgrade(request, socket, head, (ws) => {
      savedWs.emit('connection', ws, request);
    });
  } else if (pathname === '/review') {
    reviewsWs.handleUpgrade(request, socket, head, (ws) => {
      reviewsWs.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

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
server.listen(process.env.PORT || 3000, (err) => {
  if (err) console.log(err);
  console.log(`server is running at port ${process.env.PORT || 3000}`);
});
