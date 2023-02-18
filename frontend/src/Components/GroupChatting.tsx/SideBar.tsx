import { groupUserType } from '../../features/types/Alltypes';
import React, { useState } from "react";
type propType = {
    currentRoom: groupUserType[],
    setOpenModal:React.Dispatch<React.SetStateAction<boolean>>,
    openModal:boolean,
    userID:string | null
}
function SideBar({ currentRoom,setOpenModal,openModal,userID }: propType) {
    return (
        <div>
            <header className='bg-[#0938e3]    z-[5] py-2 flex items-center'>
                <p className='truncate text-[#fff] select-none pr-6 font-serif text-[1.2rem] indent-2 tracking-wider'>
                    users in room
                </p>
            </header>
            <div className="inner_left relative z-[3] " >
                <div className="all_users_in_room  flex flex-col py-1 w-full overflow-hidden px-1 gap-y-1">
                    {
                        currentRoom?.map((item: groupUserType, index) => {
                            return (
                                <>
                                    {/* 171190c2 */}
                                    {/* 00D7FF */}
                                    <div key={index} className="image_wrapper flex items-center bg-[#03a9d7c6] w-full py-1 rounded-md drop-shadow-lg cursor-pointer"
                                        onClick={() => {
                                            if(userID !==item.userID){
                                                setOpenModal(!openModal)
                                            }
                                        }}
                                    >
                                        <div className="image_containee rounded-full w-[3rem] h-[3rem] flex-shrink-0 border-[1px] border-[#04ade5] p-[2px] ml-2">
                                            <img src={item.pic} alt="" className='rounded-full w-full h-full flex-shrink-0' />
                                        </div>
                                        <div className="name pl-2 w-full  py-2">
                                            <p className='truncate text-[1.1rem] pr-[3.7rem] font-serif tracking-wider select-none text-[#fff]'>{item.name}</p>
                                        </div>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}
export default SideBar