if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

let express = require("express");
let app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

const atlasUrl = process.env.ATLASDB_URL
const mongoDBUrl = 'mongodb://127.0.0.1:27017/wanderlust'

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))
app.use(methodOverride("_method"));

main()
    .then(res => {
        console.log("Connected")
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(atlasUrl);
}

const store = MongoStore.create({
    mongoUrl: atlasUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
})

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err)
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}

// app.get("/", (req, res) => {
//     res.send("Hi Iam root")
// })



app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next();
})

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)


app.listen(8080, () => {
    console.log("app listening on port 8080")
})

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err, req, res, next) => {
    let { statuscode = 500, message = "Something Went Wrong!!" } = err;
    res.status(statuscode).render("error.ejs", { message })
})

