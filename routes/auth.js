/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
const router = require('express').Router();

const bycrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const { validateRegister, validateLogin } = require('./validation');

const User = require('../models/User');

// register user
router.post('/register', async (req, res) => {
  // validate details
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // check if email exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({ error: 'email already exists' });
  // hashing password
  const salt = await bycrypt.genSalt(10);
  const hashedPassword = await bycrypt.hash(req.body.password, salt);
  // create user in db
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    email: req.body.email,
    username: req.body.username,
    password: hashedPassword,
    device: req.body.device,
    isEmailVerified: req.body.isEmailVerified,
    isPhoneVerified: req.body.isPhoneVerified,
    listings: req.body.listings,
    dp: req.body.dp,
    type: req.body.type,
  });
  try {
    const savedUser = await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    // return user and token
    return res.status(201).json({ user: savedUser, token });
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// login user
router.post('/login', async (req, res) => {
  // validate login details
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // check if user exists
  const user = await User.findOne({ email: req.body.login });
  if (!user) return res.status(400).json({ error: 'user not found' });
  // validate password
  const validPassword = await bycrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'incorrect password or email' });
  // create auth token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  // return user and token
  return res.status(200).json({ user, token });
});

// check phone exists
router.get('/phoneExist/:phone', async (req, res) => {
  // check if phone exists
  const phoneExist = await User.findOne({ phone: req.params.phone });
  if (phoneExist) return res.status(400).json({ error: 'phone already exists' });
  return res.status(200).json('ok');
});

// check email exists
router.get('/emailExist/:email', async (req, res) => {
  // check if email exists
  const emailExist = await User.findOne({ email: req.params.email });
  if (emailExist) return res.status(400).json({ error: 'email already exists' });
  return res.status(200).json('ok');
});

// check username exists
router.get('/usernameExist/:username', async (req, res) => {
  // check if username exists
  const usernameExist = await User.findOne({ username: req.params.username });
  if (usernameExist) return res.status(400).json({ error: 'username already exists' });
  return res.status(200).json('ok');
});

// forgot password
router.get('/forgotPassword/:email', async (req, res) => {
  // check if user exists
  const user = await User.findOne({ email: req.params.email });
  console.log(req.params.email);
  if (!user) return res.status(400).json({ error: 'user not found' });
  // try to send email
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 25,
      auth: {
        user: 'lemaemanuel96@gmail.com',
        pass: 'caudlekadonya1996',
      },
      tls: { rejectUnauthorized: false },
    });
    const mailOptions = {
      from: 'lemaemanuel96@gmail.com',
      to: 'tylerlema98@gmail.com',
      subject: 'Reset password email',
      text: `click this link to reset password http://10.0.2.2:3000/api/user/auth/reset/?id=${user._id}`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json('ok');
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

module.exports = router;
