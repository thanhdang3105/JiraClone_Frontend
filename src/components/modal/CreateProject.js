import { Form, Input, Modal, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import customFetch from "../../hook/customFetch";
import { createProject } from "../../redux/projectSlice";
import { userSelector } from "../../redux/selector";

export default function CreateProject({open:{open,setOpen}}) {

    const formRef = React.createRef()

    const dispatch = useDispatch()
    const currentUser = useSelector(userSelector)

    const formSubmit = (value) => {
        value.userId = currentUser.id
        value.userIds = currentUser.id
        customFetch('/api/projects/create',{
            method: 'POST',
            body: JSON.stringify(value),
        }).then(res => {
            if(res.status === 200){
                return res.json()
            }
        }).then(data => {
            dispatch(createProject(data))
            formRef.current.resetFields()
            setOpen(false)
        }).catch(err => {
            console.log(err)
        })
    }
    
    return (
        <Modal
        open={open}
        title="Create Project"
        width={800}
        okText='Create project'
        onCancel={() => setOpen(false)}
        onOk={() => formRef.current.submit()}
        >
            <Form ref={formRef} layout='vertical' name="formCreateProject" onFinish={formSubmit} 
                initialValues={{
                    category: 'software'
                }}
            >
                <Form.Item
                    name="category"
                    label="Project Category"
                    rules={[{required: true,message: 'Bạn chưa chọn Category!'}]}
                >
                    <Select style={{width: '100%',}}>
                        <Select.Option value="software">Software</Select.Option>
                        <Select.Option value="marketing">Marketing</Select.Option>
                        <Select.Option value="business">Business</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{required: true,message: 'Bạn chưa nhập tên Project!'}]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    name="projectUrl"
                    label="URL"
                    rules={[{required: true,message: 'Bạn chưa nhập Link Project!'}]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}