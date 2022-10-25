import React from "react";
import { Route, Routes } from "react-router-dom";
import KanbanBoard from "../KanbanBoard";
import ProjectDetails from "../projectDetails";
import SiderBar from "../SiderBar";


export default function ProjectsPage({createIssues}) {

    return (
        <>
            <SiderBar isCreateIssues={createIssues} />
            <Routes>
                <Route path="/:slug" element={<KanbanBoard />} />
                <Route path="/:slug/settings" element={<ProjectDetails />} />
            </Routes>
        </>
    )
}