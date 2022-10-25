import { Button, Form, Input, message } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import customFetch from '../../hook/customFetch';
import { setInitialProjects } from '../../redux/projectSlice';
import { setCurrentUser } from '../../redux/userSlice';

export default function Login() {
    const [loading,setLoading] = React.useState(false)

    const LoginFormRef = React.createRef()

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmitForm = (formData) => {
        message.loading({
            content: 'Loading...',
            key: 'login',
            duration: 100
        })
        customFetch('/api/users/login',{
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(res => {
            if(res.status === 200){
                return res.json()
            }
            return res.text().then(text => {throw new Error(text)})
        })
        .then(data => {
            message.success({
                content: 'Đăng nhập thành công.',
                key: 'login',
                duration: 2
            })
            setLoading(false)
            if(data.accessToken){
                localStorage.setItem('access_token',data.accessToken)
                delete data.accessToken
            }
            dispatch(setInitialProjects(data.projectIds))
            dispatch(setCurrentUser(data))
            navigate('/',{replace: true})
        }).catch(err => {
            LoginFormRef.current.setFields([{name: 'password',errors: [err.message]}])
            message.error({
                content: err.message,
                key: 'login',
                duration: 1
            })
        })
    }

    return (
            <Form ref={LoginFormRef} onFinish={handleSubmitForm} >
                <Form.Item name='email' label='Email: ' rules={[{required: true,message: 'Vui lòng nhập email!'}]}>
                    <Input type="email" placeholder='VD: NguyenVanA@gmail.com'/>
                </Form.Item>
                <Form.Item name='password' label='Mật khẩu: ' rules={[{required: true,message: 'Vui lòng nhập mật khẩu!'}]}>
                    <Input type="password" placeholder='Tối thiểu 6 ký tự'/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType='submit' loading={loading}>Đăng nhập</Button>
                </Form.Item>
            </Form>
    )
}