import React from 'react'
import styles from './siderbar.module.scss'
import {QuestionCircleOutlined, SearchOutlined,PlusOutlined, CreditCardOutlined, SettingOutlined, TeamOutlined} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { projectViewSelector } from '../../redux/selector'
import { useSelector } from 'react-redux'
import CreateIssues from '../modal/CreateIssues'
import MembersSetting from '../modal/MembersSetting'
import SearchIssuesApi from '../modal/searchIssues/SearchIssues'

export default function SiderBar(){
    const [openSearchApi,setOpenSearchApi] = React.useState(false)
    const [createIssues,setCreateIssues] = React.useState(false)
    const [membersSetting,setMembersSetting] = React.useState(false)

    const projectData = useSelector(projectViewSelector)

    const navigate = useNavigate()
    const location = useLocation()

    React.useEffect(() => {
        !Object.values(projectData).length && navigate('/')
        const boardEle = document.getElementById('board')
        const settingsEle = document.getElementById('settings')
        if(location.pathname.includes('settings')){
            boardEle?.classList.remove(styles['active'])
            settingsEle?.classList.add(styles['active'])
        }else if(location.pathname.includes('projects')){
            settingsEle?.classList.remove(styles['active'])
            boardEle?.classList.add(styles['active'])
        }else{
            boardEle?.classList.remove(styles['active'])
            settingsEle?.classList.remove(styles['active'])
        }
    },[location,projectData,navigate])

    return (
        <div className={styles['wrapper_sider']}>
            <SearchIssuesApi open={{open: openSearchApi,setOpen: setOpenSearchApi}} />
            <CreateIssues open={{open: createIssues,setOpen: setCreateIssues}} />
            <MembersSetting open={{open: membersSetting,setOpen: setMembersSetting}} />
            <div className={styles['sider_collapse']}>
                <div className={styles['sider_collapse-logo']}>
                    <Link to='/'><img width={28} height={28} src='/images/logo.png' alt='Jira Clone' /></Link>
                </div>
                <ul className={styles['sider_collapse-list']}>
                    <li className={styles['sider_collapse-item']} onClick={() => setOpenSearchApi(true)}>
                        <SearchOutlined /><strong>SEARCH ISSUES</strong>
                    </li>
                    <li className={styles['sider_collapse-item']} onClick={() => setMembersSetting(true)}>
                        <TeamOutlined /><strong>MEMBERS SETTING</strong>
                    </li>
                    <li className={styles['sider_collapse-item']} onClick={() => setCreateIssues(true)}>
                        <PlusOutlined /><strong>CREATE ISSUE</strong>
                    </li>
                    <li className={styles['sider_collapse-item']}>
                        <QuestionCircleOutlined /><strong>ABOUT</strong>
                    </li>
                </ul>
            </div>
            <div className={styles['sider_menu']}>
                <div className={styles['sider_menu-info']}>
                    <div className={styles['sider_menu-info--ava']}>
                        <img  width={50} height={50} src={'/images/logo.png'} alt='avatar' />
                    </div>
                    <div className={styles['sider_menu-info-title']}>
                        <h4>{projectData?.name}</h4>
                        <span>{projectData?.category} project</span>
                    </div>
                </div>
                <ul className={styles['sider_menu-list']}>
                    <Link to={projectData?.name?.split(' ').join('-')}><li id='board' className={styles['sider_menu-item']}>
                        <CreditCardOutlined />Kanban Board
                    </li></Link>
                    <Link to={projectData?.name?.split(' ').join('-')+'/settings'}><li id='settings' className={styles['sider_menu-item']}>
                        <SettingOutlined />Project Settings
                    </li></Link>
                </ul>
            </div>
        </div>
    )
    
}