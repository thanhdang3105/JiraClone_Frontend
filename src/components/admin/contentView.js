import styles from './admin.module.scss'
import * as icons from '@ant-design/icons'
import { DownOutlined, SearchOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Menu, message, Table, Tag, Tooltip } from 'antd';
import React from 'react';
import customFetch from '../../hook/customFetch'
import Search from 'antd/lib/input/Search';
import moment from 'moment';
import ModalDefault from './modal/modalDefault';
import AdvancedSearch from './modal/advancedSearch';

export default function ContentView({data}) {
    const [openModal,setOpenModal] = React.useState(false)
    const [openAdvancedSearch,setOpenAdvancedSearch] = React.useState(false)
    const [loadingTable,setLoadingTable] = React.useState(false)
    const [dataView,setDataView] = React.useState(false)
    const [dataCollections,setDataCollections] = React.useState(false)
    const [inputSearch,setInputSearch] = React.useState('')
    const [tagsSearch,setTagsSearch] = React.useState([])
    const [dataEdit,setDataEdit] = React.useState()

    const handleClickAction = React.useCallback((mode,action,item) => {
        if(mode === 'delete'){
            setLoadingTable(true)
            customFetch('/'+data.modelName+'/'+item.id,{
                method: 'DELETE'
            }).then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(() => {
                setDataView(prev => prev.filter(data => data.id !== item.id))
                setLoadingTable(false)
            }).catch(err => {
                setLoadingTable(false)
                console.log(err)
                message.error({
                    content: err?.message || 'Lỗi',
                    key: 'findData',
                    duration: 2
                })
            })
        }else{
            setOpenModal(mode)
            item && setDataEdit(item)
        }
    },[data])

    const actionMenu = React.useCallback((dataInfo) =>{
        const itemMenu = data?.buttons?.filter(item => item.position.includes('action'))
        return <Menu
        items={itemMenu?.map(item => {
            let icon = React.createElement(icons[item.icon])
            if(!icon.type){
                icon = undefined
            }
            return {
                key: item.name+dataInfo.id,
                label: item.name,
                icon,
                onClick: () => handleClickAction(item.mode,item.action,dataInfo)
            }
        })} />
    },[data,handleClickAction])

    const convertData = React.useCallback((data) => {
        if(data) {
            const converted = data?.map((item,index) => ({
                ...item,
                indexList: index + 1,
                id: item.id,
                key: item.id,
                action: <Dropdown trigger='click' overlay={actionMenu(item)}><Button type='text' shape='circle'><SettingOutlined /></Button></Dropdown>
            }))
            return converted
        }
        return []
    },[actionMenu])

    const getData = React.useCallback((modelName) => {
        let model = modelName || data?.modelName
        if(model){
            return new Promise((resolve, reject) => {
                setLoadingTable(true)
                customFetch('/'+model+'?sort=createdAt DESC&populate=false')
                .then(res => {
                    if(res.status === 200) return res.json()
                    return res.text().then(text => {throw new Error(text)})
                }).then(data => {
                    resolve(data)
                    setLoadingTable(false)
                    setInputSearch('')
                }).catch(err => {
                    setLoadingTable(false)
                    reject(err)
                    message.error({
                        content: err?.message || 'Lỗi',
                        key: 'findData',
                        duration: 2
                    })
                })
            })
        }
        return []
    },[data])

    React.useLayoutEffect(() => {
        if(!dataView){
             getData().then(data => {
                setDataView(data)
             }).catch(err => console.log(err))
        }
    },[dataView,getData])

    React.useLayoutEffect(() => {
        if(data.collections){
            data.collections.map(collection => {
                getData(collection).then(data => {
                    setDataCollections(prev => {
                        if(!prev){
                            return {[collection]: data}
                        }else{
                            return {...prev,[collection]: data}
                        }
                    })
                 }).catch(err => console.log(err))
                 return collection
            })
        }
    },[data,getData])

    React.useEffect(() => {
        if(!openModal) setDataEdit()
    },[openModal])

    const columns = React.useMemo(() => {
        const defaultColumns = [{
            title: 'Index',
            dataIndex: 'indexList'
        },{
            title: 'Id',
            dataIndex: 'id'
        }]
        const dataConverted = data?.columns?.map(item => {
            let render
            if(item.widget === 'date'){
                render = (value) => value && moment(value).format()
            }else if(item.widget){
                render = (value) => {
                    let color
                    switch (value) {
                        case 'task':
                            color = 'blue'
                            break;
                        case 'bug': 
                            color = 'error'
                            break;
                        case 'story':
                            color="success"
                            break;
                        case 'selected':
                            color="lime"
                            break;
                        case 'progress':
                            color="processing"
                            break;
                        case 'done':
                            color="success"
                            break;
                        default:
                            color="default"
                            break;
                    }
                    return <Tag color={color}>{value[0].toUpperCase() + value.substring(1)}</Tag>
                }
            }else if(item.collection){
                render = (value) => {
                    const check = dataCollections[item.collection]?.find(info => info.id === value)
                    if(check) return check.name || check.title
                    return value
                }
            }
            return {
                title: item.name,
                dataIndex: item.field,
                render
            }
        })
        dataConverted?.unshift(...defaultColumns)
        dataConverted?.push({
            title: 'Action',
            dataIndex: 'action'
        })
        return dataConverted
    },[data,dataCollections])

    const extraTitle = React.useMemo(() => {
        const btn = data?.buttons?.filter(item => item.position.includes('table'))
        return btn.map((item,index) => (
            <Button key={index} type='primary' onClick={() => handleClickAction(item.mode,item.action)} className={styles['btn']} icon={React.createElement(icons[item.icon])}>{item.name}</Button>
        ))
    },[data,handleClickAction])

    const handleSearch = (value) => {
        if(value && typeof value === 'string'){
            setLoadingTable(true)
            const fieldSearch = data.columns[0].field
            customFetch(`/${data.modelName}?where={"${fieldSearch}":{"contains":"${value}"}}&populate=false`)
            .then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(data => {
                setDataView(data)
                setLoadingTable(false)
                setInputSearch('')
                setTagsSearch([`"${fieldSearch}": "${value}"`])
            }).catch(err => {
                console.log(err)
                setLoadingTable(false)
                message.error({
                    content: err?.details || err?.message || 'Lỗi',
                    key: 'findData',
                    duration: 2
                })
            })
        }
    }
    
    const handleRefresh = () => {
        getData().then(data => {
            setDataView(data)
        }).catch(err => console.log(err))
        setTagsSearch([])
    }

    return (
        <Card
      title={data?.name}
      extra={extraTitle}
      className={styles['content_view']}
    >
        <div className={styles['content_searchBox']}>
            <div className={styles['search_tags']}>
                {tagsSearch && tagsSearch.length !== 0 && (
                    <>Search: {tagsSearch.map(tag => (
                        <Tag color='#17a2b8' style={{lineHeight: 2}}>{tag}</Tag>
                    ))}</>
                )}
            </div>
            <Search value={inputSearch} allowClear onChange={(e) => setInputSearch(e.target.value)} placeholder={data.columns[0].name} onSearch={handleSearch} className={styles['input_search']} 
            enterButton={<Button type='primary'><SearchOutlined /></Button>} />
            <Tooltip placement='bottom' color='#17a2b8' title='Advanced search'>
                <Button type='primary' className={styles['btn']} onClick={() => setOpenAdvancedSearch(true)}><DownOutlined /></Button>
            </Tooltip>
            <Tooltip placement='bottom' title='Refresh' color='#17a2b8'>
                <Button type='primary' className={styles['btn']} onClick={handleRefresh}><SyncOutlined /></Button>
            </Tooltip>
        </div>
        <Table
            loading={loadingTable}
            columns={columns}
            dataSource={convertData(dataView)}
            bordered
            scroll={{
                scrollToFirstRowOnChange: true,
                x: true,
            }}
            className={styles['wrapper_table']}
        />
        {openModal && <ModalDefault open={{open: openModal,setOpen: setOpenModal}} data={data} dataCollections={dataCollections} setDataView={setDataView} dataEdit={dataEdit} />}
        {openAdvancedSearch && <AdvancedSearch open={{open: openAdvancedSearch,setOpen: setOpenAdvancedSearch}} setTagsSearch={setTagsSearch} data={data} setDataView={setDataView} />}
    </Card>
    )
}