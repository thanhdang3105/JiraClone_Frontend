import { Button, Form, Input, message } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import customFetch from '../../hook/customFetch';
import { setInitialProjects } from '../../redux/projectSlice';
import { setCurrentUser } from '../../redux/userSlice';

export default function Register() {
    const [loading,setLoading] = React.useState(false)
    const [verifyEmail,setVerifyEmail] = React.useState(false)

    const RegisterFormRef = React.createRef()
    const EmailRef = React.useRef()

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmitForm = async (formData) => {
        setLoading(true)
        switch (verifyEmail) {
            case false:
                message.loading({
                    content: 'Loading',
                    key: 'verifyEmail',
                    duration: 100
                })
                customFetch('/api/users/register',{
                    method: 'POST',
                    body: JSON.stringify({action: 'verifyEmail',data: formData.email})
                })
                .then(res => {
                    if(res.status === 200){
                        return res.json()
                    }else{
                        return res.text().then(text => {throw new Error(text)})
                    }
                })
                .then(data => {
                    message.success({
                        content: data,
                        key: 'verifyEmail',
                        duration: 2
                    })
                    EmailRef.current = formData.email
                    setLoading(false)
                    setVerifyEmail('pending')
                })
                .catch(err => {
                    console.log(err.message)
                    message.error({
                        content: err?.message || 'Xảy ra lỗi vui lòng thử lại!',
                        key: 'verifyEmail',
                        duration: 2
                    })
                    setLoading(false)
                })
                break;
            case 'pending': 
                message.loading({
                    content: 'Loading',
                    key: 'verifyCode',
                    duration: 100
                })
                customFetch('/api/users/register',{
                    method: 'POST',
                    body: JSON.stringify({action: 'verifyCode',data: {email: EmailRef.current, code: formData.verifyCode}})
                })
                .then(res => {
                    if(res.status === 200){
                        return res.json()
                    }else if(res.status === 400) {
                        setTimeout(() => {
                            setVerifyEmail(false)
                        },1000)
                    }
                    return res.text().then(text => {throw new Error(text)})
                })
                .then(data => {
                    message.success({
                        content: data,
                        key: 'verifyCode',
                        duration: 2
                    })
                    setLoading(false)
                    setVerifyEmail(true)
                })
                .catch(err => {
                    message.error({
                        content: err?.message || 'Xác thực không thành công!',
                        key: 'verifyCode',
                        duration: 2
                    })
                    setLoading(false)
                })
                break;
            case true:
                if(formData['check-password'] !== formData['password']) {
                    RegisterFormRef.current.setFields([{name: 'check-password',errors: ['Mật khẩu không khớp!']}])
                    setLoading(false)
                }else{
                    message.loading({
                        content: 'Loading',
                        key: 'createUser',
                        duration: 100
                    })
                    customFetch('/api/users/register',{
                        method: 'POST',
                        body: JSON.stringify({action: 'createUser',data: {name: formData.username,email: EmailRef.current,password: formData.password}})
                    })
                    .then(res => {
                        if(res.status === 200){
                            return res.json()
                        }
                        throw new Error('Login Failed!')
                    })
                    .then(data => {
                        message.success({
                            content: 'Đăng ký thành công.',
                            key: 'createUser',
                            duration: 2
                        })
                        setLoading(false)
                        localStorage.setItem('access_token',data.accessToken)
                        delete data.accessToken
                        dispatch(setCurrentUser(data))
                        dispatch(setInitialProjects([]))
                        navigate('/',{replace:true})
                    })
                    .catch(err => {
                        console.log(err)
                        message.error({
                            content: 'Đăng ký thất bại!',
                            key: 'createUser',
                            duration: 2
                        })
                        setLoading(false)
                    })
                }
                break;
            default:
                throw new Error('Đăng ký thất bại!')
        }
    }

    return (
            <Form ref={RegisterFormRef} onFinish={handleSubmitForm} layout='vertical' labelAlign='left'>
                {verifyEmail === 'pending' ? (
                    <Form.Item name='verifyCode' label='Mã xác thực: ' rules={[{required: true,message: 'Vui lòng nhập mã xác thực!'}]}>
                        <Input pattern='[0-9]{6}' title='Vui lòng nhập đủ 6 số!' placeholder='Mã xác thực...'/>
                    </Form.Item>
                ) : verifyEmail ? (
                    <>
                        <Form.Item name='username' label='Họ và Tên: ' rules={[{required: true,message: 'Vui lòng nhập họ và tên!'}]}>
                            <Input type="text" placeholder='VD: Nguyen Van A'/>
                        </Form.Item>
                        <Form.Item name='password' label='Mật khẩu: ' rules={[{required: true,message: 'Vui lòng nhập mật khẩu!'},{pattern:'[a-zA-Z0-9]{6,}',message: 'Tối thiểu 6 ký tự'}]}>
                            <Input type="password" placeholder='Tối thiểu 6 ký tự' />
                        </Form.Item>
                        <Form.Item name='check-password' label='Nhập lại mật khẩu: ' rules={[{required: true,message: 'Vui lòng nhập mật khẩu!'},{pattern:'[a-zA-Z0-9]{6,}',message: 'Tối thiểu 6 ký tự'}]}>
                            <Input type="password" placeholder='Tối thiểu 6 ký tự'/>
                        </Form.Item>
                    </>
                ) : (
                    <Form.Item name='email' label='Email: ' rules={[{required: true,message: 'Vui lòng nhập email!'}]}>
                        <Input type="email" placeholder='VD: NguyenVanA@gmail.com'/>
                    </Form.Item>
                )}
                <Form.Item>
                    <Button type="primary" htmlType='submit' loading={loading}>Đăng ký</Button>
                </Form.Item>
            </Form>
    )
}