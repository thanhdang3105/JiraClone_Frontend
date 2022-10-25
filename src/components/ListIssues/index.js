import React from 'react'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import { useSelector } from 'react-redux'
import { getIssues } from '../../redux/selector'
import IssueItemComponent from './issueItem'
import styles from './listissues.module.scss'

export default function ListIssues({title = 'backLog'}) {

    const data = useSelector(getIssues)

    const listTitle = React.useMemo(() => {
        return {
            backlog: 'backlog',
            selected : 'selected for development',
            progress: 'in progress',
            done: 'done'
        }
    },[])

    return (
        <div className={styles['wrapper_list']}>
            <h3 className={styles['list_header']}>{listTitle[title]?.toUpperCase()}</h3>
            <Droppable key={title} droppableId={title}>
                {provided => (
                    <ul key={title} ref={provided.innerRef} className={styles['list_box']} {...provided.droppableProps}>
                        {data[title] && data[title]?.length !== 0 && data[title]?.map((item,index) => (
                                <>
                                    <Draggable key={index} draggableId={title+'-'+index} index={index}>
                                    {provided => (
                                        <IssueItemComponent key={title+'-'+index} provided={provided} data={item} />
                                    )}
                                    </Draggable>
                                </>
                            ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </div>
    )
}