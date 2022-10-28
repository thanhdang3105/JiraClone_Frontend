import { createSelector } from '@reduxjs/toolkit'

const userSelector = ({user}) => user
const listProjectsSelector = ({project}) => project.listProjects
const projectViewSelector = ({project}) => project.projectView
const issuesSelector = ({issues}) => issues.listIssues
const issuesViewSelector = ({issues}) => issues.issueView
const issuesSearchValuesSelector = ({issues}) => issues.issuesSearchValues
const filterSelector = ({filter}) => filter

const getIssues = createSelector(
    userSelector,
    issuesSelector,
    filterSelector,
    (user,issues,{searchTerm,users,options}) => {
        let resultSearch = issues
        if(searchTerm){
            let listId = searchTerm.map(value => value.id)
            resultSearch = resultSearch.filter(item => listId.includes(item.id))
        }
        if(users.length){
            resultSearch = resultSearch.filter(item => users.find(user => {
                const assignees = item.assignees.map(assignee => assignee.id)
                return assignees.includes(user)
            }))
        }
        if(options.length){
            options.map(item => {
                if(item === 'me' && user?.id){
                    resultSearch = resultSearch.filter(item => {
                        const assignees = item.assignees.map(assignee => assignee.id)
                        return assignees.includes(user?.id)
                    })
                }
                if(item === 'newCreate'){
                    resultSearch = resultSearch.filter(item => Date.now() - item.createdAt >= 0 && Date.now() - item.createdAt <= (1000 * 60 * 60 * 24))
                }
                return item
            })
        }
        let resultSort = {
            backlog: [],
            selected: [],
            progress: [],
            done: []
        }
        if(resultSearch.length){
            resultSearch.map(data => {
                if(data.deadline){
                    const timeRemaining = data?.deadline - Date.now()
                    if(timeRemaining <= 12 * 60 * 60 * 1000 && data?.status !== 'done'){
                        const newData = {...data,expried: true}
                        resultSort[data.status].push(newData)
                        resultSort[data.status].sort((a,b) => a.index - b.index)
                        return newData
                    }
                }
                resultSort[data.status].push(data)
                resultSort[data.status].sort((a,b) => a.index - b.index)
                return data
            })
        }
        return resultSort
    }
)

export { userSelector, listProjectsSelector, projectViewSelector, getIssues, filterSelector, issuesViewSelector, issuesSearchValuesSelector }