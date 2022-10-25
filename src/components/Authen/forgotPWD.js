import { Button, Form, Input, message } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import React from 'react';
import customFetch from '../../hook/customFetch';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../../redux/userSlice';
import { setInitialProjects } from '../../redux/projectSlice';

export default function ForgotPWD() {
    const [loading,setLoading] = React.useState(false)
    const [step,setStep] = React.useState('checkEmail')

    const ForgotFormRef = React.createRef()
    const EmailRef = React.useRef()
    const VerifyCodeRef = React.useRef()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSubmitForm = (value) => {
        setLoading(true)
        let formData = {action: step}
        let nextStep
        if(step === 'checkEmail'){
            formData.data = value.email
            EmailRef.current = value.email
            nextStep = 'verifyCode'
        }else if(step === 'verifyCode'){
            VerifyCodeRef.current = value.code
            formData.data = {
                email: EmailRef.current,
                code: value.code,
            }
            nextStep = 'resetPWD'
        }else if(step === 'resetPWD'){
            if(value.newPassword !== value.checkPassword){
                ForgotFormRef.current.setFields({name: 'checkPassword',errors: ['Mật khẩu không khớp!']})
                return
            }
            formData.data = {
                email: EmailRef.current,
                code: VerifyCodeRef.current,
                password: value.newPassword
            }
        }
        customFetch('/api/users/resetPwd',{
            method: 'POST',
            body: JSON.stringify(formData)
        }).then(res => {
            if(res.status === 200) return res.json()
            return res.text().then(text => {throw new Error(text)})
        }).then(data => {
            message.success({
                content: data?.message || 'Đổi mật khẩu thành công!',
                key: 'resetPwd',
                duration: 2
            })
            setLoading(false)
            if(nextStep){
                setStep(nextStep)
            }else{
                if(data?.accessToken){
                    localStorage.setItem('access_token',data.accessToken)
                    delete data.accessToken
                    dispatch(setInitialProjects(data.projectIds))
                    dispatch(setCurrentUser(data))
                    navigate('/',{replace: true})
                }
            }
        }).catch(err => {
            message.error({
                content: err?.message || 'Lỗi!',
                key: 'resetPwd',
                duration: 2
            })
            setLoading(false)
        })
    }

    return (
            <Form ref={ForgotFormRef} onFinish={handleSubmitForm} >
                {step === 'checkEmail' ? (
                    <Form.Item name='email' label='Email: ' rules={[{required: true,message: 'Vui lòng nhập email!'}]}>
                        <Input type="email" placeholder='VD: NguyenVanA@gmail.com'/>
                    </Form.Item>
                ) : step === 'verifyCode' ? (
                    <Form.Item name='code' label='Mã xác thực: ' rules={[{required: true,message: 'Vui lòng nhập mã xác thực!'}]}>
                        <Input type='number' pattern='[0-9]{6}' placeholder='Number...'/>
                    </Form.Item>
                ) : step === 'resetPWD' && (
                    <>
                        <Form.Item label='Mật khẩu mới' name='newPassword' rules={[{required: true,message: 'Vui lòng nhập mật khẩu!'}]} >
                            <Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} placeholder='Tối thiểu 6 ký tự' />
                        </Form.Item>
                        <Form.Item label='Nhập lại mật khẩu' name='checkPassword' rules={[{required: true,message: 'Vui lòng nhập mật khẩu!'}]} >
                            <Input.Password iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} placeholder='Tối thiểu 6 ký tự' />
                        </Form.Item>
                    </>
                )}
                <Form.Item>
                    <Button type="primary" htmlType='submit' loading={loading}>{step === 'checkEmail' ? 'Check Email' 
                    : step === 'verifyCode' ? 'Xác thực' : 'Xác nhận'}</Button>
                </Form.Item>
            </Form>
    )
}