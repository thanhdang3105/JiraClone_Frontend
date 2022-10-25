import React from 'react';
import styles from './authen.module.scss'
import ForgotPWD from './forgotPWD';
import Login from './login';
import Register from './register';

export default function Authentication() {
    const [action,setAction] = React.useState('login')

    const actionMenu = React.useMemo(() => {
        return {
            header: {
                login: 'Đăng nhập',
                register: 'Đăng ký',
                forgotPWD: 'Quên mật khẩu'
            },
            body: {
                login: <Login />,
                register: <Register />,
                forgotPWD: <ForgotPWD />
            },
            footer: {
                login: <>
                        <span onClick={() => setAction('register')}>Đăng ký</span>
                        <span onClick={() => setAction('forgotPWD')}>Quên mật khẩu?</span>
                        </>,
                register: <span onClick={() => setAction('login')}>Bạn đã có tài khoản?</span>,
                forgotPWD: <span onClick={() => setAction('login')}>Trở lại</span>
            }
        }
    },[])

    return (
        <div className={styles['wrapper_authen']}>
            <div className={styles['authen_box']}>
                <h1 className={styles['authen_box-header']}>{actionMenu.header[action]}</h1>
                {actionMenu.body[action]}
                <div className={styles['authen_box-footer']}>
                    {actionMenu.footer[action]}
                </div>
            </div>
        </div>
    )
}