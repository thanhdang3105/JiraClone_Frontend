import { Button, Divider, Form, Input, message, Modal, Select, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import React from 'react';
import styles from '../admin.module.scss'
import customFetch from '../../../hook/customFetch';

export default function AdvancedSearch({open:{open,setOpen}, data, setDataView}) {
    const [loading,setLoading] = React.useState(false)
    const [columnOption,setColumnOption] = React.useState()
    const [operatorOption,setOperatorOption] = React.useState([])

    const formRef = React.createRef()

    React.useLayoutEffect(() => {
        if(data && data.columns){
            setColumnOption(data.columns.filter(item => item.filterable))
        }
    },[data])

    const listOperator = React.useMemo(() => {
        return {
            string: ['contains','startsWith','endsWith'],
            number: ['=','!=','>','<','<=','>=']
        }
    },[])

    const handleRefreshForm = () => {
        formRef.current?.resetFields()
        setOperatorOption([])
    }
    
    const handleCloseModal = () => {
        setOpen(false)
        handleRefreshForm()
    }

    
    const handleOk = () => formRef.current.submit()

    const handleSubmitForm = (formData) => {
        let query
        formData?.search?.map(item => {
            if(!query){
                query = `{"${item.column}":{"${item.operator}":"${item.value}"}`    
            }else{
                query = query + `,"${item.column}":{"${item.operator}":"${item.value}"}`
            }
            return item
        })
        setLoading(true)
        customFetch(`/${data.modelName}?where=${query}}&populate=false`)
            .then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(data => {
                setDataView(data)
                handleCloseModal()
                message.success({
                    content: 'Success',
                    key: 'advancedSearch',
                    duration: 2
                })
                setLoading(false)
            }).catch(err => {
                console.log(err)
                setLoading(false)
                message.error({
                    content: err?.details || err?.message || 'Lỗi',
                    key: 'advancedSearch',
                    duration: 2
                })
            })
    } 

    return (
        <Modal centered open={open} width={700} title='Advanced Search' destroyOnClose onCancel={handleCloseModal}
        footer={[
            <Button type='primary' className={styles['btn']} loading={loading} onClick={handleOk}>Search</Button>,
            <Button type='primary' className={styles['btn']} onClick={handleRefreshForm}>Refresh</Button>,
            <Button onClick={handleCloseModal}>Cancel</Button>
        ]}>
            <Form layout='vertical' ref={formRef} onFinish={handleSubmitForm} initialValues={{search: [{column: undefined,operator: undefined,value: ''}]}}>
                <Form.List name='search'>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => {
                                return (
                                    <Space key={key} className={styles['space_box']}>
                                        <Form.Item
                                        {...restField}
                                        label="Column"
                                        className={styles['form_item']}
                                        name={[name, 'column']}
                                        rules={[{required: true,message: 'isRequired'}]}
                                        >
                                        <Select placeholder="Please select an option" onChange={(value) => {
                                            const type = columnOption.find(item => item.field === value)
                                            setOperatorOption(prev => {
                                                if(prev?.length > name){
                                                    prev[name] = listOperator[type.type]
                                                }else{
                                                    prev.push(listOperator[type.type])
                                                }
                                                return [...prev]
                                            }) 
                                        }}>
                                            {columnOption?.map(option => (
                                                <Select.Option key={option.name+'-'+key} value={option.field}>{option.name}</Select.Option>
                                            ))}
                                        </Select>
                                        </Form.Item>
                                        <Form.Item
                                        {...restField}
                                        label="Operator"
                                        name={[name, 'operator']}
                                        className={styles['form_item']}
                                        rules={[{required: true,message: 'isRequired'}]}
                                        >
                                        <Select disabled={!operatorOption?.length > name} placeholder="Please select an option">
                                            {operatorOption?.length >= name && operatorOption[name]?.map(operator => (
                                                <Select.Option key={operator+'-'+key} value={operator}>{operator[0].toUpperCase() + operator.substring(1)}</Select.Option>
                                            ))}
                                        </Select>
                                        </Form.Item>
                                        <Form.Item
                                        {...restField}
                                        label="Value"
                                        name={[name, 'value']}
                                        className={styles['form_item']}
                                        rules={[{required: true,message: 'isRequired'}]}
                                        >
                                            <Input disabled={!operatorOption?.length > name} />
                                        </Form.Item>
                                        {fields.length > 1 && (
                                            <Button style={{marginBottom: 5}} icon={<DeleteOutlined style={{color: '#ff0000'}} onClick={() => remove(name)} />} />
                                        )}
                                    </Space>
                                    )
                            })}
                            <Divider />
                            <Form.Item>
                                <Button type="primary" disabled={!(fields?.length === operatorOption?.length)} className={styles['btn']} onClick={() => add()} icon={<PlusOutlined />}>
                                    Add field
                                </Button>
                            </Form.Item>
                        </>
                        )}
                </Form.List>
            </Form>
        </Modal>
    )
}