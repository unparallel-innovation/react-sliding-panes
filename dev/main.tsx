import React, {useEffect} from "react";

import './main.css'
import "../src/main.scss"
import {Pane, PaneManager, PaneManagerControls, ViewMode} from "../src";
import {isInteger} from "lodash";

interface SideContentProps {
    title: string,
    paneManagerControls:PaneManagerControls,
    n?:number
}


interface ContentProps {
    title: string,
    paneManagerControls:PaneManagerControls,
    n?:number
}


function SideContent({paneManagerControls, title,n}:SideContentProps){
    const {closeSidePane} = paneManagerControls
    return (
        (
            <div>
                <h1>{title}</h1>
                <h2>N: {n}</h2>
                <button onClick={closeSidePane}>Close</button>
            </div>
        )
    )
}

function Content({title,paneManagerControls,n}:ContentProps){
    const {setSidePane, closeSidePane,addPane,closeLastPane} = paneManagerControls

    function setSidePaneBtn(){
        setSidePane({
            content:(_, props)=><SideContent {...props} title={"Side Content"} paneManagerControls={paneManagerControls} />,
            shouldClose:()=>confirm("Should close side pane?"),
            onClose:()=>{console.log("Closed side pane")},
            willClose:()=>{console.log("Side pane will close")},
            props:{n:1}
        })
    }

    function openNewPane(){
        addPane({
            content:(_,props)=><Content {...props} title={"Other panes"} paneManagerControls={paneManagerControls} />,
            shouldClose:()=>confirm("Should close pane?"),
            onClose:()=>{console.log("Closed pane")},
            willClose:()=>{console.log("pane will close")},
            props:{n:1}
        })
    }

    function openNewPaneAsFullscreen(){
        addPane({
            content:()=><Content title={"Second Pane as fullscreen"} paneManagerControls={paneManagerControls} />,
            viewMode:ViewMode.FullScreen,
            shouldClose:()=>confirm("Should close pane?"),
            onClose:()=>{console.log("Closed fullscreen pane")},
            willClose:()=>{console.log("fullscreen pane will")}
        })
    }

    return(
        <div>
            <h1>{title}</h1>
            <h2>N: {n}</h2>
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
        onClose:()=>{console.log("Closed root pane")},
        willClose:()=>{console.log("Root pane will")}
    }

    function onPaneOpen(index: number, pane: Pane){
        console.log("pane with index " + index + " opened")
    }

    function onPaneClose(index: number){
        console.log("pane with index " + index + " closed")
    }

    function onPaneWillClose(index: number){
        console.log("pane with index " + index + " will close")
    }

    function onSidePaneOpen(index:number){
        console.log("Opened side pane of pane " + index)
    }

    return (
        <PaneManager onPaneOpen={onPaneOpen} onPaneClose={onPaneClose} paneWillClose={onPaneWillClose}  paneClassName={"xxxxx"} onSidePaneOpen={onSidePaneOpen}>
            {(paneManagerControls)=>(
                <div>
                    <h1>Root Content</h1>
                    <button onClick={()=>{paneManagerControls.addPane(pane)}}>Add first pane</button>
                </div>
            )}
        </PaneManager>
    )
}