const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  //Doing a special get request which only takes name and image and excludes id(- minus)
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

//GETTING A PARTICULAR PRODUCT
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

//ADDING A PRODUCT
router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) {
    return res.status(500).send("The product cannot be created");
  }
  return res.send(product);
});

//UPDATE A PRODUCT
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    return res.status(400).send("The Product cannot be update");
  }
  res.send(product);
});

//Delete A PRODUCT
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "The Product is deleted" });
      } else {
        return res.status(404).useChunkedEncodingByDefault({
          success: false,
          message: "TheProduct not found",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

//COUNTING NUMBER OF PRODUCTS
router.get(`/get/count`, async (req, res) => {
  let productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

//GETTING FEATURED PRODUCTS
router.get(`/get/featured/:count`, async (req, res) => {
  let count = req.params.count ? req.params.count : 0;
  let productFeatured = await Product.find({ isFeatured: true }).limit(+count);

  if (!productFeatured) {
    res.status(500).json({ success: false });
  }
  res.send(productFeatured);
});

//FILTERING PRODUCTS(USING QUERY PARAMS)
router.get(`/`, async (req, res) => {
  //api/v1/products?categories=21312,12313122-->query param
  let filter = [];
  if (req.query.params) {
    filter = req.query.params.split(",");
  }
  let productFeatured = await Product.find(filter).populate("cateogry");

  if (!productFeatured) {
    res.status(500).json({ success: false });
  }
  res.send(productFeatured);
});

module.exports = router;
