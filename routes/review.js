const express = require("express")
const router = express.Router({mergeParams: true});
let Review = require("../models/review.js");
let Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")
let {validateReview, isLoggedIn, isAuthor} = require("../middleware.js")

const reviewController = require("../controllers/reviews.js")

//post route

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createNewReview))

//Delete review route 

router.delete("/:reviewId",isLoggedIn, isAuthor, wrapAsync(reviewController.deleteReview))

module.exports = router;