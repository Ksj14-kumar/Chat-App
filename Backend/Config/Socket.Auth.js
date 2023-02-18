const ParseCookieFromSessionSocket = require("../middleware/ParseCookieFromSessionSocket")
const User = require("../db/User")
const JWT = require("jsonwebtoken")
module.exports.SocketAuth = async function (socket, next) {
    // TODO: user exit in passport js session
    console.log("session start=======================")
    console.log(socket.request.session)
    const userInSession = socket.request.session.passport
    console.log({ userInSession })
    if (userInSession) {
        const cookieString = socket.handshake.headers.cookie
        const parseCookie = ParseCookieFromSessionSocket(cookieString)
        if (parseCookie.tt) {
            try {
                const verifyToken = JWT.verify(parseCookie.tt, process.env.JWT_SECRET)
                if (verifyToken._id) {
                    //find user details
                    const userDetails = await User.findById({ _id: verifyToken._id })
                    console.log({ userDetails })
                    if (userDetails) {
                        next()
                    }
                    else {
                        // TODO:how to emit event when user not connected and unauthorized
                        socket.emit("logout", 401)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        else {
            // TODO:how to emit event when user not connected and unauthorized
            socket.emit("logout", 401)
        }
    }
}