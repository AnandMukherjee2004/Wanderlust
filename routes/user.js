const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

router.post("/signup", userController.newUserSignup)

router.get("/signup", userController.signupForm)

router.get("/login", userController.loginForm)

router.post("/login", saveRedirectUrl, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.userLogin)

router.get("/logout", userController.logout)

module.exports = router