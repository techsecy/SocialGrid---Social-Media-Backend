const mongoose = require('mongoose')

const connectToDb = async function(req, res) {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Successfully connected to database")
    } catch(error) {
        console.log(`Not able to connect to database ${error}`);
        
    }
}


module.exports = connectToDb