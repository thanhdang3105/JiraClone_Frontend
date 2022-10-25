import { Avatar, Button, message } from 'antd';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { storage } from '../../firebase/config';
import customFetch from '../../hook/customFetch';
import { userSelector } from '../../redux/selector';
import { updateUser } from '../../redux/userSlice';
import styles from './userinfo.module.scss'

function getBase64(file) {
    return new Promise((resolve,reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file)
        reader.onload = () => {
            resolve(reader.result);
        }
        reader.onerror = () => reject(new Error('Could not load file'))
    })
}

export default function UserInfo(){
    const [isChangeInfo,setIsChangeInfo] = React.useState({avatar: false,name: false})
    const [newAvatar,setNewAvatar] = React.useState(null)

    const currentUser = useSelector(userSelector)

    const dispatch = useDispatch()

    const handleChangeAvatar = (e) => {
        const fileImg = e.target.files[0]
        if(fileImg){
            getBase64(fileImg)
            .then(res => {
                setNewAvatar({file: fileImg, src: res})
            })
            .catch(err => console.log(err))
            setIsChangeInfo(prev => ({...prev,avatar: true}))
        }
    }

    const handleChangeInfo = async () => {
        if(currentUser?.id){
            const formData = {id: currentUser?.id}
            if(isChangeInfo.name){
                const newName = document.querySelector('.'+styles['userInfo_name']).innerText
                formData.name = newName
            }
            if(isChangeInfo.avatar && newAvatar?.file){
                const imgRef = await uploadBytes(ref(storage,newAvatar?.file?.name), newAvatar?.file)
                formData.avatarUrl = await getDownloadURL(imgRef.ref)
            }
            message.loading({
                content: 'Loading...',
                key: 'updateUser',
                duration: 100
            })
            customFetch('/api/users/update',{
                method:'PATCH',
                body: JSON.stringify(formData),
            }).then(res => {
                if(res.status === 200) return res.json()
                return res.text().then(text => {throw new Error(text)})
            }).then(data => {
                message.success({
                    content: data.message,
                    key: 'updateUser',
                    duration: 2
                })
                dispatch(updateUser(formData))
            }).catch(err => {
                message.error({
                    content: err?.message || 'Lỗi',
                    key: 'updateUser',
                    duration: 2
                })
            })
            setIsChangeInfo({avatar: false,name: false})
        }
    }

    const cancelChangeInfo = () => {
        if(isChangeInfo.name){
            const nameElement = document.querySelector('.'+styles['userInfo_name'])
            nameElement.innerText = 'Thanh Đặng'
            nameElement.contentEditable = false
        }
        setIsChangeInfo({avatar: false,name: false})
    }

    return (
        <div className={styles['wrapper_userInfo']}>
            <div className={styles['userInfo_avatar']} onClick={(e) => e.currentTarget.childNodes[1].click()}>
                <Avatar src={newAvatar?.src||currentUser?.avatarUrl} size={{
                    xs: 38,
                    sm: 40,
                    md: 64,
                    lg: 80,
                    xl: 100,
                    xxl: 120,
                }}>{currentUser?.name?.charAt(0)?.toUpperCase()}</Avatar>
                <input hidden accept="image/*" type="file" onChange={handleChangeAvatar} />
            </div>
            <p className={styles['userInfo_name']} onInput={(e) => setIsChangeInfo(prev => ({...prev,name:true}))} onClick={(e) => {
                e.currentTarget.contentEditable = true
                e.currentTarget.focus()
            }}>{currentUser?.name}</p>
            <span className={styles['userInfo_mail']}>{currentUser?.email}</span>
            {(isChangeInfo.name || isChangeInfo.avatar) && (
                <>
                    <Button type="primary" onClick={handleChangeInfo}>Save</Button>
                    <Button type="text" onClick={cancelChangeInfo}>Cancel</Button>
                </>
            )}
        </div>
    )
}