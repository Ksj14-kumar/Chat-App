import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { ThreeDot } from "../../loader/Spinner"
type propType = {
    filePath: string
}
function GroupFile({ filePath }: propType) {
    const [fileURL, setFilesURL] = useState<string>("")
    const [loader, setLoader] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    useEffect(() => {
        (async function () {
            if (filePath !== undefined) {
                try {
                    setLoader(true)
                    const res = await fetch("/api/v1/resources/file", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            filePath: filePath,
                        }
                    })
                    const result = await res.blob()
                    const url = URL.createObjectURL(result)
                    setFilesURL(url)
                    setLoader(false)
                } catch (err: unknown) {
                    const error = err as AxiosError
                    setError("image not load")
                }
            }
        })()
        return () => {
            setError("")
        }
    }, [filePath])
    return (
        <div className="flex justify-center">
            {
                loader ? <div className="loader w-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-md">
                    <div className="image_shallow_copy w-[8rem] md:w-[15rem] h-[10rem] flex justify-center items-center align-middle">
                        <ThreeDot />
                    </div>
                </div> :
                    (error ? error :
                        <img src={fileURL}
                            alt="img" className="rounded-md mb-1 w-full md:w-[15rem] cursor-pointer" />
                    )
            }
        </div >
    )
}
export default GroupFile