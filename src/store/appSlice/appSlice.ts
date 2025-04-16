import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface StyleRtkState {
    isDarkMode: boolean
}
const STYLE_STATE_RESET: StyleRtkState = {
    isDarkMode: false
}

const initialState = STYLE_STATE_RESET

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setIsDarkModeReducer: (state, action: PayloadAction<boolean>) => {
            const updatedStyleRTKState: StyleRtkState = {
                ...state,
                isDarkMode: action.payload,
            }

            return updatedStyleRTKState
        },
    },
})

export const {
    setIsDarkModeReducer
} = appSlice.actions

export default appSlice.reducer
