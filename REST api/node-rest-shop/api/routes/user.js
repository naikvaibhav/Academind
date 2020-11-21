const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({ message: "Email exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            res.status(500).json({ error: err });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({ message: "User created" });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
      }
    });
});

router.post("/signin", (req, res, next) => {
  User.find({
    email: req.body.email
  })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(404).json({ message: "Invalid credentials" });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: "Auth failed" });
        }
        if (result) {
          const token = jwt.sign(
            { email: user[0].email, userId: user[0]._id },
            "secret",
            { expiresIn: "1h" }
          );
          return res
            .status(200)
            .json({ message: "Auth success", token: token });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Invalid credentials" });
    });
});

router.delete("/signup/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(doc => {
      console.log(doc);
      res.status(200).json({ message: "User deleted successfully", user: doc });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
