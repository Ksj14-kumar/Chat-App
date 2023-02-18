import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import { Socket } from 'socket.io-client';
import { groupUserType, messageType, roomInterface } from '../../features/types/Alltypes';
import { AnimatePresence, motion } from "framer-motion"
import RightChatMessageBox from './RightChatMessageBox';
import LeftChatMessageBox from './LeftChatMessageBox';
import Header from './Header';
import SideBar from './SideBar';
import KickPopModal from './KickPopModal';
import { MdFileUpload, MdEmojiEmotions, MdGif } from "react-icons/md"
import { toast } from 'react-hot-toast';
import EmojiPicker, { EmojiStyle, EmojiClickData, Theme } from 'emoji-picker-react';
type propType = {
    socket: Socket
}
// TODO:Stop to get item from localstorage
const pic: string | null = localStorage.getItem("picture")
const name: string | null = localStorage.getItem("name")
const email: string | null = localStorage.getItem("email")
const userID: string | null = localStorage.getItem("_id")
function GroupChatHome({ socket }: propType) {
    const [params] = useSearchParams()
    const [showSideBar, setShowSideBar] = useState<boolean>(false)
    const [currentRoom, setCurrentRoom] = useState<groupUserType[]>([])
    const [inputValue, setInputValue] = useState<string>("")
    const [joinAlert, setJoinMessageAlert] = useState<string[]>([])
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [onOpenEmojiModal, setOpenEmojiModal] = useState<boolean>(false)
    const [sendMessageArray, setSendMessageArray] = useState<messageType[]>([])
    const [arrivalMessage, setArrivalMessage] = useState<messageType>({} as messageType)
    const [onFileSelect, setOnFileSelect] = useState<FileList | null>(null)
    const emojiContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const messageBoxRef = useRef<HTMLDivElement>(null)
    const inputFileRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    const [roomName, roomId]: (string | null)[] = [params.get("name"), params.get("id")]
    useEffect(() => {
        const onGet = [roomName, roomId].every((item) => Boolean(item))
        if (onGet) {
            socket.on("user_in_room", (data) => {
                setCurrentRoom(data)
            })
            socket.on("on_join", (msg) => {
                setJoinMessageAlert(pre => [...pre, msg])
            })
        }
        else {
            // TODO: and also remove user when url change or back
            navigate(`/`)
        }
    }, [params, socket])
    useEffect(() => {
        socket.on("get_msg", (arrivalMessage) => {
            setArrivalMessage(arrivalMessage)
        })
        socket.on("user_in_room", (data) => {
            setCurrentRoom(data)
        })
    }, [socket])
    useEffect(() => {
        arrivalMessage.name && setSendMessageArray(pre => [...pre, arrivalMessage])
    }, [arrivalMessage])
    useEffect(() => {
        if (scrollRef.current && messageBoxRef.current) {
            scrollRef.current.scrollTop = messageBoxRef.current.offsetHeight + messageBoxRef.current.offsetTop;
        }
    }, [sendMessageArray])
    function onMessageChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setInputValue(e.target.value)
    }
    function onKeyPress(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === "Enter") {
            if (inputValue) {
                if (onFileSelect && onFileSelect?.length > 0) {
                    const messageStructureWithFile: messageType = {
                        text: inputValue,
                        name: name,
                        senderId: userID,
                        pic,
                        roomId,
                        roomName,
                        time: `${new Date().getTime()}`,
                        file: onFileSelect
                    }

                    socket.emit("send_msg", messageStructureWithFile)
                }
                else {
                    const messageStructure: messageType = {
                        text: inputValue,
                        name: name,
                        senderId: userID,
                        pic,
                        roomId,
                        roomName,
                        time: `${new Date().getTime()}`
                    }
                    socket.emit("send_msg", messageStructure)
                }
                if (inputFileRef.current) {
                    inputFileRef.current.value = ""
                }
                setInputValue("")
                setOnFileSelect(null)
                if (inputRef.current) {
                    inputRef.current?.focus()
                }
            }
        }
    }
    // TODO:Leave room funtionality
    function onLeave(): void {
        socket.emit("on_leave", { roomId, roomName, userID })
        navigate("/")
    }
    function onInputFileSelectHandle(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            const size = e.target.files[0].size
            if (size > 1000000000) {
                toast.error("file size is too large", { duration: 2000 })
            }
            setInputValue(e.target.files[0].name)
            setOnFileSelect(e.target.files)
        }
    }
    function onEmojiSelect(emojiData: EmojiClickData) {
        setInputValue(pre => pre + emojiData.emoji)
    }
    return (
        <div className='bg-[#071134d9] flex flex-col h-screen  overflow-hidden relative'>
            {/* ============================KICKOUT MODAL======================== */}
            {openModal && <KickPopModal setOpenModal={setOpenModal} openModal={openModal} />}

            {/* =================================SideBar================================= */}
            <AnimatePresence>
                {showSideBar && <motion.aside
                    initial={{ x: -250 }}
                    animate={{ x: 0 }}
                    transition={{ duration: .5, type: "tween", ease: "easeInOut" }}
                    exit={{ x: -250 }}
                    className="left_sidfe absolute  mobile:w-[71%] w-[40%] md:w-[23%]  h-full border- border-[#7c7777]   overflow-y-auto " id='live_users_in_room'>
                    <SideBar currentRoom={currentRoom} setOpenModal={setOpenModal} openModal={openModal} userID={userID} />
                </motion.aside>
                }
            </AnimatePresence>
            {/* ================================ Right_side bar content   */}
            <div className={`right_side bg-red-700 w-full ${showSideBar ? "md:ml-[23%] ml-[40%] mobile:ml-[70%]" : "ml-0"}`}>
                <Header setShowSideBar={setShowSideBar
                } roomId={roomId} onLeave={onLeave} showSideBar={showSideBar} roomName={roomName} />
            </div>
            <main className={`content2  px-4 mobile:px-0 min-h-[calc(100vh-2.7rem)] flex flex-col ${showSideBar ? "md:ml-[23%] ml-[40%] mobile:ml-[71%]" : "ml-0"}`}>
                <div className="message_box bg-[#480032] flex-1 w-full overflow-y-auto px-2" id='messageBox' ref={scrollRef}>
                    <div className="wrapper flex-1 overflow-y-auto" id='messageBox'>
                        
                    {
                            joinAlert.map((item: string, index: number) => {
                                return (
                                    <>
                                        <p key={index} className='text-white font-mono w-full flex justify-center'>{item}</p>
                                    </>
                                )
                            })
                        }
                        {sendMessageArray.map((item: messageType, index: number) => {
                            return (
                                <>
                                    {
                                        item.senderId === userID ?
                                            (
                                                <LeftChatMessageBox item={item} messageBoxRef={messageBoxRef} />
                                            ) :
                                            (
                                                <RightChatMessageBox item={item} messageBoxRef={messageBoxRef} />
                                            )
                                    }
                                </>
                            )
                        })}
                        
                    </div>
                </div>

                <footer className='relative'>
                    <AnimatePresence>
                        {onOpenEmojiModal &&
                            <motion.div
                                initial={{ y: 350 }}
                                animate={{ y:0, }}
                                transition={{ duration: 0 }}
                                exit={{y:350}}
                                className="emoji_container">
                                <EmojiPicker
                                    emojiStyle={EmojiStyle.FACEBOOK}
                                    width="100%"
                                    height="340px"
                                    lazyLoadEmojis={true}
                                    onEmojiClick={onEmojiSelect}
                                    previewConfig={{ showPreview: false }}
                                    theme={Theme.LIGHT}
                                />
                            </motion.div>
                        }
                    </AnimatePresence>
                    <div className="text_input w-full">
                        <input
                            ref={inputRef}
                            type="text" name="" className='w-full indent-2 outline-none rounded-md rounded-t-none py-3' placeholder='write message...' id=""
                            onChange={onMessageChange}
                            onKeyDown={onKeyPress}
                            value={inputValue}
                        />
                    </div>
                    {/* mobile:top-[10px] top-[5px] */}
                    <div className="file_input absolute right-[10px] flex justify-center align-middle bottom-[5px] bg-[#cfcdcd] rounded-full p-1 items-center">
                        <label htmlFor="" className=' rounded-full cursor-pointer pl-1'
                            onClick={() => {
                                setOpenEmojiModal(!onOpenEmojiModal)
                            }}
                        >
                            <MdEmojiEmotions className="text-[1.8rem] mobile:text-[1.4rem] text-[#024a62]" />
                        </label>
                        <label htmlFor="" className=' rounded-full cursor-pointer px-1'>
                            <MdGif className="text-[1.8rem] mobile:text-[1.4rem]  text-[#e40672]" />
                        </label>
                        <label htmlFor="file" className=' rounded-full cursor-pointer'>
                            <MdFileUpload className="text-[1.8rem] mobile:text-[1.4rem] text-[#e40672]" />
                        </label>
                        <input
                            accept='image/jpeg,image/png,image/jpg,image/pdf,video/mp4'
                            onChange={onInputFileSelectHandle}
                            ref={inputFileRef}
                            className='hidden' type="file" name="file" id="file" />
                    </div>
                </footer>
            </main>
        </div>
    )
}
export default GroupChatHome;