import { SearchOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider, Input, message, Spin } from 'antd'
import React from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import customFetch from '../../hook/customFetch'
import { setFilter } from '../../redux/filterSlice'
import { changeIndexIssue } from '../../redux/issuesSlice'
import { filterSelector, getIssues, projectViewSelector, userSelector } from '../../redux/selector'
import ListIssues from '../ListIssues'
import SettingIssues from '../modal/settingIssues/SettingIssues'
import styles from './kanbanBoard.module.scss'

const statusColumn = ['backlog','selected','progress','done']

export default function KanbanBoard() {
    const [loading,setLoading] = React.useState(false)
    const [inputSearch,setInputSearch] = React.useState('')

    const clearFilterRef = React.useRef()
    const timmerRef = React.useRef()

    const currentUser = useSelector(userSelector)
    const projectData = useSelector(projectViewSelector)
    const listIssues = useSelector(getIssues)
    const filterIssues = useSelector(filterSelector)

    const dispatch = useDispatch()

    const handleClickFilter = React.useCallback((action,value) => {
        if(action === 'clear'){
            setInputSearch('')
        }
        dispatch(setFilter({action,value}))
    },[dispatch])
    
    React.useEffect(() => {
        if(filterIssues?.text || filterIssues?.users.length || filterIssues?.options.length){
            clearFilterRef.current.removeAttribute('disabled')
        }else{
            clearFilterRef.current.setAttribute('disabled', true)
        }
        clearFilterRef.current.onclick= (e) => handleClickFilter('clear')
    },[filterIssues,handleClickFilter])

    const handleInputChange = (e) => {
        setInputSearch(e.target.value)
        clearTimeout(timmerRef.current)
        if(e.target.value === ''){
            setLoading(false)
            dispatch(setFilter({action: 'searchTerm',value: undefined}))
        }else{
            setLoading(true)
            timmerRef.current = setTimeout(() => {
                customFetch('/api/issues/search?searchTerm='+e.target.value+'&projectId='+projectData?.id)
                .then(res => {
                    if(res.status === 200) return res.json()
                    throw new Error(res.text())
                })
                .then(data => {
                    console.log(data)
                    dispatch(setFilter({action: 'searchTerm',value: data}))
                    setLoading(false)
                }).catch(err => {
                    message.error({
                        content: err.message,
                        key: 'errSearch',
                        duration: 2
                    })
                    setLoading(false)
                })
            },1500)
        }
    }

    const moveIssueByStatusAndIndex = (source,destination) => {
        if(destination && source){
            let listChange
            if(destination.droppableId === source.droppableId && destination.index === source.index){
                return
            }else if(destination.droppableId === source.droppableId && destination.index !== source.index){
                const issueItem = listIssues[destination.droppableId].splice(source.index,1)
                issueItem?.length && listIssues[destination.droppableId].splice(destination.index,0,issueItem[0])
                listChange = listIssues[destination.droppableId].map((issue,index) => {
                    return {id: issue.id,index}
                })
            }else if(destination.droppableId !== source.droppableId) {
                const issueItem = listIssues[source.droppableId].splice(source.index,1)
                if(issueItem?.length){
                    listIssues[destination.droppableId].splice(destination.index,0,{...issueItem[0],status: destination.droppableId})
                }
                const listDrag = listIssues[source.droppableId].map((issue,index) => {
                    return {id: issue.id,index,status: issue.status}
                })
                const listDrop = listIssues[destination.droppableId].map((issue,index) => {
                    return {id: issue.id,index,status: issue.status}
                })
                listChange = [...listDrag,...listDrop]
            }

            if(listChange?.length){
                dispatch(changeIndexIssue(listChange))
                customFetch('/api/issues/updateMany',{
                    method: 'PATCH',
                    body: JSON.stringify(listChange)
                }).then(res => {
                    if(res.status === 200) return
                    return res.text().then((text) => {throw new Error(text)})
                }).catch(err => {
                    message.error({
                        content: err.message,
                        key: 'updateMany',
                        duration: 2
                    })
                })
            }
        }
    }
    
    const handleDropIssues = (results) => {
        const {destination,source} = results
        moveIssueByStatusAndIndex(source,destination)
    }

    return (
    <div className={styles['wrapper_board']}>
        <h4>Projects / {projectData?.name} / Kanban Board</h4>
        <h2>Kanban Board</h2>
        <div className={styles['board_body']}>
            <div className={styles['board_body-filter']}>
                <div className={styles['filter_search']}>
                    <Input value={inputSearch} placeholder='Search...' onChange={handleInputChange} suffix={loading && <Spin style={{display: 'flex'}} size='small' />} prefix={<SearchOutlined />} allowClear={!loading} />
                </div>
                <div className={styles['filter_users']}>
                    <Avatar.Group
                        maxCount={3}
                        maxPopoverTrigger="hover"
                        size="large"
                        maxStyle={{
                            color: '#f56a00',
                            backgroundColor: '#fde3cf',
                            cursor: 'pointer',
                        }}
                        >
                            {projectData?.userIds?.map(user => user?.id !== currentUser?.id && (
                                <Avatar key={user?.id} 
                                className={`${styles['filter_users-item']} ${filterIssues?.users?.includes(user?.id) && styles['active']}`}
                                onClick={() => handleClickFilter('users',user?.id)} src={user?.avatarUrl} />
                            ))}
                    </Avatar.Group>
                </div>
                <div className={styles['filter_select']}>
                    <Button type="text" 
                    className={filterIssues?.options?.includes('me') && styles['active']} 
                    onClick={() => handleClickFilter('options','me')}
                    >Only My Issues</Button>
                    <Button type="text"
                    className={filterIssues?.options?.includes('newCreate') && styles['active']}
                     onClick={() => handleClickFilter('options','newCreate')}
                     >Recently Created</Button>
                    <Divider style={{height: 25, borderWidth: 2}} type='vertical'/>
                    <Button disabled type="text" ref={clearFilterRef}>Clear all</Button>
                </div>
            </div>
            <div className={styles['board_body-list']}>
                <DragDropContext onDragEnd={handleDropIssues}>
                {statusColumn && statusColumn.length && statusColumn.map(status => (
                    <ListIssues key={status} title={status} />
                ))}
                </DragDropContext>
            </div>
        </div>
        <SettingIssues updateStatus={moveIssueByStatusAndIndex} />
    </div>
    )
}