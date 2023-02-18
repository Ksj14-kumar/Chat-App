import React, { useEffect } from "react"
import { messageType } from "../../features/types/Alltypes";
import { format } from "timeago.js"
import GroupFile from "./GroupFile";
type propType = {
    item: messageType,
    messageBoxRef: React.RefObject<HTMLDivElement>,
}
function LeftChatMessageBox({ item, messageBoxRef }: propType) {
    return (
        <div className="chat chat-end" ref={messageBoxRef}>
            {/* ========================Another User============================== */}
            <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                    {
                        item.pic &&
                        <img src={item.pic} />
                    }
                </div>
            </div>
            <div className="chat-bubble chat-bubble-secondary text-white overflow-hidden">
                {/* ==============================Show Files=============================== */}
                {
                    (item.files !== undefined && item.files.length > 0) ? item.files.map((images, index: number) => {
                        return (
                            <>
                            <p className='text-[.8rem] font-mono flex justify-end pb-1 text-[#FBCB0A] select-none'>~{item.name}</p>
                                <GroupFile filePath={images} />
                                {item.text}
                            </>
                        )
                    }) :
                        <>
                            <p className='text-[.8rem] font-mono flex justify-end text-[#FBCB0A] select-none'>~{item.name}</p>
                            {item.text}
                        </>
                }
                <time className='text-[.8rem] font-thin flex justify-start w-full'>{format(item.time)}</time>
            </div>
        </div>
    )
}
export default LeftChatMessageBox; 