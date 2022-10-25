import { ArrowDownOutlined, ArrowUpOutlined, BookTwoTone, CheckSquareTwoTone, ExclamationCircleTwoTone } from "@ant-design/icons";
import { Avatar, Form, Input, message, Modal, Select } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import customFetch from "../../hook/customFetch";
import { createIssues } from "../../redux/issuesSlice";
import { getIssues, projectViewSelector, userSelector } from "../../redux/selector";
import ReactQuill from 'react-quill'

export default function CreateIssues({open:{open,setOpen}}) {

    const formRef = React.createRef()

    const projectView = useSelector(projectViewSelector)
    const issuesList = useSelector(getIssues)
    const currentUser = useSelector(userSelector)

    const dispatch = useDispatch()

    const formSubmit = (value) => {
        if(projectView?.id){
            message.loading({
                content: 'Loading...',
                key: 'create-issues',
                duration: 100
            })
            value.index = issuesList['backlog'].length
            value.projectId = projectView.id
            customFetch('/api/issues/create',{
                method: 'POST',
                body: JSON.stringify(value)
            }).then(res => {
                if(res.status === 200) return res.json()
                throw new Error('Lỗi')
            }).then(data => {
                message.success({
                    content: 'Thêm thành công.',
                    key: 'create-issues',
                    duration: 2
                })
                dispatch(createIssues(data))
                formRef.current.resetFields()
                setOpen(false)
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'create-issues',
                    duration: 2
                })
            })
        }
    }
    
    return (
        <Modal
        open={open}
        title="Create Issues"
        width={800}
        style={{top: '20px'}}
        okText='Create issues'
        onCancel={() => setOpen(false)}
        onOk={() => formRef.current.submit()}
        >
            <Form ref={formRef} layout='vertical' name="formCreate" onFinish={formSubmit} 
                initialValues={{
                    type: 'task',
                    reporterId: currentUser?.id,
                    priority: 'medium'
                }}
            >
                <Form.Item
                    name="type"
                    label="Issue Type"
                    rules={[{required: true,message: 'Bạn chưa chọn Type!'}]}
                >
                    <Select style={{width: '100%',}}>
                        <Select.Option value="task"><CheckSquareTwoTone /> Task</Select.Option>
                        <Select.Option value="bug"><ExclamationCircleTwoTone twoToneColor={'#ff0000'} /> Bug</Select.Option>
                        <Select.Option value="story"><BookTwoTone twoToneColor='#00fe00' /> Story</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="title"
                    label="Short Summary"
                    rules={[{required: true,message: 'Bạn chưa nhập Title!'}]}
                >
                    <Input />
                </Form.Item>
                <div>
                <Form.Item label="Description" name="description" rules={[{required: true}]}>
                    <ReactQuill
                        // value={this.state.text}
                        // onChange={this.handleChange}
                        placeholder={"Enter new content here..."}
                    />
                </Form.Item>
                </div>
                <Form.Item label='Reporter' name='reporterId' rules={[{required: true,message: 'Bạn chưa chọn Reporter!'}]}>
                    <Select size="large" style={{width: '100%',}} placeholder="Select">
                        {projectView?.userIds?.length !== 0 && projectView?.userIds?.map(user => (
                            <Select.Option key={user?.id} value={user?.id}>
                                <Avatar size='small' src={user?.avatarUrl} /> {user?.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label='Assignees' name='assignees'>
                    <Select
                        mode="multiple"
                        size="large"
                        style={{width: '100%',}}
                        placeholder="Select"
                    >
                        {projectView?.userIds?.length && projectView.userIds.map(user => (
                            <Select.Option key={user?.id} value={user?.id}>
                                <Avatar size='small' src={user?.avatarUrl} /> {user?.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label='Priority' name='priority' rules={[{required: true,message: 'Bạn chưa chọn Priority!'}]}>
                    <Select
                        style={{width: '100%',}}
                        placeholder="Select"
                    >
                        <Select.Option value="highest">
                            <ArrowUpOutlined style={{color: 'red'}} /> Highest
                        </Select.Option>
                        <Select.Option value="high">
                            <ArrowUpOutlined style={{color: 'red'}} /> High
                        </Select.Option>
                        <Select.Option value="medium">
                            <ArrowUpOutlined style={{color: 'orange'}} /> Medium
                        </Select.Option>
                        <Select.Option value="low">
                            <ArrowDownOutlined style={{color: 'greenyellow'}} /> Low
                        </Select.Option>
                        <Select.Option value="lowest">
                            <ArrowDownOutlined style={{color: 'green'}} /> Lowest
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}