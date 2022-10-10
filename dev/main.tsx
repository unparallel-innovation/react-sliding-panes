import React from "react";

import './main.css'
import "../src/main.scss"
import {Pane, PaneManager, PaneManagerControls, ViewMode} from "../src";

interface SideContentProps {
    title: string,
    paneManagerControls:PaneManagerControls
}


interface ContentProps {
    title: string,
    paneManagerControls:PaneManagerControls
}


function SideContent({paneManagerControls, title}:SideContentProps){
    const {closeSidePane} = paneManagerControls
    return (
        (
            <div>
                <h1>{title}</h1>
                <button onClick={closeSidePane}>Close</button>
            </div>
        )
    )
}

function Content({title,paneManagerControls}:ContentProps){
    const {setSidePane, closeSidePane,addPane,closeLastPane} = paneManagerControls

    function setSidePaneBtn(){
        setSidePane({
            content:()=><SideContent title={"Side Content"} paneManagerControls={paneManagerControls} />,
            shouldClose:()=>confirm("Should close side pane?"),
            onClose:()=>{console.log("Closing side pane pane")}
        })
    }

    function openNewPane(){
        addPane({
            content:()=><Content title={"Other panes"} paneManagerControls={paneManagerControls} />,
            shouldClose:()=>confirm("Should close pane?"),
            onClose:()=>{console.log("Closing pane")}
        })
    }

    function openNewPaneAsFullscreen(){
        addPane({
            content:()=><Content title={"Second Pane as fullscreen"} paneManagerControls={paneManagerControls} />,
            viewMode:ViewMode.FullScreen,
            shouldClose:()=>confirm("Should close pane?"),
            onClose:()=>{console.log("Closing fullscreen pane")}
        })
    }

    return(
        <div>
            <h1>{title}</h1>
            <button onClick={()=>{closeLastPane()}}>Close Pane</button>
            <button onClick={()=>{closeSidePane()}}>Close side Pane</button>
            <button onClick={()=>{setSidePaneBtn()}}>Set side pane</button>
            <button onClick={()=>{openNewPane()}}>Open new pane</button>
            <button onClick={()=>{openNewPaneAsFullscreen()}}>Open new pane as fullscreen</button>
        </div>

    )
}

export const Main = function(){

    const pane:Pane = {
        content:((paneManagerControls) =><Content title={"First Pane"}   paneManagerControls={paneManagerControls}/> ),
        shouldClose:()=>confirm("Should close pane?"),
        onClose:()=>{console.log("Closing root pane")}
    }

    function onPaneOpen(index: number, pane: Pane){
        console.log("pane with index " + index + " opened")
    }

    function onPaneClose(index: number){
        console.log("pane with index " + index + " closed")
    }


    return (
        <PaneManager onPaneOpen={onPaneOpen} onPaneClose={onPaneClose}>
            {(paneManagerControls)=>(
                <div>
                    <h1>Root Content</h1>
                    <button onClick={()=>{paneManagerControls.addPane(pane)}}>Add first pane</button>
                </div>
            )}
        </PaneManager>
    )
}