import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {roomInterface} from "../types/Alltypes"
interface roomType {
    rooms: roomInterface[]
}
const initialState: roomType = {
    rooms:[]
}
const roomSlice = createSlice({
    name: "roomSlice",
    initialState,
    reducers: {
        addRooms: (state, action:PayloadAction<roomInterface[]>) => {
            state.rooms = action.payload
        }
    }
})
export const {addRooms}= roomSlice.actions
export const roomReducer= roomSlice.reducer