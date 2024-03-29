# React Sliding Panes

Sliding pane component used for react, providing the following features:
* Stack panes in top of each other
* Open a pane side by side
* Open a pane in fullscreen mode

# Install

```shell
npm install @unparallel/react-sliding-panes
```

# Usage

Basic usage example showing all the features

```typescript jsx
import {Pane, PaneManager, PaneManagerControls, ViewMode} from "@unparallel/react-sliding-panes";
import "@unparallel/react-sliding-panes/dist/main.css";

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
        setSidePane({content:()=><SideContent title={"Side Content"} paneManagerControls={paneManagerControls} />,shouldClose:()=>confirm("Should close side pane?")})
    }

    function openNewPane(){
        addPane({content:()=><Content title={"Other panes"} paneManagerControls={paneManagerControls} />,shouldClose:()=>confirm("Should close pane?")})
    }

    function openNewPaneAsFullscreen(){
        addPane({content:()=><Content title={"Second Pane as fullscreen"} paneManagerControls={paneManagerControls} />,viewMode:ViewMode.FullScreen,shouldClose:()=>confirm("Should close pane?")})
    }

    return(
        <div>
            <h1>{title}</h1>
            <button onClick={()=>closeLastPane()}>Close Pane</button>
            <button onClick={()=>closeSidePane()}>Close side Pane</button>
            <button onClick={()=>setSidePaneBtn()}>Set side pane</button>
            <button onClick={()=>openNewPane()}>Open new pane</button>
            <button onClick={()=>openNewPaneAsFullscreen()}>Open new pane as fullscreen</button>
        </div>

    )
}

export const Main = function(){

    const pane:Pane = {
        content:((paneManagerControls) =><Content title={"First Pane"}   paneManagerControls={paneManagerControls}/> ),shouldClose:()=>confirm("Should close pane?")
    }


    return (
        <PaneManager>
            {(paneManagerControls)=>(
                <div>
                    <h1>Root Content</h1>
                    <button onClick={()=>{paneManagerControls.addPane(pane)}}>Add first pane</button>
                </div>
            )}
        </PaneManager>
    )
}
```

# PaneManager component

Wrapper component which will provide the "paneManagerControls" object containing methods required to open and close panes


## Properties

| Name      | Type | is Optional | Default Value | Description |
| ----------- | ----------- | ---- | --- | --- |
| children      | (paneManagerControls: PaneManagerControls)=>React.ReactNode     | no |  | Render of Pane Manager root content, the object "paneManagerControls" is provided and could be used to launch new panes |
| minPaneDistance   | number        | yes |  10 | Minimum distance (in px) between panes |
| maxPaneDistance   | number        | yes |  200 | Maximum distance (in px) between panes |
| paneWidth   | number        | yes |  300 | Width for each pane  |
| timeoutMS   | number        | yes |  500 | Duration of the animation during pane opening, close and adjustment |
| baseZIndex | number | yes | 2000 | Where the z index should start, defining this value could be required ensure that pane manager is rendered as the last layer |
| paneStartPadding| number | yes | 0 | X position of the first pane |
| paneClassName | string | yes | null | Custom classname for sliding pane container |
| paneBackgroundClassName | string | yes | null | Custom classname for sliding pane background |
| paneContentClassName | string | yes | null | Custom classname for sliding pane content |
| onPaneClose | (index:number)=>void | yes | null | Event fired after closing the pane |
| paneWillClose | (index: number)=>void | yes | null | Event fired before closing a pane |
| onPaneOpen | (index: number, pane:Pane)=>void | yes | null | Event fired after open the pane |
| onSidePaneOpen | (paneIndex: number, sidePane:SidePane)=>void | yes | null | Event fired after opened the side pane |

## Structures

### PaneManagerControls

Object containing several methods to control the behaviour of the Pane manager

| Name                | Type                       | Description                                                                                    |
|---------------------|----------------------------|------------------------------------------------------------------------------------------------|
| addPane             | (pane:Pane)=>void          | Used to add a new pane                                                                         |
| closeLastPane       | ()=>void                   | Close the last pane                                                                            |
| closePane           | (index: number)=>void      | Close a specific pane                                                                          |
| setSidePane         | (sidePane: SidePane)=>void | Add a side pane to the last pane                                                               |
| closeSidePane       | ()=>void                   | Close side pane                                                                                |
| updateLastPaneProps | (props:object)=>void       | Update props sent to the last pane, this update will re fire a render of the pane content      |
| updateSidePaneProps | (props:object)=>void       | Update props sent to the side pane, this update will re fire a render of the side pane content |
| compressPanes       | ()=>void                   | Forces all panes to collapses until the meet the "minPaneDistance" regarding its distance      |
| decompressPanes     | ()=>void                   | Set panes distance to their default distance                                                   |
| getPaneCount        | ()=>number or null          | Number of panes stacked on the pane manager                                                    |
### Pane

Object describing a pane

| Name      | Type | is Optional | Default Value | Description |
| --- | --- | --- | --- | --- |
| content | (paneManagerControls: PaneManagerControls, props: object)=>React.ReactNode | no | null | Content of the new pane, a "paneManagerControls" object will be sent to the content |
| viewMode | ViewMode | yes | ViewMode.Default | View mode of the new pane, allowed options ViewMode.Default or ViewMode.Fullscreen |
| shouldClose | ()=>boolean | yes | ()=>true | Confirmation step before closing the pane |
| onClose | ()=>void | yes | | Fired after closing the pane |
| willClose | ()=>void | yes | | Fired before closing the pane |
| props  | object | yes || Properties object sent on the content method |


### SidePane

Object describing a side pane

| Name      | Type | is Optional | Default Value | Description |
| --- | --- | --- | --- | --- |
| content | (paneManagerControls)=>React.ReactNode | no | null | Content of the new pane, a "paneManagerControls" object is sent to the content |
| shouldClose | ()=>boolean | yes | ()=>true | Confirmation step before closing the pane |
| onClose | ()=>void | yes | | Fired after closing the side pane |
| willClose | ()=>void | yes | | Fired before closing the side pane |
| props  | object | yes || Properties object sent on the content method |

# Development

```shell
npm install
npm start
```
