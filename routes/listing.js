const express = require("express")
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
let Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js")
const multer = require('multer')
const {storage} = require("../cloudconfig.js")
const upload = multer({ storage })


router.route("/")

    //index route
    .get(wrapAsync(listingController.index))

    //create route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createNewListing))
    

router.route("/new")

    // new form
    .get(isLoggedIn, listingController.renderNewForm)

router.route("/:id")

    //show route 
    .get(wrapAsync(listingController.showListing))

    //UPDATE ROUTE
    .put(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))

    //delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))

//edit route 

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing))

module.exports = router;