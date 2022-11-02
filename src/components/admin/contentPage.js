import { Tabs } from 'antd';
import * as icons from '@ant-design/icons'
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ContentView from './contentView';
import dataPage from './page.json'

export default function ContentPage() {
  const [flagData,setFlagData] = React.useState(false)
  const [listTab,setListTab] = React.useState([])
  const [activeKey,setActiveKey] = React.useState()

  const [searchParams,setSearchParams] = useSearchParams()

  const addTab = React.useCallback((tabInfo) => {
      setListTab(prev => {
          const tab = prev?.find(item => item.key === tabInfo.sid)
          if(!tab){
            const newListTab = [...prev]
            if(newListTab.length === 1) {
              Object.assign(newListTab[0],{closable: true})
            }
            newListTab.unshift({
              key: tabInfo.sid,
              label: <>{tabInfo.icon && React.createElement(icons[tabInfo.icon])}{tabInfo.name}</>,
              children: <ContentView data={tabInfo} flag={[flagData,setFlagData]} />
            })
            if(newListTab.length === 1) {
              Object.assign(newListTab[0],{closable: false})
            }
            return newListTab
          }
          return prev
      })
  },[flagData])

  React.useEffect(() => {
    const sid = searchParams.get('sid')
    if(sid && dataPage && dataPage.length){
      dataPage.map(item => {
        if(item.sid === sid){
          setActiveKey(item.sid)
          addTab(item)
        }
        return item
      })
    }
  },[searchParams,addTab])

    const onChange = (newActiveKey) => {
          setActiveKey(newActiveKey)
          setSearchParams('sid='+newActiveKey)
    };

    const onEdit = (targetKey, action) => {
      if(action === 'remove'){
        setListTab(prev => {
          const newListTab = prev?.filter((item,index) => {
            if(item.key === targetKey){
              const prevTab = prev[index - 1]?.key
              if(prevTab){
                onChange(prevTab)
              }else{
                const nextTab = prev[index + 1]?.key
                onChange(nextTab)
              }
            }
            return item.key !== targetKey
          })
          if(newListTab.length === 1){
            Object.assign(newListTab[0],{closable: false})
          }
          return newListTab
        })
      }
    }

    return (
        <Tabs
          type="editable-card"
          hideAdd
          onChange={onChange}
          destroyInactiveTabPane
          activeKey={activeKey}
          onEdit={onEdit}
          items={listTab}
        />
    )
}