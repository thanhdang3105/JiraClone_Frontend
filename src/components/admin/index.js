import styles from './admin.module.scss'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import * as icons from '@ant-design/icons'
import { Avatar, Layout, Menu, Tooltip } from 'antd';
import React, { useState } from 'react';
import ContentPage from './contentPage';
import dataPage from './page.json'
import { Link, useSearchParams } from 'react-router-dom';
const { Header, Sider, Content } = Layout;

const App = () => {
const [collapsed, setCollapsed] = useState(false);
const [menuSelectedKey,setMenuSelectedKey] = useState(dataPage[0].sid)

const [searchParams,setSearchParams] = useSearchParams()

const itemMenu = React.useMemo(() => {
    if(dataPage && dataPage.length){
        return dataPage.map(item => (
            {
                key: item.sid,
                icon: item.icon && React.createElement(icons[item.icon]),
                label: item.name,
            }
        ))
    }
    return []
},[])

React.useEffect(() => {
    setMenuSelectedKey(searchParams.get('sid'))
},[searchParams])

const handleClickMenu = (key) => {
    setMenuSelectedKey(key.keyPath)
    setSearchParams('sid='+ key.key)
}

return (
    <Layout className={styles['wrapper']} hasSider>
        <Sider trigger={null} collapsible collapsed={collapsed} className={styles['wrapper_sider']}>
            <div className={styles['sider_logo']}>
                <Link to='/'><img src='/images/logo.png' alt='logo' /></Link>
            </div>
            <Menu
            theme="dark"
            mode="inline"
            selectedKeys={menuSelectedKey}
            defaultSelectedKeys={['1']}
            items={itemMenu}
            onClick={handleClickMenu}
            />
        </Sider>
        <Layout style={collapsed ? {marginLeft: '80px'} : {marginLeft: '200px'}} className={styles['wrapper_body']}>
            <Header style={collapsed ? {paddingLeft: '108px'} : {paddingLeft: '228px'}} className={styles['body_header']}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: styles['header_menu-trigger'],
                onClick: () => setCollapsed(!collapsed),
            })}
            <Tooltip title='Profile' color='#17a2b8'>
                <Avatar src='/images/logo.png' alt='avatar' />
            </Tooltip>
            </Header>
            <Content
            className={styles['body_content']}
            >
            <ContentPage />
            </Content>
        </Layout>
    </Layout>
);
};
export default App;