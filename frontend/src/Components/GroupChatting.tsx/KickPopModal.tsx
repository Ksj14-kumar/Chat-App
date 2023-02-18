import React from 'react'
type propType = {
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
    openModal: boolean
}
function KickPopModal({ setOpenModal, openModal }: propType) {
    function onKickOut(): void {
    }
    return (
        <div className="modal_for_kickoutUser absolute z-10 bg-gray-400  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 w-screen h-screen flex justify-center align-middle items-center"
        >
            <div className="inner_modal bg-[#460202] mobile:w-full w-[22rem] p-4 px-[2rem] rounded-md">
                <p className='text-white font-serif text-[1.2rem] tracking-wider'>Are you sure want to kick out ?</p>
                <div className="container12 flex py-[2rem] justify-between">
                    <div className="cancle">
                        <button className=' btn  mobile:px-6 mobile:py-1 mobile:btn-sm btn-warning px-8 py-2 rounded-md text-white tracking-wider hover:bg-[#500101]'
                            onClick={() => {
                                setOpenModal(!openModal)
                            }}
                        >Cancle</button>
                    </div>
                    <div className="kick out">
                        <button className=' btn  bg-[#cd0505] mobile:btn-sm mobile:px-4 mobile:py-1 px-8 py-2 rounded-md text-white tracking-wider hover:bg-[#500101] border-[1px] hover:border-[#cdb204] hover:border-[1px]'
                            onClick={onKickOut}
                        >Kick Out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default KickPopModal