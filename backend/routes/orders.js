const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const { Product } = require("../models/product");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51NPnZRSJeQTzpYbyvaM9e7LSmXRNuBLmzB0JRnPyVXcjfUXBgsFPVh9dzwCZY0rbAFHyEHtRIX8jQEvax9z0vs2d00baSyemyw"
);

router.get(`/`, async (req, res) => {
  //POPULATE WITH USER->NAME
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 }); //SORTS FROM NEWEST TO OLDEST

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//HELPS IN GETTING SERIES OF DATA JUST BY ACCESSING ONE PART AFFTER ANOTHER WITHOUT DOING ANY CHANGES ON DB STRUCTURE
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: {
          path: "category",
        },
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

//Add an Order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  //SUM CALCULATION OF TOTAL PRICE OF AN ORDER
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );

      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    }) //TOTALPRICES IS IN FORM OF AN ARRAY(FOR MULTIPLE PRODUCTS)
  );
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0); //CONVERTING ARRAY AND ADDING IT'S INDEXES,0->INITIAL VALUE-->GIVES THE FINAL PRICE

  let order = new Order({
    orderItems: orderItemsIdsResolved, //We have to link order-item
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) {
    return res.status(404).send("order cannot be created");
  }
  res.send(order);
});

//PAYMENT INTEGRATION
router.post("/create-checkout-session", async (req, res) => {
  const orderItems = req.body;
  if (!orderItems) {
    return res
      .status(400)
      .send("Checkout session cannot be created - check the order items");
  }
  const lineItems = await Promise.all(
    orderItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: orderItem.quantity,
      };
    })
  );
  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:4200/success",
    cancel_url: "http://localhost:4200/cart",
  });

  res.json({ id: session.id });
});

//UPDATE STATUS OF AN ORDER
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    return res.status(400).send("The order cannot be created");
  }
  res.send(order);
});

//DELETE AN ORDER
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        //USED TO DELETE ORDERITEMS OF THE CORRESPONDING ORDER FROM DB
        await Order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "The order is deleted" });
      } else {
        return res.status(404).json({
          success: false,
          message: "The order not found",
        });
      }
    })
    .catch((err) => {
      return res
        .status(200)
        .json({ success: true, message: "The order is deleted" });
      return res.status(500).json({ success: false, error: err });
    });
});

//CALCULATES THE TOTAL SALES OF THE SITE
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

//COUNTING TOTAL NO. OF ORDERS
router.get(`/get/count`, async (req, res) => {
  let orderCount = await Order.countDocuments((count) => count);

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    orderCount: orderCount,
  });
});

//GET HISTORY OF ORDERS OF A PARTICULAR USER
router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 }); //SORTS FROM NEWEST TO OLDEST

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
