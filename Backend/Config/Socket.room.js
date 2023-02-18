const fs = require("fs")
const path = require("path")
const { detectFile } = require("./DetectFile")
const uuid = require("uuid")
const { isUserExistRoom, findRoomIndex, allRooms } = require("../Socket.Methods/Socket.methods")
let count = 0
const RoomDb = require("../db/room")
const { SocketAuth } = require("./Socket.Auth")

module.exports = (server, sessionMiddleware) => {
    const io = require('socket.io')(server, {
        path: "/messenger",
        transports: ["polling", "websocket"],
        maxHttpBufferSize: 1e+9, // get data size by socket.io as payload
        cors: {
            origin: process.env.UI_URL,
            allowedHeaders: ["Content-Type", "Accept", "Authorization"],
            allowedMethods: ["GET", "PUT", "POST", "DELETE"],
            credentials: true,
            preflightContinue: true
        },
        cookie: {
            httpOnly: true,
            name: "ck",
            maxAge: 24 * 60 * 60 * 1000
        }
    });
    //TODO:use auth middleware
    //nameSpace rooms
    const chatRoom = io.of("/api/v1/chat")

    // ============================================Socket middleware=======================
    chatRoom.use(function (socket, next) {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });
    chatRoom.use(async (socket, next) => {
        SocketAuth(socket, next)
    })
    // ============================================Socket middleware end=======================
    chatRoom.on("connection", async (socket) => {
        count += 1
        console.log("a user is connected")
        console.log(count)
        socket.emit("rooms", allRooms)
        socket.on("create_room", async ({ roomName, name, userID, members, pic,rId }) => {
            const roomId= rId+roomName
            try {
                console.log({ roomName, name, userID, members, pic })
                const time = new Date().getTime()
                const newRoomInfo = {
                    roomName,
                    roomId,
                    members,
                    admin: {
                        name,
                        isAdmin: true,
                        pic,
                        time, userID
                    },
                    userInRoom: []
                }
                const newRoom = await RoomDb(newRoomInfo)
                newRoom.save(async (err) => {
                    if (err) {
                        console.log(err)
                        socket.emit("error_on_room_creation", "Oops's something error occured")
                    }
                    else {
                        allRooms.unshift(newRoomInfo)
                        socket.join(roomId)
                        // socket.join(roomName)
                        chatRoom.emit("update_room_on_create", allRooms)
                    }
                })
            } catch (err) {
                console.log("something error occured during room creation")
                console.log(err)
                socket.emit("error_on_room_creation", err.message)
            }
        })
        socket.on("on_join", async ({ roomID, roomName, name, pic, userID, sid }) => {
            // TODO: check room exists with this roomID and roomName
            const onRoomFind = findRoomIndex(roomName, roomID)
           const result=  await chatRoom.in(roomID).fetchSockets();
           console.log(chatRoom.adapters)
           console.log({result})
            // TODO: from db
            const onRoomFindDb = await RoomDb.findOne({ roomName, roomId: roomID })
            if (onRoomFind !== -1) {
                const isExist = isUserExistRoom(userID, socket.id, roomID, roomName)
                if (allRooms[onRoomFind].members !== "unlimited") {
                    //TODO:check number of client in room and next user is allow or not
                    if (allRooms[onRoomFind].userInRoom.length === +(allRooms[onRoomFind].members)) {
                        socket.emit("on_room_full", "room is full")
                    }
                    else {
                        // TODO:check user is already exit in this room or not
                        console.log({ isExist })
                        if (!isExist) {

                            onRoomFindDb.userInRoom.push({ name, userID, pic, sid: socket.id })
                            await onRoomFindDb.save()
                            allRooms[onRoomFind].userInRoom.push({ name, userID, pic, sid: socket.id })
                        socket.broadcast.to(roomID).emit("on_join", `${name} has join group`)
                        }
                        socket.join(roomID)
                        // socket.join(roomName)
                        // chatRoom.emit("update_room_users", { name, userID, pic, sid,roomID,roomName })
                        console.log({ allRooms })
                        chatRoom.emit("newRoomUpdate", allRooms)
                        // =======================ROOM User update when users already in group==============
                        const findRoom = findRoomIndex(roomName, roomID)
                        if (findRoom !== -1) {
                            chatRoom.emit("user_in_room", allRooms[findRoom].userInRoom)
                        }
                        else {
                            chatRoom.emit("not_room_exit", 404)
                        }
                    }
                }
                else {
                    // TODO:check user is already exit in this room or not
                    const isExist = isUserExistRoom(userID, socket.id, roomID, roomName)
                    if (!isExist) {
                        onRoomFindDb.userInRoom.push({ name, userID, pic, sid: socket.id })
                        await onRoomFindDb.save()
                        TODO://update user in room when room allow to unlimited users
                        allRooms[onRoomFind].userInRoom.push({ name, userID, pic, sid: socket.id })
                        socket.broadcast.to(roomID).emit("on_join", `${name} has join group`)
                    }
                    socket.join(roomID)
                    // socket.join(roomName)
                    chatRoom.emit("newRoomUpdate", allRooms)
                    // =======================ROOM User update when  users already in group==============
                    const findRoom = findRoomIndex(roomName, roomID)
                    if (findRoom !== -1) {
                        chatRoom.emit("user_in_room", allRooms[findRoom].userInRoom)
                    }
                    else {
                        chatRoom.emit("not_room_exit", 404)
                    }
                }
            }
            else {
                socket.emit("error_on_join", "something error occured")
            }
        })
        TODO:// Done: whe user relaod the room page
        socket.on("in_room", ({ roomNameFromStorage, roomIdFromStorage }) => {
            console.log("room comes")
            console.log({ roomNameFromStorage })
            const findRoom = findRoomIndex(roomNameFromStorage, roomIdFromStorage)
            if (findRoom !== -1) {
                chatRoom.emit("user_in_room", allRooms[findRoom].userInRoom)
            }
            else {
                chatRoom.emit("not_room_exit", 404)
            }
        })

        // TODO: on room reload
        socket.on("on_page_reload",({ roomName, roomId })=>{
            console.log({ roomName, roomId })
            const roomByIndex = findRoomIndex(roomName, roomId)
            if(roomByIndex !==-1){
                const getRoom = allRooms[roomByIndex]
                socket.emit("on_page_reload",getRoom)
            }
        })
        // TODO: on leave the room
        socket.on("on_leave", async ({ roomId, roomName, userID }) => {
            const roomByIndex = findRoomIndex(roomName, roomId)
            await RoomDb.updateOne(
                { $and: [{ roomName }, { roomId: roomId }] },
                {
                    $pull: { "userInRoom": { "userID": userID } }
                },
                { multi: true }
            )
            if (roomByIndex !== -1) {
                const removeUser = allRooms[roomByIndex].userInRoom.filter((item) => item.sid !== socket.id)
                allRooms[roomByIndex] = { ...allRooms[roomByIndex], userInRoom: removeUser }
                socket.leave(roomId)
                chatRoom.emit("newRoomUpdate", allRooms)
                chatRoom.emit("user_in_room", allRooms[roomByIndex].userInRoom)
            }
        })
        // DONE:=======================User Message Mecha===================
        socket.on("send_msg", async (msg) => {
            console.log({ msg })
            if (msg.roomId && msg.roomName) {
                console.log({ message: msg })
                const updatePath = path.join(__dirname, "../Messagefile")
                const filePathFromStaticDir = `${msg.roomId}/${msg.roomName}`
                const createPath = path.join(updatePath, filePathFromStaticDir)
                let allFilePathArray = []
                try {
                    if (!fs.existsSync(createPath)) {
                        fs.mkdirSync(createPath, { recursive: true })
                    }
                    if (msg.file) {
                        // TODO:Write all files
                        for (var k in msg.file) {
                            const buffer = Buffer.from(msg.file[k])
                            const { ext, mime } = detectFile(buffer)
                            const randomName = Math.floor(Math.random() * 1000000)
                            const fileFullPath = filePathFromStaticDir + `/${msg.senderId}-${randomName}.` + ext
                            const newPath = path.join(updatePath, fileFullPath)
                            allFilePathArray.push(fileFullPath)
                            fs.appendFileSync(newPath, buffer)
                        }
                    }
                    delete msg["file"]
                    const updateMessageWithTime = {
                        ...msg,
                        files: allFilePathArray,
                        time: new Date().getTime()
                    }
                    await RoomDb.findOneAndUpdate(
                        { $and: [{ roomName: msg.roomName }, { roomId: msg.roomId }] },
                        { $push: { "messages": updateMessageWithTime } }
                    )
                    console.log(msg.roomId)
                    chatRoom.to(msg.roomId).emit("get_msg", updateMessageWithTime)
                } catch (err) {
                    console.log(err)
                    console.log("file not write", err)
                }
            }
        })
        chatRoom.on("disconnect", (data) => {
            console.log(data)
            count -= 1
            console.log(count)
            console.log("a user is left the room")
        })
    })
}