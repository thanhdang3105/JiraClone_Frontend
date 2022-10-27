import { ArrowDownOutlined, ArrowUpOutlined, BookTwoTone, CheckSquareTwoTone, ClockCircleOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import { Avatar, Button, DatePicker, Divider, Dropdown, InputNumber, Menu, message, Modal, Progress, Select } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteIssue, setIssueView, updateIsses } from '../../../redux/issuesSlice';
import { issuesViewSelector, projectViewSelector, userSelector } from '../../../redux/selector';
import customFetch from '../../../hook/customFetch'
import styles from './settingIssues.module.scss';
import TextArea from 'antd/lib/input/TextArea';
import ReactQuill from 'react-quill'
import moment from 'moment';


export default function SettingIssues({updateStatus}) {
    const [inputTitle,setInputTitle] = React.useState('')
    const [inputDescription,setInputDescription] = React.useState('')
    const [inputComment,setInputComment] = React.useState('')
    const [timeTrackingPercent,setTimeTrackingPercent] = React.useState(0)

    const intervalRef = React.useRef()

    const currentUser = useSelector(userSelector)
    const issueView = useSelector(issuesViewSelector)
    const projectView = useSelector(projectViewSelector)
    const dispatch = useDispatch()

    const issuesType = React.useMemo(() => {
        return {
            task: <><CheckSquareTwoTone /> Task-{issueView?.id}</>,
            bug: <><ExclamationCircleTwoTone twoToneColor='#ff0000' /> Bug-{issueView?.id}</>,
            story: <><BookTwoTone twoToneColor='#00fe00' /> Story-{issueView?.id}</>,
        }
    },[issueView])

    const issuesPriority = React.useMemo(() => {
        return {
            highest: <><ArrowUpOutlined style={{color: 'red'}} /> Highest</>,
            high: <><ArrowUpOutlined style={{color: 'red'}} /> High</>,
            medium: <><ArrowUpOutlined style={{color: 'orange'}} /> Medium</>,
            low: <><ArrowDownOutlined style={{color: 'green'}} /> Low</>,
            lowest: <><ArrowDownOutlined style={{color: 'green'}} /> Lowest</>,
        }
    },[])

    const handleDeleteIssues = () => {
        if(issueView?.id){
            message.loading({
                content: 'Loading...',
                key: 'delete-issue',
                duration: 100
            })
            customFetch('/api/issues?idDelete='+issueView.id,{
                method: 'DELETE'
            }).then(res => {
                if(res.status === 200) return res.json()
                throw new Error('Lỗi')
            }).then(data => {
                message.success({
                    content: data.message,
                    key: 'delete-issue',
                    duration: 2
                })
                dispatch(deleteIssue(issueView.id))
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'delete-issue',
                    duration: 2
                })
            })
        }
    }
    
    const handleCloseModal = () => {
        dispatch(setIssueView(''))
        setInputTitle('')
        setInputDescription('')
        setTimeTrackingPercent(0)
        clearInterval(intervalRef.current)
    }

    const functionUpdate = React.useCallback((data) => {
        return new Promise((resolve,reject) => {
            customFetch('/api/issues/update?idUpdate='+issueView?.id,{
                method: 'PATCH',
                body: JSON.stringify(data)
            }).then(res => {
                if(res.status === 200) return resolve(res.json())
                reject(new Error('Lỗi'))
            })
        })
    },[issueView])

    const handleChangeInfo = React.useCallback((value) => {
        functionUpdate(value).then(data => {
            dispatch(updateIsses(data))
        })
        .catch(err => {
            console.error(err)
        })
    },[dispatch,functionUpdate])

    const handleChangeTitle = (e) => {
        const title = e.currentTarget.parentElement.previousElementSibling
        title.contentEditable = false
        if(inputTitle){
            functionUpdate({title: inputTitle}).then(data => {
                dispatch(updateIsses(data))
                setInputTitle('')
            })
            .catch(err => {
                console.error(err)
            })
        }
    }

    const handleSendComment = () => {
        if(inputComment){
            let formData = {
                id: issueView.id,
                userId: currentUser.id,
                userName: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                comment: inputComment
            }
            message.loading({
                content: 'Loading...',
                key: 'sendComment',
                duration: 100
            })
            customFetch('/api/issues/comments',{
                method: 'POST',
                body: JSON.stringify(formData)
            }).then(res => {
                if(res.status === 200) return res.json()
                throw new Error('Lỗi')
            }).then(data => {
                message.success({
                    content: 'Thành công',
                    key: 'sendComment',
                    duration: 2
                })
                dispatch(updateIsses(data))
                setInputComment('')
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'sendComment',
                    duration: 2
                })
            })
        }
    }

    const menuDropdown = React.useMemo(() => {
        let itemsMenu = []
        if(issueView?.id){
            const listType = Object.keys(issuesType).filter(type => type !== issueView?.type)
            itemsMenu = listType.map(type => ({
                key: type,
                label: issuesType[type],
                
            }))
        }
        return <Menu items={itemsMenu} onClick={({key}) => handleChangeInfo({type:key})} />
    },[issueView,issuesType,handleChangeInfo])

    React.useEffect(() => {
        if(issueView){
            const {createdAt,estimate,status} = issueView
            if(estimate > 0 && createdAt){
                clearInterval(intervalRef.current)
                intervalRef.current = setInterval(() => {
                    const expried = estimate * 60 * 60 * 1000
                    const time = Date.now() - createdAt
                    let timmer = Math.floor(time / expried * 100)
                    setTimeTrackingPercent(timmer)
                    if(timmer > 100){
                        clearInterval(intervalRef.current)
                    }
                },1000)
            }else if(status && status === 'done'){
                clearInterval(intervalRef.current)
            }
        }
        return () => {
            clearInterval(intervalRef.current)
        }
    },[issueView])

    const handleChangeStatus = (value) => {
        if(value) {
            const source = {
                droppableId: issueView?.status,
                index: issueView?.index
            }
            const destination = {
                droppableId: value,
                index: 0
            }
            updateStatus(source, destination)
        }
    }

    return (
        <Modal closable={false} style={{top: 20}} destroyOnClose open={issueView?.id} onCancel={handleCloseModal} footer={false} width={1000}>
            <div className={styles['wrapper_modal']}>
                <div className={styles['modal_header']}>
                    <Dropdown overlay={menuDropdown} trigger='click'>
                        <Button type='text'>{issuesType[issueView?.type]}</Button>
                    </Dropdown>
                    <Button type='text' onClick={handleDeleteIssues}><DeleteOutlined /></Button>
                    <Button type='text' onClick={handleCloseModal}><CloseOutlined /></Button>
                </div>
                <div className={styles['modal_body']}>
                    <div className={styles['modal_body-info']}>
                        <div>
                            <p className={styles['modal_body-info--title']}
                            onInput={(e) => setInputTitle(e.currentTarget.innerText)}
                            onClick={(e) => {
                                e.currentTarget.contentEditable = true
                                e.currentTarget.focus()
                            }}>{issueView?.title}</p>
                            <div style={(inputTitle && inputTitle !== issueView?.title) ? {display: 'flex'} : {display: 'none'}}>
                                <Button type='primary' onClick={handleChangeTitle}>Save</Button>
                                <Button type='text' onClick={(e) => {
                                    const title = e.currentTarget.parentElement.previousElementSibling
                                    title.contentEditable = false
                                    title.innerText = issueView?.title
                                    setInputTitle('')
                                }}>Cancel</Button>
                            </div>
                        </div>
                        <div>
                            <p className={styles['text-label']}>Description</p>
                            <div onClick={(e) => {
                                e.currentTarget.querySelector('.quill')?.classList.remove('quillHidden')
                                e.currentTarget.nextElementSibling.style.display = 'flex'
                            }}>
                                <ReactQuill value={inputDescription || issueView?.description}
                                className='quillHidden'
                                onChange={setInputDescription} />
                            </div>
                            <div style={{display: 'none',marginTop: 10}}>
                                <Button type='primary' onClick={(e) => {
                                    inputDescription && handleChangeInfo({description: inputDescription})
                                    const parentElement = e.currentTarget.parentElement
                                    parentElement.style.display = 'none'
                                    parentElement.previousElementSibling.querySelector('.quill')?.classList.add('quillHidden')
                                }}>Save</Button>
                                <Button type='text' onClick={(e) => {
                                    const parentElement = e.currentTarget.parentElement
                                    parentElement.style.display = 'none'
                                    parentElement.previousElementSibling.querySelector('.quill')?.classList.add('quillHidden')
                                    setInputDescription(issueView?.description)
                                }}>Cancel</Button>
                            </div>
                        </div>
                        <div>
                            <p className={styles['text-label']}>Comments</p>
                            <div className={styles['inputChat_box']}>
                                <Avatar src={currentUser?.avatarUrl} />
                                <div className={styles['inputChat_box-input']}>
                                    <TextArea value={inputComment} placeholder="Comment ....." onChange={(e) => setInputComment(e.target.value)} />
                                    {inputComment && (
                                        <div>
                                            <Button type='primary' onClick={handleSendComment}>Gửi</Button>
                                            <Button type='text' onClick={() => setInputComment('')}>Cancel</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ul className={styles['listComments']}>
                                {issueView?.comments?.length !== 0 && issueView?.comments?.map((comment,index) => (
                                    <li key={index} className={styles['comment']}>
                                        <Avatar src={comment?.avatarUrl} />
                                        <div className={styles['comment-info']}>
                                            <p>{comment?.userName}  <span>{moment(comment?.updatedAt).fromNow()}</span></p>
                                            <span>{comment?.comment}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={styles['modal_body-status']}>
                        <div>
                            <p className={styles['text-label']}>Status</p>
                            <Select bordered={false} style={{width: '100%'}} defaultValue={issueView?.status} 
                            onChange={handleChangeStatus}>
                                <Select.Option value="backlog">
                                    <Button type="primary" style={{backgroundColor: '#9999',borderColor: 'transparent'}}>BACKLOG</Button>
                                </Select.Option>
                                <Select.Option value="selected">
                                    <Button type="primary" style={{backgroundColor: '#999',borderColor: 'transparent'}}>SELECTED FOR DEVELOPMENT</Button>
                                </Select.Option>
                                <Select.Option value="progress">
                                    <Button type='primary'>IN PROGRESS</Button>
                                </Select.Option>
                                <Select.Option value="done">
                                    <Button type="primary" style={{backgroundColor: 'yellowgreen',borderColor: 'transparent'}}>DONE</Button>
                                </Select.Option>
                            </Select>
                        </div>
                        <div>
                            <p className={styles['text-label']}>ASSIGNEES</p>
                            <Select bordered={false} size='large' placeholder='Unassigned' mode='multiple' style={{width: '100%'}} defaultValue={issueView?.assignees?.map(user => user.id)} 
                            onChange={(value) => value && handleChangeInfo({assignees: value})}>
                                {projectView?.userIds?.length && projectView?.userIds?.map(user => (
                                    <Select.Option key={user?.id} value={user.id}>
                                        <div style={{height: '100%',display: 'flex', alignItems: 'center',gap: 5}}>
                                            <Avatar size='small' src={user?.avatarUrl} /> {user.name}
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <p className={styles['text-label']}>REPORTER</p>
                            <Select bordered={false} size='large' style={{width: '100%'}} defaultValue={issueView?.reporterId?.id} onChange={(value) => value && handleChangeInfo({reporterId: value})} optionLabelProp="label">
                                {issueView?.reporterId && (
                                    <Select.Option value={issueView?.reporterId?.id} label={
                                        <Button type="primary" style={{height: '100%',display: 'flex', alignItems: 'center', gap: 5,backgroundColor: '#9999',borderColor: 'transparent'}}>
                                            <Avatar size='small' src={issueView?.reporterId?.avatarUrl} /> {' '+issueView?.reporterId?.name}
                                        </Button>
                                    }>
                                        <Avatar size='small' src={issueView?.reporterId?.avatarUrl} /> {issueView?.reporterId?.name}
                                    </Select.Option>
                                )}
                                {projectView?.userIds?.length && projectView?.userIds?.map(user => user.id !== issueView?.reporterId?.id && (
                                    <Select.Option key={user?.id} value={user.id} label={
                                        <Button type="primary" style={{height: '100%',display: 'flex', alignItems: 'center', gap: 5,backgroundColor: '#9999',borderColor: 'transparent'}}>
                                            <Avatar size='small' src={user?.avatarUrl} /> {' '+user.name}
                                        </Button>
                                    }>
                                        <Avatar size='small' src={user?.avatarUrl} /> {user.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <p className={styles['text-label']}>PRIORITY</p>
                            <Select bordered={false} style={{width: '100%'}} defaultValue={issueView?.priority} onChange={(value) => value && handleChangeInfo({priority: value})} >
                                {Object.keys(issuesPriority)?.map(priority => (
                                    <Select.Option key={priority} value={priority}>
                                        {issuesPriority[priority]} 
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <p className={styles['text-label']}>ORIGINAL ESTIMATE (HOURS)</p>
                            <InputNumber style={{width:'100%'}} disabled={issueView?.status === 'done'} type="number" defaultValue={issueView?.estimate > 0 && issueView?.estimate} placeholder="No time logged" controls={false}
                            onChange={(value) => typeof value === 'number' && handleChangeInfo({estimate: value})} />
                            <p className={styles['text-label']}>TIME TRACKING</p>
                            <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '0 5px'}}>
                                <ClockCircleOutlined /> 
                                <Progress
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '50%': '#87d068',
                                        '100%': '#ff0000',
                                    }}
                                    showInfo={issueView?.estimate && (timeTrackingPercent >= 100 || issueView?.status === 'done')}
                                    status={issueView?.status === 'done' ? 'success' : timeTrackingPercent >= 100 && 'exception'}
                                    percent={timeTrackingPercent}
                                />
                            </div>
                        </div>
                        <div>
                            <p className={styles['text-label']}>DeadLine</p>
                            <DatePicker disabled={issueView?.status === 'done' || currentUser.id !== projectView.userId} defaultValue={issueView?.deadline && moment(issueView?.deadline)}  onChange={(date) => {
                                const time = date._d.getTime()
                                if(typeof time === 'number' && time > 0){
                                    handleChangeInfo({deadline: time})
                                }
                            }} />
                        </div>
                        <Divider />
                        <div>
                            <p>Created at {moment(issueView?.createdAt).fromNow()}</p>
                            <p>Updated at {moment(issueView?.updatedAt).fromNow()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}