const mongoose = require("mongoose");

const connectDB = async () => {
    console.log("DB STEP 1");

    try {
        console.log("DB STEP 2");
        console.log("URI exists:", !!process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("DB STEP 3");
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.log("DB STEP 4");
        console.error(err);
        throw err;   // <-- do NOT use process.exit(1)
    }
};

module.exports = connectDB;
