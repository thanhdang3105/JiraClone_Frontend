import { createSlice } from '@reduxjs/toolkit'

const issuesSlice = createSlice({
    name: 'issues',
    initialState: {
        listIssues: [],
        issueView: {},
        issuesSearchValues: undefined,
    },
    reducers: {
        setInitialIssues: (state,{payload}) => {
            state.listIssues =  payload
            return state
        },
        createIssues: (state,{payload}) => {
            state.listIssues.push(payload)
            return state
        },
        updateAssignees: (state,{payload}) => {
            state.listIssues.map(issue => {
                issue.assignees = issue.assignees.filter(item => !payload.includes(item.id))
                return issue
            })
            return state
        },
        setIssueView: (state,{payload}) => {
            state.issueView = {}
            if(payload){
                const issueView = state.listIssues.find(issue => issue.id === payload)
                if(issueView){
                    state.issueView = issueView
                }
            }
            return state
        },
        deleteIssue: (state,{payload}) => {
            state.listIssues = state.listIssues.filter(issue => issue.id !== payload)
            state.issueView = {}
            return state
        },
        updateIssues: (state,{payload}) => {
            if(payload.comments === null) {
                delete payload.comments
            }
            if(payload?.id){
                state.listIssues.map(issue => {
                    if(issue.id === payload.id) {
                        Object.assign(issue, payload)
                    }
                    return issue
                })
                Object.assign(state.issueView,payload)
            }
            return state
        },
        setIssuesSearchValues: (state,{payload}) => {
            state.issuesSearchValues = payload
            return state
        },
        changeIndexIssue: (state,{payload}) => {
            if(payload?.length) {
                payload.map(item => {
                    state.listIssues.map(issue => {
                        if(item.id === issue.id){
                            Object.assign(issue,item)
                        }
                        return issue
                    })
                    return item
                })
                return state
            }
        }
    }
})

export const { setInitialIssues, createIssues, updateAssignees, setIssueView, deleteIssue, updateIssues, setIssuesSearchValues, changeIndexIssue } = issuesSlice.actions

export default issuesSlice.reducer