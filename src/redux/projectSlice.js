import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
    name: 'projects',
    initialState: {
        listProjects: [],
        projectView: {}
    },
    reducers: {
        setInitialProjects: (state,{payload}) => {
            state.listProjects = payload
            return state
        },
        createProject: (state,{payload}) => {
            state.listProjects.push(payload)
            return state
        },
        updateProject: (state,{payload}) => {
            if(payload){
                state.listProjects.map(project => {
                    if(project.id === payload.id){
                        Object.assign(project,payload)
                    }
                    return project
                })
                Object.assign(state.projectView,payload)
            }
            return state
        },
        deleteProject: (state,{payload}) => {
            state.listProjects.splice(state.listProjects.findIndex(project => project.id === payload),1)
            return state
        },
        setProjectView: (state,{payload}) => {
            if(payload) {
                state.projectView = payload
            }
            return state
        },
        addUsers: (state,{payload}) => {
            if(state.projectView?.userIds.length){
                state.projectView?.userIds?.push(...payload)
            }
            return state
        },
        removeUsers: (state,{payload}) => {
            if(state.projectView?.userIds.length){
                const newUserIds = state.projectView?.userIds?.filter(user => !payload.includes(user.id))
                state.projectView.userIds = newUserIds
            }
            return state
        }
    }
})


export const { setInitialProjects, createProject, updateProject, deleteProject, setProjectView, addUsers, removeUsers } = projectSlice.actions

export default projectSlice.reducer