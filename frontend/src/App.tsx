import LoginHome from "./Components/LoginHome";
import { useEffect, useState } from "react"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Protected from "./auth/Protected";
import { Success } from "./features/Slices/Thunks";
import { roomSelector, Selector, useAppDispatch, useAppSelector } from "./features/store";
import Home from "./Pages/Home";
import PageNotFound from "./Pages/PageNotFound";
import { io, Socket } from "socket.io-client";
import { groupUserType, roomInterface, roomType } from "./features/types/Alltypes";
import { socketOptions } from "./stuff/Socket_Options";
import Speaker from "./Components/Speakers/SpeakerRoom";
import GroupChatHome from "./Components/GroupChatting.tsx/GroupChatHome";
import { useOnLogoutMutation } from "./features/api/apiSlice";
import { logout } from "./features/Slices/authSlice";
import { addRooms } from "./features/Slices/roomSlice";
const socket = io("/api/v1/chat", socketOptions)
// TODO: How to fix update all room on all connected clieny when a new user create room
//TODO: how to update all room users in particularly room instead of render all rooms
function App(): JSX.Element {
  const dispatch = useAppDispatch()
  const authState = useAppSelector(Selector)
  const roomState = useAppSelector(roomSelector)
  const [allRooms, setAllRooms] = useState<roomInterface[]>([])
  const [arrivalRoom, setArrivalRoom] = useState<roomInterface[]>([])
  const [onLogout, { isLoading }] = useOnLogoutMutation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [updateUserInRoom, setUsersInRoom] = useState<groupUserType[]>([])
  const pic: string | null = localStorage.getItem("picture")
  const name: string | null = localStorage.getItem("name")
  const email: string | null = localStorage.getItem("email")
  const userID: string | null = localStorage.getItem("_id")
  useEffect(() => {
    (async function () {
      try {
        const res = await dispatch(Success("")).unwrap()
        if (res) {
          if (pathname === "/login") {
            navigate("/welcome")
          }
          else {
            navigate(pathname)
          }
        }
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])
  useEffect(() => {
    socket.connect()
    socket.once("rooms", (data) => {
      dispatch(addRooms([...data]))
      setAllRooms(pre => [...roomState,...pre])
    })
    // return () => {
    //   socket.off("rooms")
    // }
  }, [])
  useEffect(() => {
    // update_room_on_join
    socket.on("newRoomUpdate", (data: roomInterface[]) => {
      setArrivalRoom([...data])
    })
    //logout user
    socket.on("logout", async (status) => {
      if (status == 401) {
        try {
          const res: { message: string } = await onLogout("").unwrap()
          const result: boolean = Boolean(res)
          if (result) {
            dispatch(logout())
            navigate("/login")
          }
        } catch (err) {
          // console.log({ err })
        }
      }
    })
  }, [socket])
  useEffect(() => {
    // update_room_on_create
    socket.on("update_room_on_create", (data: roomInterface[]) => {
      dispatch(addRooms([...data]))
      setAllRooms(pre => [...roomState])
    })
  }, [socket])
  //arrival room
  useEffect(() => {
    if (arrivalRoom) {
      setAllRooms([...arrivalRoom])
    }
  }, [arrivalRoom])
  const onJoin = (roomID: string, roomName: string) => {
    socket.disconnected && socket.connect()
    socket.emit("on_join", { roomID, roomName, name, pic, userID, sid: socket.id })
    socket.on("on_room_full", (msg) => {
    })
    socket.on("update_room_users", (data) => {
      setUsersInRoom(pre => [...data])
    })
  }
  return (
    <div className="App  absolute bg-[#010c34] bg-cover w-full h-full overflow-hidden">
      <Routes>
        {
          !authState.isAuth &&
            <>
              <Route path="/register" element={<LoginHome />} />
              <Route path="/login" element={<LoginHome />} />
            </> 
        }
        <Route element={<Protected isAuth={authState.isAuth} />}>
          <Route path="/room" element={<GroupChatHome socket={socket} />} />
          <Route path="/" element={<Home setAllRooms={setAllRooms} allRooms={roomState} socket={socket} onJoin={onJoin} name={name} userID={userID} pic={pic} email={email} />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </div>
  )
}
export default App;
