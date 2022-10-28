import { createSlice } from '@reduxjs/toolkit'

const filterSlice = createSlice({
    name: 'filterIssues',
    initialState: {
        searchTerm: undefined,
        users: [],
        options: []
    },
    reducers: {
        setFilter: (state,{payload}) => {
            const {action,value} = payload;
            switch (action) {
                case 'searchTerm':
                    state[action] = value;
                    return state
                case 'users':
                case 'options':
                    if(!state[action.toLowerCase()].includes(value)){
                        state[action.toLowerCase()].push(value);
                        return state
                    }else{
                        state[action.toLowerCase()] = state[action.toLowerCase()].filter(filter => filter !== value)
                        return state
                    }
                case 'clear':
                    return {
                        text: '',
                        users: [],
                        options: []
                    }
                default:
                    break;
            }
            return state
        }
    }
})

export const { setFilter } = filterSlice.actions

export default filterSlice.reducer