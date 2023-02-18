const { isAuth } = require("../Config/isAuth")
const router = require("express").Router()
const path= require("path")

router.get("/user", isAuth, async (req, res) => {
    try {
        return res.send("user")
    } catch (err) {
        console.log(err)
        return res.status(500).send("something error")
    }
})
router.post("/file",isAuth, async (req, res) => {
    try {
        console.log(req.headers)
        const filePath = req.headers.filepath
        console.log({filePath})
        const fileFullPath= path.join(__dirname,"../Messagefile",filePath)
        return res.status(200).sendFile(fileFullPath)
    } catch (err) {
        console.log(err)
        return res.status(500).send("something error occured")
    }
})

module.exports = router;