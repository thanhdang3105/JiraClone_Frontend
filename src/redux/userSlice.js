import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: 'currentUser',
    initialState: {},
    reducers: {
        setCurrentUser: (state,{payload}) => {
            return payload
        },
        updateUser: (state,{payload}) => {
            if(payload){
                Object.assign(state,payload)
            }
            return state
        }
    }
})

export const { setCurrentUser, updateUser } = userSlice.actions

export default userSlice.reducer