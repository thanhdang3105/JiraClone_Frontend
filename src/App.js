import './App.css';
import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Authentication from './components/Authen';
import HomePage from './components/home';
import ProjectsPage from './components/home/projects';
import AdminPage from './components/admin';
import { useSelector } from 'react-redux';
import { userSelector } from './redux/selector';
import { useDispatch } from 'react-redux';
import customFetch from './hook/customFetch';
import { setCurrentUser } from './redux/userSlice';
import { setInitialProjects } from './redux/projectSlice';
import { Spin } from 'antd';

function App() {
  const [loading,setLoading] = React.useState(true)

  const currentUser = useSelector(userSelector)

  const dispatch = useDispatch()
  const navigate = useNavigate()

    React.useEffect(() => {
      if(!Object.values(currentUser).length){
          const accessToken = localStorage.getItem('access_token')
          if(accessToken){
              customFetch('/api/users/authorization',{
                  method: 'POST',
                  body: JSON.stringify({accessToken})
              }).then(res => {
                  if(res.status === 200){
                      return res.json()
                  }else if(res.status === 400){
                      throw new Error('Tài khoản không tồn tại!')
                  }else{
                      throw new Error('Lỗi!')
                  }
              }).then(data => {
                  if(data.accessToken){
                      localStorage.setItem('access_token',data.accessToken)
                      delete data.accessToken
                  }
                  setLoading(false)
                  dispatch(setInitialProjects(data.projects))
                  dispatch(setCurrentUser(data))
              }).catch(err => {
                    if(err.message !== 'Failed to fetch'){
                        localStorage.removeItem('access_token')
                    }
                    setLoading(false)
                    navigate('/authentication')
              })
          }else{
              setLoading(false)
              navigate('/authentication')
          }
      }else{
          setLoading(false)
      }
    },[dispatch,navigate,currentUser])

  return loading ? <div className='overlay_loading'><Spin size='large' /></div> : (
    <div className="App">
        <Routes>
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/projects/*" element={<ProjectsPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route index element={<HomePage />} />
        </Routes>
    </div>
  );
}

export default App;
