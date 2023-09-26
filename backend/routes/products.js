//WHEN DATA IS UPLOADED ---> IN FORMAT OF form-data(check in postman-->due to image)

const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer"); //USED FOR STORING IMAGES FILE IN DATABASE--TO USE DISKSTORAGE(FRM MULTER LIB-USED TO CONTROL NAMING FILES THERE)

//TYPE OF IMAGE FILES THAT WILL BE ACCEPTED FOR PRODUCT
const FILE_TYPE_MAP = {
  "image/png": "png", //KEY-> IN MIME TYPE(STANDARD MEDIA TYPE--GOOGLE IT IF NECESSARY)
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

//MULTER(DISK-STORAGE-->IN MULTER DOCS)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type.");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads"); //Once file is uploaded to DB, it will show in this folder destination
  },
  //To make the file name unique
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    //mimetype-->gets mime type of the file(MULTER INBUILT) & chcks inFILE_TYPE_MAP & assign value to extension
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  //FOR FILTERING IN THE PRODUCT-LIST PAGE(FRONTEND)
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  //Doing a special get request which only takes name and image and excludes id(- minus)
  const productList = await Product.find(filter).populate("category", "name");

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
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  //FOR CHECKING IF IMG FILE IS PRESENT OR NOT
  const file = req.file;

  if (!file) {
    return res.status(400).send("No image present in the request");
  }

  const fileName = req.file.filename; //FROM MULTER
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`; //used to create the path url-- see below

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //FORMAT--"http://localhost:3000/public/uploads/image-2313223"
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
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }

  //FOR REPLACING ALREADY EXISTING IMAGE FILE
  const product = await Product.findById(req.params.id); //TO CHECK IF THE PRODUCT IS PRESENT OR NOT
  if (!product) {
    res.status(500).json({ success: false });
  }
  const file = req.file;
  console.log(file);
  let imagepath;
  if (file) {
    const fileName = req.file.filename; //FROM MULTER
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`; //used to create the path url
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  //CAN'T BE NAMED product(already used above) AS WE CANNOT INITIALISE TWO TIMES IN SAME SCOPE SO updatedProduct
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
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
  if (!updatedProduct) {
    return res.status(400).send("The Product cannot be update");
  }
  res.send(updatedProduct);
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
        return res.status(404).json({
          success: false,
          message: "The Product not found",
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

//UPDATING THE GALLERY IMAGES BY GIVING MULTIPLE IMAGES
router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Product Id");
    }
    const files = require.files; //GETIING THE MULTIPLE FILES
    let imagesPaths = [];
    //LOOPING ON THE MULTIPLE FILES, RENAMING THEM ACCORDING TO DB TYPE(URLPATHS) & STORING IT IN THE ARRAY
    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.fileName}`);
      });
    }

    //UPDATING THE PRODUCT CATEGORY'S IMAGES TUPLE WITH THE ARRAY OF IMAGE PATHS
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );
    if (!product) {
      return res.status(500).send("The product cannot be created");
    }
    return res.send(product);
  }
);

module.exports = router;
