import React from 'react';
import './Tutorial.css'

interface ITutorialProps {

}

export const Tutorial: React.FunctionComponent<ITutorialProps> = (props: ITutorialProps) => {

    return (<>
        <img src="/favicon-512.png" alt="logo" className="logo" />


        <h1>How to use the app</h1>

        <img src="/Static/Gfx/add widget.gif" alt="logo" className="example" />

        <ol>
            <li>Add one or more office 365 accounts to the app.</li>

            <li>Open the Widget board (win key + w)</li>

            <li>Add the widget to your widget board</li>
        </ol>
    </>)
}