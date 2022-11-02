import styles from '../admin.module.scss'
import * as Antd from 'antd'
import React from 'react';
import {UploadOutlined} from '@ant-design/icons'
import { storage } from '../../../firebase/config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import moment from 'moment';
import customFetch from '../../../hook/customFetch';


export default function ModalDefault({open:{open,setOpen},data,dataCollections,setDataView,dataEdit}) {
    const [disabledBtnOk,setDisabledBtnOk] = React.useState(true)

    const formRef = React.createRef()

    const handleCloseModal = React.useCallback(() => {
        setOpen(false)
        setDisabledBtnOk(true)
    },[setOpen])

    const create = React.useCallback((formData) => {
        Antd.message.loading({
            content: 'Loading...',
            key: 'create',
            duration: 100
        })
        customFetch(`/${data.modelName}`,{
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(data => {
                setDataView(prev => {
                    prev.unshift(data)
                    return prev
                })
                handleCloseModal()
                Antd.message.success({
                    content: 'Success',
                    key: 'create',
                    duration: 2
                })
            }).catch(err => {
                console.log(err)
                Antd.message.error({
                    content: err?.details || err?.message || 'Lỗi',
                    key: 'create',
                    duration: 2
                })
            })
    },[data,handleCloseModal,setDataView])

    const update = React.useCallback((formData) => {
        Antd.message.loading({
            content: 'Loading...',
            key: 'update',
            duration: 100
        })
        customFetch(`/${data.modelName}/${dataEdit.id}`,{
            method: 'PATCH',
            body: JSON.stringify(formData)
        }).then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(data => {
                setDataView(prev => {
                    prev.map(item => {
                        if(item.id === data.id){
                            Object.assign(item,data)
                        }
                        return item
                    })
                    return [...prev]
                })
                handleCloseModal()
                Antd.message.success({
                    content: 'Success',
                    key: 'update',
                    duration: 2
                })
            }).catch(err => {
                console.log(err)
                Antd.message.error({
                    content: err?.details || err?.message || 'Lỗi',
                    key: 'update',
                    duration: 2
                })
            })
    },[data,dataEdit,setDataView,handleCloseModal])

    const handleSubmitForm = async (formData) => {
        if(formData.deadline){
            formData.deadline = formData.deadline._d.getTime()
        }
        if(formData.avatarUrl?.file){
            const storageRef = await uploadBytes(ref(storage,formData.avatarUrl?.file.name), formData.avatarUrl?.file.originFileObj)
            formData.avatarUrl = await getDownloadURL(storageRef.ref)
        }
        if(open === 'update' && dataEdit){
            update(formData)
        }else if(open === 'create'){
            create(formData)
        }
    }

    const customRender = (item) => {
        let render = React.createElement(Antd[item.widget])
        if(item.options){
            const options = item?.options?.map(option => (
                <Antd.Select.Option key={option} value={option}>{option[0].toUpperCase() + option.substring(1)}</Antd.Select.Option>
            ))
            render = React.createElement(Antd[item.widget],null,...options)
        }else if(item.widget === 'Upload') {
            render = React.createElement(Antd[item.widget],{maxCount:1},<Antd.Button icon={<UploadOutlined />}>Click to Upload</Antd.Button>)
        }else if(item.collection){
            const options = dataCollections[item.collection].map(option => (
                <Antd.Select.Option key={option.id} value={option.id}>{option.name || option.title || option.label || option.id}</Antd.Select.Option>
            ))
            render = React.createElement(Antd['Select'],null,...options)
        }
        return (
            <Antd.Form.Item key={item.field} rules={[{required: item.required}]} className={styles['form_item']} label={item.name} name={item.field}>
                {render}
            </Antd.Form.Item>
        )
    }

    return (
        <Antd.Modal centered open title={data.name} destroyOnClose onCancel={handleCloseModal}
        footer={[
            <Antd.Button type='primary' disabled={disabledBtnOk} className={styles['btn']} onClick={() => formRef.current.submit()}>{open}</Antd.Button>,
            <Antd.Button onClick={() => setOpen(false)}>Cancel</Antd.Button>
        ]}>
            <Antd.Form className={styles['modal_form']} ref={formRef} 
            onFieldsChange={() => setDisabledBtnOk(false)}
            initialValues={{
                ...dataEdit,
                deadline: dataEdit?.deadline && moment(dataEdit?.deadline)
            }} layout="vertical" onFinish={handleSubmitForm}>
                {data?.models?.map(item => customRender(item))}
            </Antd.Form>
        </Antd.Modal>
    )
}