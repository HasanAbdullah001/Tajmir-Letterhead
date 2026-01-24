import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EditorMode } from './components/EditorMode';
import { ViewerMode } from './components/ViewerMode';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<EditorMode />} />
                <Route path="/view/:letterId" element={<ViewerMode />} />
            </Routes>
        </BrowserRouter>
    );
}
