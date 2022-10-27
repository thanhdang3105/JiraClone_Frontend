import { PlusOutlined,CloseOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, message, Spin } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import customFetch from '../../hook/customFetch';
import { setFilter } from '../../redux/filterSlice';
import { setInitialIssues } from '../../redux/issuesSlice';
import { deleteProject, setInitialProjects, setProjectView } from '../../redux/projectSlice';
import { listProjectsSelector, userSelector } from '../../redux/selector';
import { setCurrentUser } from '../../redux/userSlice';
import CreateProject from '../modal/CreateProject';
import UserInfo from '../userInfo';
import styles from './homepage.module.scss'

export default function HomePage() {
    const [isCreateProject,setIsCreateProject] = React.useState(false)
    const [loading,setLoading] = React.useState(true)

    const listProjects = useSelector(listProjectsSelector)
    const currentUser = useSelector(userSelector)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    React.useEffect(() => {
        window.onbeforeunload = () => {
            navigator.sendBeacon(process.env.REACT_APP_SERVERURL+'/api/users/logout')
        }
        if(!Object.values(currentUser).length){
            const accessToken = localStorage.getItem('access_token')
            if(accessToken){
                customFetch('/api/users/authorization',{
                    method: 'POST',
                    body: JSON.stringify({accessToken})
                }).then(res => {
                    if(res.status === 200){
                        return res.json()
                    }else if(res.status === 400){
                        throw new Error('Tài khoản không tồn tại!')
                    }else{
                        throw new Error('Lỗi!')
                    }
                }).then(data => {
                    if(data.accessToken){
                        localStorage.setItem('access_token',data.accessToken)
                        delete data.accessToken
                    }
                    setLoading(false)
                    dispatch(setInitialProjects(data.projectIds))
                    dispatch(setCurrentUser(data))
                }).catch(err => {
                    localStorage.removeItem('access_token')
                    console.log(err)
                    setLoading(false)
                    navigate('/authentication')
                })
            }else{
                setLoading(false)
                navigate('/authentication')
            }
        }else{
            setLoading(false)
        }
    },[dispatch,navigate,currentUser])

    const handleDeletePJ = (projectId) => {
        message.loading({
            content: 'Loading...',
            key: 'delete-project',
            duration:100
        })
        customFetch('/api/projects?projectId='+projectId,{
            method: 'DELETE',
        }).then(res => {
            if(res.status === 200) return res.json();
            throw new Error('Lỗi')
        }).then(data => {
            message.success({
                content: data.message,
                key: 'delete-project',
                duration: 2
            })
            dispatch(deleteProject(projectId))
        }).catch(err => {
            message.error({
                content: err.message,
                key: 'delete-project',
                duration: 2
            })
        })
    }

    const handleChooseProject = (id) => {
        try {
            customFetch('/api/projects?id='+id)
            .then(res => {
                if(res.status === 200) return res.json();
                throw new Error('Lỗi')
            }).then(data => {
                if(data) {
                    dispatch(setInitialIssues(data.issues))
                    dispatch(setFilter({action: 'clear'}))
                    dispatch(setProjectView(data.project))
                    navigate('/projects/'+data.project?.name?.split(' ').join('-'))
                }
            })
            .catch(err => console.error(err))
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = () => {
        dispatch(setCurrentUser({}))
        localStorage.removeItem('access_token')
        customFetch('/api/users/logout',{method: 'POST'})
    }

    return loading ? <div className={styles['overlay_loading']}><Spin size='large' /></div> : (
        <div className={styles['wrapper_homePage']}>
            <div className={styles['homePage_siderBar']}>
                <UserInfo />
                <ul className={styles['homePage_siderBar-listBtn']}>
                    <li className={styles['siderBar_listBtn-item']}>
                        <Button type="text" icon={<PlusOutlined />} onClick={() => setIsCreateProject(true)}>Create Projects</Button>
                    </li>
                    <li className={styles['siderBar_listBtn-item']}>
                        <Button type="primary" icon={<LogoutOutlined />} danger onClick={handleLogout}>Logout</Button>
                    </li>
                </ul>
            </div>
            <div className={styles['homePage_body']}>
                <h1 className={styles['homePage_body-title']}>Danh sách projects</h1>
                {listProjects?.length ? (
                    <ul className={styles['homePage_body-listPJ']}>
                        {listProjects.map(item => (
                            <li key={item?.id} className={styles['homePage_listPJ-item']} onClick={() => handleChooseProject(item?.id)}>
                                <div className={styles['item_info']}>
                                    <p>{item?.name} <span> {item?.category}</span></p>
                                    <span className={styles['item_info-desc']} >{item?.description}</span>
                                    <a href={item?.projectUrl}>{item?.projectUrl}</a>
                                </div>
                                <Button type='text' shape='circle' icon={<CloseOutlined />} onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeletePJ(item?.id)
                                }} />
                            </li>
                        ))}
                    </ul>
                ) : <div>
                        Bạn chưa có project nào. 
                        <Button type='dashed' icon={<PlusOutlined />} onClick={() => setIsCreateProject(true)}>Tạo project mới</Button>
                    </div>}
            </div>
            <CreateProject open={{open:isCreateProject,setOpen: setIsCreateProject}} />
        </div>
    )
}