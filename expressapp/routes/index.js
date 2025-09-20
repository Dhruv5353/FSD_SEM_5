var express = require("express");
var router = express.Router();
var Product = require("../models/Product");
var cors = require('cors')

router.use(cors())

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/add-product", function (req, res, next) {
  res.render("add-product");
});

router.post("/add-product", function (req, res, next) {
  const product = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
  };

  //assign data to the Product model
  var productData = new Product(product);
  productData
    .save()
    .then((result) => {
      res.send("Product added successfully!");
      // res.redirect("/");
    })
    .catch((err) => {
      console.error("Error adding product:", err);
      res.status(500).send("Error adding product");
    });
});

router.get('/display-products', function(req, res, next) {
    Product.find()
    .then(products => {
      res.render('display-products', { products: products });
    })
    .catch(err => {
      console.error("Error fetching products:", err);
      res.status(500).send("Error fetching products");
    });
});
router.get('/display-products-api', function(req, res, next) {
    Product.find()
    .then(products => {
      // res.render('display-products', { products: products });
      res.json(products);
    })
    .catch(err => {
      console.error("Error fetching products:", err);
      res.status(500).send("Error fetching products");
    });
});

router.get("/delete-product/:id", function (req, res, next) {
  const productId = req.params.id;
  Product.findByIdAndDelete(productId)
    .then(() => {
      res.redirect("/display-products");
    })
    .catch((err) => {
      console.error("Error deleting product:", err);
      res.status(500).send("Error deleting product");
    });
});

router.get("/edit-product/:id", function (req, res, next) {
  const productId = req.params.id;
  Product.findById(productId)
    .then((product) => {
      res.render("edit-product", { product: product });
      console.log(product);
    })
    .catch((err) => {
      console.error("Error fetching product for edit:", err);
      res.status(500).send("Error fetching product for edit");
    });
});

router.post('/update-product/:id', function(req, res, next) {
  const productId = req.params.id;
  const updatedProduct = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
  };

  Product.findByIdAndUpdate(productId, updatedProduct, { new: true })
    .then(() => {
      res.redirect('/display-products');
    })
    .catch(err => {
      console.error("Error updating product:", err);
      res.status(500).send("Error updating product");
    });
});

module.exports = router;
