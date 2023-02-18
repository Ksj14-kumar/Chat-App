let allRooms = []
const findRoomIndex = (roomName, roomId) => {
    return allRooms.findIndex((item) => item.roomName === roomName && item.roomId === roomId)
}
const isUserExistRoom = (userID, sid, roomID, roomName) => {
    const roomOnIndex = findRoomIndex(roomName, roomID)
    if (roomOnIndex !== -1) {
        // return allRooms[roomOnIndex].userInRoom.some(item => item.userID === userID)
        const findUser = allRooms[roomOnIndex].userInRoom.findIndex((item) => item.userID === userID)
        if (findUser) {
            //update session id in db
            
            const updateSID = {
                ...allRooms[roomOnIndex].userInRoom[findUser],
                sid: sid
            }
            allRooms[roomOnIndex].userInRoom[findUser] = updateSID
            return allRooms[roomOnIndex].userInRoom.some(item => item.userID === userID)
        }
    }
    else {
        return false
    }
}

module.exports = { isUserExistRoom, findRoomIndex, allRooms }