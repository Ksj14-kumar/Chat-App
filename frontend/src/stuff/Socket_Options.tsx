export const socketOptions = {
    path: "/messenger",
    transportOptions: ["polling", "websocket"],
    auth: {
        token: localStorage.getItem("tt")
    },
    query: {
        num: 1
    },
    withCredentials: true,
    reconnection: false,
    forceBase64:true
}