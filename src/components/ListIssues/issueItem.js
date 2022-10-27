import React from 'react';
import styles from './listissues.module.scss'
import { useDispatch } from 'react-redux';
import { setIssueView } from '../../redux/issuesSlice';
import { CheckSquareTwoTone, ExclamationCircleTwoTone, BookTwoTone, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { Avatar, Tooltip } from 'antd'

export default function IssueItemComponent({provided,data}) {

    const dispatch = useDispatch()

    const issuesType = React.useMemo(() => {
        return {
            task: <CheckSquareTwoTone />,
            bug: <ExclamationCircleTwoTone twoToneColor='#ff0000' />,
            story: <BookTwoTone twoToneColor='#00fe00' />,
        }
    },[])

    const priority = React.useMemo(() => {
        return {
            highest: <ArrowUpOutlined style={{color: 'red'}} />,
            high: <ArrowUpOutlined style={{color: 'red'}} />,
            medium: <ArrowUpOutlined style={{color: 'orange'}} />,
            low: <ArrowDownOutlined style={{color: 'green'}} />,
            lowest: <ArrowDownOutlined style={{color: 'green'}} />,
        }
    },[])

    return (
        <li key={data.id} id={data.id} className={`${styles['list_box-item']} ${data?.expried && styles['expried']}`} onClick={() => {
            dispatch(setIssueView(data.id))}}
            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <p className={styles['list_box-item--title']}>{data?.title}</p>
            <div className={styles['list_box-item--info']}>
                <span>{issuesType[data.type]}</span>
                <span>{priority[data.priority]}</span>
                <span>
                    <Avatar.Group maxCount={3} size='small' maxPopoverTrigger="hover">
                        {data?.assignees?.length !== 0 && data.assignees.map(user => (
                            <Tooltip title={user.name}>
                                <Avatar key={user.id} src={user.avatarUrl} />
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                </span>
            </div>
        </li>
    )
}