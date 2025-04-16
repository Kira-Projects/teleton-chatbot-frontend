import { Route, Routes } from "react-router-dom"
import React from "react";

interface Props {
    children: React.ReactNode;
}

const RoutesWithNotFound = ({ children }: Props) => {
    return (
        <Routes>
            {children}
            <Route path="*" element={<div>Not Found</div>} />
        </Routes>
    )
}

export default RoutesWithNotFound
