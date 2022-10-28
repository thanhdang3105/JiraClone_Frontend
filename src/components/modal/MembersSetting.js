import { Avatar, Form, message, Modal, Select } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import customFetch from "../../hook/customFetch";
import { updateAssignees } from "../../redux/issuesSlice";
import { addUsers, removeUsers } from "../../redux/projectSlice";
import { projectViewSelector, userSelector } from "../../redux/selector";

export default function MembersSetting({open:{open,setOpen}}) {
    const [listUser,setListUser] = React.useState()

    const formMembersSettingRef = React.createRef()

    const currentUser = useSelector(userSelector)
    const projectView = useSelector(projectViewSelector)

    const dispatch = useDispatch()

    React.useEffect(() => {
        if(projectView && Object.values(projectView).length){
            const userIds = projectView?.userIds?.map(user => user.id)
            customFetch('/api/users',{
                method: 'POST',
                body: JSON.stringify({userIds})
            }).then(res => {
                if(res.status === 200){
                    return res.json()
                }
                throw new Error('Lỗi')
            }).then(data => setListUser(data))
            .catch(err => console.log(err))
        }
    },[projectView])

    const handleSettingMembers = async (value) => {
        const {usersAdd,usersRemove} = value
        async function addMembers(users) {
            try {
                const res = await customFetch('/api/projects/addUsers',{
                    method: 'POST',
                    body: JSON.stringify({userIds:users,project: projectView})
                })
                return res.json()
            } catch (error) {
                throw new Error('Lỗi')
            }
        }
        async function removeMembers(users){
            try {
                const res = await customFetch('/api/projects/removeUsers',{
                    method: 'POST',
                    body: JSON.stringify({userIds:users,project: projectView})
                })
                return res.json()
            } catch (error) {
                throw new Error('Lỗi')
            }
        }
        message.loading({
            content: 'Loading...',
            key: 'settingMembers',
            duration: 100
        })
        if(usersAdd?.length && usersRemove?.length){
            Promise.all([addMembers(usersAdd),removeMembers(usersRemove)])
            .then(([addRespon,removeRespon]) => {
                message.success({
                    content: 'Hoàn thành.',
                    key: 'settingMembers',
                    duration: 2
                })
                dispatch(addUsers(addRespon));
                dispatch(removeUsers(removeRespon));
                dispatch(updateAssignees(removeRespon));
                setOpen(false)
            }).catch((err) => {
                message.error({
                    content: 'Xảy ra lỗi!',
                    key: 'settingMembers',
                    duration: 2
                })
            })
        }else if(usersAdd?.length && !usersRemove?.length){
            addMembers(usersAdd)
            .then(data => {
                message.success({
                    content: 'Thêm thành công.',
                    key: 'settingMembers',
                    duration: 2
                })
                dispatch(addUsers(data));
                setOpen(false)
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'settingMembers',
                    duration: 2
                })
            })
        }else if(!usersAdd?.length && usersRemove?.length){
            removeMembers(usersRemove)
            .then(data => {
                message.success({
                    content: 'Xoá thành công.',
                    key: 'settingMembers',
                    duration: 2
                })
                dispatch(removeUsers(data));
                dispatch(updateAssignees(data));
                setOpen(false)
            }).catch(err => {
                message.error({
                    content: err.message,
                    key: 'settingMembers',
                    duration: 2
                })
            })
        }
        formMembersSettingRef.current.resetFields()
    }

    return (
        <Modal
            open={open}
            onCancel={() => setOpen(false)}
            onOk={() => formMembersSettingRef.current.submit()}
            okText='Ok'
            title='Quản lý thành viên'
            width={800}
        >
            <Form layout='vertical' ref={formMembersSettingRef} onFinish={handleSettingMembers}>
                {currentUser?.id === projectView?.userId && (
                    <Form.Item label='Xoá thành viên' name='usersRemove'>
                        <Select size="large" style={{width: '100%',height: '40px'}} mode='multiple' placeholder="Multiple Select" >
                            {projectView?.userIds?.length && projectView?.userIds?.map(user => user?.id !== currentUser?.id && (
                                <Select.Option key={user?.id} value={user?.id}>
                                    <Avatar size='small' src={user?.avatarUrl} /> {user?.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <Form.Item label='Thêm thành viên' name='usersAdd'>
                    <Select size="large" style={{width: '100%',height: '40px'}} mode='multiple' placeholder="Multiple Select" >
                        {listUser?.length && listUser.map(user => (
                            <Select.Option key={user?.id} value={user?.id}>
                                <Avatar size='small' src={user?.avatarUrl} /> {user?.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}