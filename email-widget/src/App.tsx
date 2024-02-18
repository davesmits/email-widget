import React from 'react';
import './App.css'


import { HomePage } from './components/HomePage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';

import { BrowserRouter, Route, Routes } from 'react-router-dom';


const App: React.FunctionComponent = () => {

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB.');
        return;
    }




    return (
        <React.Fragment>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                </Routes>
            </BrowserRouter>
        </React.Fragment>
    );
}

export default App;

