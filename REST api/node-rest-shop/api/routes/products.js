const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Products");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", (req, res, next) => {
  Product.find()
    .select("_id name price")
    .exec()
    .then(docs => {
      if (docs.length <= 0) {
        res.status(404).json({ message: "No entries found" });
      } else {
        const response = {
          count: docs.length,
          products: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              _id: doc._id,
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + doc._id
              }
            };
          })
        };
        res.status(200).json(response);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Product created",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:productId", (req, res, next) => {
  Product.findById({ _id: req.params.productId })
    .select("-__v")
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          message: "Product found",
          product: doc,
          request: {
            type: "GET",
            description: "GET_ALL_PRODUCTS",
            url: "http://localhost:3000/products"
          }
        });
      } else {
        res.status(404).json({ message: "No product found" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateObject = req.body;
  Product.update({ _id: id }, { $set: updateObject })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product updated succesfully",
        // product: result,
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:productId", (req, res, next) => {
  Product.remove({ _id: req.params.productId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product deleted",
        product: result,
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: {
            name: "String",
            price: "Nummber"
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
