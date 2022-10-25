import { BookTwoTone, CheckSquareTwoTone, CloseOutlined, ExclamationCircleTwoTone, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Input, message } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './searchIssues.module.scss'
import customFetch from '../../../hook/customFetch';
import { setIssuesSearchValues, setIssueView } from '../../../redux/issuesSlice';
import { issuesSearchValuesSelector } from '../../../redux/selector';

export default function SearchIssuesApi({open:{open,setOpen}}) {
    const [loading,setLoading] = React.useState(false)

    const timmerRef = React.useRef()

    const IssuesSearchValues = useSelector(issuesSearchValuesSelector)
    const dispatch = useDispatch()

    const issuesType = React.useMemo(() => {
        return {
            task: <CheckSquareTwoTone />,
            bug: <ExclamationCircleTwoTone twoToneColor={'#ff0000'} />,
            story: <BookTwoTone twoToneColor='#00fe00' />
        }
    },[])
    
    const handleSearchIssues = (e) => {
        const value = e.target.value
        clearTimeout(timmerRef.current)
        if(value !== ''){
            setLoading(true)
            timmerRef.current = setTimeout(() => {
                customFetch('/api/issues/search?searchTerm='+value)
                .then(res => {
                    if(res.status === 200) return res.json()
                    throw new Error(res.text())
                })
                .then(data => {
                    dispatch(setIssuesSearchValues(data))
                    setLoading(false)
                }).catch(err => {
                    message.error({
                        content: err.message,
                        key: 'errSearch',
                        duration: 2
                    })
                    setLoading(false)
                })
            },2000)
        }else{
            setLoading(false)
            dispatch(setIssuesSearchValues(undefined))
        }
    }

    const handleCloseDrawer = () => {
        setOpen(false)
        dispatch(setIssuesSearchValues(undefined))
    }

    return (
        <Drawer
        closable={false}
        placement='left'
        destroyOnClose
        onClose={handleCloseDrawer}
        open={open}
        key='searchIssuesApi'
        width='35vw'
        >
        <div className={styles['searchIssues_header']}>
            <Input size='large' placeholder='Search issues by summary, description...' onChange={handleSearchIssues} prefix={<SearchOutlined />} 
            suffix={loading && <LoadingOutlined spin />} className={styles['header_inputSearch']} />
            <Button type='text' size='large' className={styles['header_btnClose']} shape='circle' icon={<CloseOutlined />} 
            onClick={handleCloseDrawer} />
        </div>
        <ul className={styles['searchIssues_list']}>
            {IssuesSearchValues && (
                <>
                    <h4>MATCHING ISSUES</h4>
                    {IssuesSearchValues.length > 0 ? IssuesSearchValues.map(issue => (
                        <li key={issue.id} className={styles['searchIssues_item']} onClick={() => dispatch(setIssueView(issue.id))}>
                            {issuesType[issue.type]}
                            <div className={styles['searchIssues_item-info']}>
                                <strong>{issue.title}</strong>
                                <span>{issue.id}</span>
                            </div>
                        </li>
                    )) : `Chúng tôi không thể tìm thấy bất kỳ thứ gì phù hợp với tìm kiếm của bạn. Vui lòng thử lại.`}
                </>
            )}
        </ul>
      </Drawer>
    )
}