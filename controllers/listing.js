const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_ACCESS_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {

    let allListings = await Listing.find({});
    // console.log(allListings)
    res.render("listings/index.ejs", { allListings })
}

module.exports.renderNewForm = (req, res) => {

    res.render("listings/new.ejs")
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let content = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner")
    if (!content) {
        // Handle the case where content is not found, e.g., redirect or display an error message.
        req.flash("error", "No such listing found!!")
        res.redirect("/listings")
        return;
    }
    // console.log(content)
    res.render("listings/show.ejs", { content });
}

module.exports.createNewListing = async (req, res, next) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()
    
    if (!req.body.listing) {
        throw new ExpressError(400, "send a valid data for listing!")
    }

    let url = req.file.path
    let filename = req.file.filename

    let newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id
    newListing.image = { url, filename }

    newListing.geometry = response.body.features[0].geometry

    await newListing.save();
    
    req.flash("success", "New listing created!!")
    res.redirect("/listings")
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
    res.render("listings/edit.ejs", { listing })
}

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing })

    if (typeof req.file !== "undefined") {
        let url = req.file.path
        let filename = req.file.filename
        listing.image = { url, filename }
        await listing.save()
    }

    req.flash("success", "Listing Updated")
    res.redirect(`/listings/${id}`)
}

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Successfully Deleted!!")
    res.redirect("/listings")
}