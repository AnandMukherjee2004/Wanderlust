let initData = require("./data.js");
const mongoose = require('mongoose');
let Listing = require("../models/listing.js")

const atlasUrl = process.env.ATLASDB_URL

main()
    .then(res => {
        console.log("Connected")
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(atlasUrl);
}

const initDB = async () =>{
    await Listing.deleteMany({})
    initData.data = initData.data.map((obj) => ({...obj, owner: "6537f2ab298e9dbbb86d7e53"}))
    await Listing.insertMany(initData.data)
    console.log("Data was initialized")
};

initDB();