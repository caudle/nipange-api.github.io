
/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import express from 'express';
import bycrypt from 'bcryptjs';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { validateRegister, validateLogin } from './validation.js';
import User from '../models/User.js';

const router = express.Router();

dotenv.config();

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
    // return user and token
    return res.status(201).json({ user: savedUser });
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
  // return user and token
  return res.status(200).json({ user });
});

// social auth
router.post('/socialAuth', async (req, res) => {
  try {
    // check if email exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
    // login user
      // return user and token
      return res.status(200).json({ user });
    }

    // register user
    // create user in db
    const newUser = new User({
      phone: req.body.phone,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      device: req.body.device,
      isEmailVerified: req.body.isEmailVerified,
      isPhoneVerified: req.body.isPhoneVerified,
      listings: req.body.listings,
      dp: req.body.dp,
      type: req.body.type,
    });
    const savedUser = await newUser.save();
    // return user
    return res.status(201).json({ user: savedUser });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
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
      host: 'nipange.com',
      
      secure: true,
      port: 465,
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_PASS,
      },
      
    });
    const mailOptions = {
      from: process.env.NOREPLY_EMAIL,
      to: req.params.email,
      subject: 'Reset password email',
      text: `click this link to reset password https://admin.nipange.com/auth/reset/?id=${user._id}`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json('ok');
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
});

// change user password
router.post('/changePassword/:userId', async (req, res) => {
  // check if user exists
  const user = await User.findOne({ _id: req.params.userId });
  console.log(req.body.password);
  if (!user) return res.status(400).json({ error: 'user not found' });

  try {
    // hashing new password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(req.body.password, salt);
    // update user
    const updated = await User.updateOne({ _id: req.params.userId }, {
      $set: { password: hashedPassword },
    });
    return res.status(201).json(updated);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// verify email
router.get('/verifyEmail/:id/:email', async (req, res) => {
  const email = decodeURI(req.params.email);
  const id = decodeURI(req.params.id);
  try {
    const user = await User.findOne({ email, _id: id });
    console.log(user);
    if (!user) {
      // whether email exists
      const userEmail = await User.findOne({ email });
      if (userEmail) return res.status(400).json({ error: 'email already used' });
    }
    // send email
    console.log(email);
    console.log(id);
    console.log(process.env.COMPANY_EMAIL);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      port: 465,
      auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: 'Verify email address',
      text: `click this link to verify your email address https://admin.nipange.com/verifyEmail/?id=${user._id}`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json('ok');
  } catch (error) {
    console.log('erorrr');
    return res.status(400).json({ error });
  }
});

// confirm email
router.get('/confirmEmail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.updateOne({ _id: id }, {
      $set: { isEmailVerified: true },
    });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ error });
  }
});
// verify phone
router.patch('/verifyPhone/:id', async (req, res) => {
  try {
    const { phone } = req.body;
    const { id } = req.params;
    const updatedUser = await User.updateOne({ _id: id }, {
      $set: { isPhoneVerified: true, phone },
    });
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// is email verified
router.get('/isEmailVerified/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user.isEmailVerified);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

// is phone verified
router.get('/isPhoneVerified/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    return res.status(200).json(user.isPhoneVerified);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

export default router;
