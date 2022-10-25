import React from 'react';
import styles from './projectDetails.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { projectViewSelector } from '../../redux/selector';
import { Button, Form, Input, message, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import customFetch from '../../hook/customFetch';
import { updateProject } from '../../redux/projectSlice';

export default function ProjectDetails() {

    const formProjectDetailsRef = React.createRef()
    const btn_submitRef = React.useRef()

    const projectView = useSelector(projectViewSelector)
    const dispatch = useDispatch()

    const handleValuesChange = (changedValues) => {
        const valueKeys = Object.keys(changedValues)
        btn_submitRef.current.setAttribute('disabled',true)
        if(valueKeys.length){
            valueKeys.map(key => {
                if(changedValues[key] !== projectView[key]){
                    btn_submitRef.current?.removeAttribute('disabled')
                }
                return key
            })
        }
    }

    const handleSubmitFrom = (formData) => {
        if(Object.values(formData).length){
            message.loading({
                content: 'Loading...',
                key: 'updateProject',
                duration: 100
            })
            formData.id = projectView.id
            customFetch('/api/projects/update',{
                method: 'PATCH',
                body: JSON.stringify(formData)
            }).then(res => {
                if(res.status === 200) return res.json();
                res.text().then(text => {throw new Error(text)})
            }).then(data => {
                message.success({
                    content: 'Cập nhật thành công!',
                    key: 'updateProject',
                    duration: 2
                })
                btn_submitRef.current?.setAttribute('disabled',true)
                dispatch(updateProject(data))
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'updateProject',
                    duration: 2
                })
            })
        }
    }

    return (
        <div className={styles['wrapper_projectDetails']}>
            <div className={styles['projectDetails_content']}>
                <div className={styles['content_heading']}>
                    <h3>Projects / {projectView?.name} / Project Details</h3>
                    <h2>Project Details</h2>
                </div>
                <div className={styles['content_body']}>
                    <Form layout='vertical' ref={formProjectDetailsRef} onFinish={handleSubmitFrom} onValuesChange={handleValuesChange}
                     initialValues={{
                        name: projectView?.name,
                        projectUrl: projectView?.projectUrl,
                        description: projectView?.description,
                        category: projectView?.category,
                    }} >
                        <Form.Item label='Name' name='name'>
                            <Input required />
                        </Form.Item>
                        <Form.Item label='URL' name='projectUrl'>
                            <Input required />
                        </Form.Item>
                        <Form.Item label="Description" name="description" rules={[{required: true, message: 'Vui lòng nhập mô tả!'}]}>
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item name="category" label="Project Category"
                            rules={[{required: true,message: 'Bạn chưa chọn Category!'}]}
                        >
                            <Select style={{width: '100%',}}>
                                <Select.Option value="software">Software</Select.Option>
                                <Select.Option value="marketing">Marketing</Select.Option>
                                <Select.Option value="business">Business</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button disabled ref={btn_submitRef} type='primary' htmlType='submit'>Save changes</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    )
}