const { default: mongoose } = require("mongoose")
const DB_URI = process.env.DB_URL
mongoose.connect(DB_URI, (err) => {
    if (err) {
        console.log("not connect to db")
        return
    }
    else {
        console.log("connected to db")
    }
})
