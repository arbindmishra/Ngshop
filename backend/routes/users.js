const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); //For Password Hashing
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

//FINDING AN USER THROUGH ID
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res.status(500).json({ message: "The user with given Id was not found" });
  }
  res.status(200).send(user);
});

//ADDING AN USER
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10), //10 is salt
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  user = await user.save();

  if (!user) {
    return res.status(404).send("user cannot be created");
  }
  res.send(user);
});

//UPDATE USER DATA(INCLUDING/EXCLUDING PASSWORD)
router.put("/:id", async (req, res) => {
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    const user = await User.findById(req.params.id);
    newPassword = user.passwordHash.toString();
    // newPassword = await User.findById(req.params.id).passwordHash.toString();
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  // let user = new User({
  //   name: req.body.name,
  //   email: req.body.email,
  //   passwordHash: newPassword,
  //   phone: req.body.phone,
  //   isAdmin: req.body.isAdmin,
  //   street: req.body.street,
  //   apartment: req.body.apartment,
  //   zip: req.body.zip,
  //   city: req.body.city,
  //   country: req.body.country,
  // });
  // user = await user.save();

  if (!user) {
    return res.status(404).send("user cannot be created");
  }
  res.send(user);
});

//LOGIN FOR A USER(JWT USAGE)
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  //for user validation(if user doesn't exist)
  if (!user) {
    return res.status(400).send("User not found");
  }
  //for user and password validation
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret, //PRIVATE_KEY
      { expiresIn: "1d" }
      //Expires your login, automatically logs you out after 1 day(token expires)
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    return res.status(400).send("Password is Wrong");
  }
});

//COUNTING NUMBER OF USERS
router.get(`/get/count`, async (req, res) => {
  let userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

//DELETE AN USER
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "The user is deleted" });
      } else {
        return res.status(404).json({
          success: false,
          message: "The user not found",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
