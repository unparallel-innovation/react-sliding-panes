import React from 'react'

import {SlidingPane} from "../SlidingPane";

import lodash from 'lodash'


type PaneContent = (paneManagerControls: PaneManagerControls, props?:object)=>React.ReactNode







type PaneManagerContent = (paneManagerControls:PaneManagerControls)=>React.ReactNode

export enum ViewMode {
    Default="default",
    FullScreen="fullscreen"

}


export interface SidePane{
    content: PaneContent,
    shouldClose?:()=>boolean,
    onClose?:()=>void,
    willClose?:()=>void,
    props?:object
}



export interface Pane {
    content: PaneContent,
    viewMode?: ViewMode,
    shouldClose?:()=>boolean,
    onClose?:()=>void,
    willClose?:()=>void,
    props?:object
}



interface PaneManagerState {
    panes: Pane[],
    paneDistance: number,
    isPaneClosing: Array<undefined | boolean>
}



interface PaneManagerProps {
    minPaneDistance: number,
    maxPaneDistance: number,
    children: PaneManagerContent,
    paneWidth:number,
    timeoutMS: number,
    baseZIndex: number,
    paneStartPadding: number,
    paneClassName?: string,
    paneBackgroundClassName?:string,
    paneContentClassName?: string,
    onPaneClose?:(index: number)=>void,
    onPaneOpen?:(index: number, pane:Pane)=>void,
    onSidePaneOpen?:(paneIndex: number, sidePane:SidePane)=>void,
    paneWillClose?:(index: number)=>void
}


export interface PaneManagerControls {
    addPane: (pane:Pane)=>void,
    closePane: (index:number,callback?:()=>void)=>void,
    closeLastPane: (callback?:()=>void)=>void,
    setSidePane: (sidePane: SidePane)=>void,
    closeSidePane :()=>void,
    updateLastPaneProps: (props:object)=>void,
    updateSidePaneProps: (props:object)=>void

}



function range(i: number, len: number, arr:number[] = []): number[]{
    if(i >= len){
        return arr
    }
    return range(i + 1,len, [...arr,i])
}

class PaneManager extends React.Component<PaneManagerProps, PaneManagerState>{
    private paneRefs: SlidingPane[] | null[];
    private contentRef: React.RefObject<HTMLDivElement>;
    private resizeObserver: ResizeObserver;



    constructor(props: PaneManagerProps | Readonly<PaneManagerProps>) {
        super(props);
        //@ts-ignore
        window.paneManager = this;
        this.closePane = this.closePane.bind(this);
        this.addPane = this.addPane.bind(this)
        this.setPaneDistance = this.setPaneDistance.bind(this)
        this.setSidePane = this.setSidePane.bind(this)
        this.closeSidePane = this.closeSidePane.bind(this)
        this.closeLastPane = this.closeLastPane.bind(this)
        this.updateSidePaneProps = this.updateSidePaneProps.bind(this)
        this.updateLastPaneProps = this.updateLastPaneProps.bind(this)

        this.paneRefs = []
        this.contentRef = React.createRef()
        this.state = {
            panes:[],
            paneDistance:props.maxPaneDistance,
            isPaneClosing: []
        }

        this.resizeObserver = new ResizeObserver(lodash.debounce(this.setPaneDistance,200))

    }



    static defaultProps = {
        maxPaneDistance:200,
        minPaneDistance:10,
        paneWidth:300,
        timeoutMS: 500,
        baseZIndex:2000,
        paneStartPadding: 0
    }




    addPane(pane: Pane):void {
        const fullscreen: boolean | undefined = this.state.panes[this.state.panes.length - 1]?.viewMode === ViewMode.FullScreen
        if(fullscreen){
            return
        }
        this.setState((state)=>{
            const panes:Pane[] = [...state.panes]
            panes.push(pane);
            return {panes}

        },()=>{
            const index: number = this.state.panes.length - 1
            const onPaneOpen = this.props.onPaneOpen;
            typeof onPaneOpen === "function" &&  onPaneOpen(index, this.state.panes[index])
            this.setPaneDistance()
            setTimeout(this.setPaneDistance,this.props.timeoutMS)
        })
    }

    setPaneDistance(){
        setTimeout(()=>{
            const paneDistance = this.getPaneDistance()
            if(paneDistance !== null){
                this.setState({paneDistance})
            }
        },0)

    }

    updatePaneProps(index:number, props: object){
        if(index>=0 && this.state.panes.length > index){
            this.setState((state)=>{
                const panes = [...state.panes]
                panes[index] = {...panes[index],props}
                return {panes}
            })

        }
    }

    updateLastPaneProps(props: object){
        this.updatePaneProps(this.state.panes.length - 1,props)
    }


    componentDidMount() {
        if(this.contentRef.current){
            this.resizeObserver.observe(this.contentRef.current)
        }
    }

    componentWillUnmount() {
        if(this.contentRef.current) {
            this.resizeObserver.unobserve(this.contentRef.current)
        }
    }


    closePane(paneIndex: number , callback?:()=>void): void{
        if(paneIndex<0){
            return
        }
        const paneIndexes: number[] = range(paneIndex,this.state.panes.length)
        const paneIndexesToClose: number[] = []

        for(let i = this.state.panes.length-1;i>=paneIndex;i--){
            const pane = this.state.panes[i];
            const paneInstance = this.paneRefs[i]

            if(
                (
                    !paneInstance?.state.sidePane
                    || paneInstance.closeSidePane()
                ) &&
                (!pane.shouldClose || pane.shouldClose())
            ){

                paneIndexesToClose.push(i)
            }else{
                break;
            }
        }
        paneIndexesToClose.reverse()
        if(paneIndexesToClose.length > 0){

            this.setIsPaneIsClosing(paneIndexesToClose[paneIndexesToClose.length-1],()=>{
                this.setPaneDistance()
                const lastIndex = paneIndexesToClose[paneIndexesToClose.length -1]
                for(let index=lastIndex ;index>=paneIndexesToClose[0];index--){
                    this.props.paneWillClose?.(index);
                    const cb = this.state.panes[index]?.willClose
                    typeof cb === "function" && cb()
                }
                setTimeout(()=>{
                    this.setState(state=>{
                        const panes = [...state.panes]
                        const newPanes = panes.slice(0,panes.length-paneIndexesToClose.length)
                        const lastIndex = paneIndexesToClose[paneIndexesToClose.length -1]

                        for(let index=lastIndex ;index>=paneIndexesToClose[0];index--){
                            this.props.onPaneClose?.(index)
                            const cb = state.panes[index]?.onClose
                            typeof cb === "function" && cb()
                        }
                        return {panes:newPanes,isPaneClosing:[]}
                    },()=>{

                        this.setPaneDistance()
                        typeof callback == "function" && callback()
                    })
                },this.props.timeoutMS)
            })
        }


    }



    getPaneWidth(index: number, sideView: boolean = false): string{
        const width =  sideView?this.props.paneWidth:0

        return "calc(100% - "+(((index + 1)*this.state.paneDistance + width)+ this.props.paneStartPadding) +"px )"

    }


    setIsPaneIsClosing(index:number,callback: (() => void) | undefined){
       this.setState((state)=>{
           const isPaneClosing = [...state.isPaneClosing]
           for(let i = index;i<state.panes.length;i++){
               isPaneClosing[i]=true
           }
           return {isPaneClosing}
       },callback)
    }





    getPaneDistance(): number | null{
        const paneCount: number = this.state.panes.length
        const contentX:number | null = this.getPaneManagerLastX()
        if(contentX!==null && paneCount > 0){
            const isLastPaneClosing = this.state.isPaneClosing[this.state.isPaneClosing.length - 1]
            const paneIndex = isLastPaneClosing?paneCount-2:paneCount-1
            if(paneIndex >= 0){
                const realPaneCount = paneIndex + 1
                const lastPane = this.state.panes[paneIndex]

                if(lastPane.viewMode === ViewMode.FullScreen && !isLastPaneClosing){
                    return this.props.minPaneDistance;
                }
                const paneDistance = (contentX - this.props.paneWidth - this.props.paneWidth)/realPaneCount
                if(paneDistance > this.props.maxPaneDistance){
                    return this.props.maxPaneDistance
                }

                if(paneDistance<this.props.minPaneDistance){
                    return this.props.minPaneDistance
                }

                return paneDistance
            }

        }
        return null;
    }

    closeLastPane(callback?: (() => void)){
        this.closePane(this.state.panes.length - 1,callback)
    }

    renderMainPane(index: number): React.ReactElement{
        const pane:Pane = this.state.panes[index]

        return (
            <SlidingPane
                onClose={()=>{this.closePane(this.state.panes.length - 1) }}
                ref={e=>this.paneRefs[index] = e}
                zIndex={this.props.baseZIndex + (index)*2}
                key={index}
                fullscreen={pane.viewMode === ViewMode.FullScreen}
                screenWidth={this.getPaneWidth(index)}
                isClosing={!!this.state.isPaneClosing[index]}
                contentWidth={this.props.paneWidth}
                timeoutMS={this.props.timeoutMS}
                className={this.props.paneClassName}
                backgroundClassName={this.props.paneBackgroundClassName}
                contentClassName={this.props.paneContentClassName}
                onSidePaneOpen={(sidePane => this.props.onSidePaneOpen?.(index,sidePane))}
            >
                {(paneControls => (
                    pane.content({
                        closePane:this.closePane,
                        closeLastPane:this.closeLastPane,
                        setSidePane: this.setSidePane,
                        closeSidePane: this.closeSidePane,
                        addPane: this.addPane,
                        updateLastPaneProps: this.updateLastPaneProps,
                        updateSidePaneProps: this.updateSidePaneProps
                    },pane.props)
                ))}
            </SlidingPane>

        )


    }

    setSidePane(sidePane: SidePane){
        if(this.paneRefs!== null){
            const paneInstance = this.paneRefs[this.state.panes.length - 1]
            paneInstance?.setSidePane(sidePane);
        }

    }


    closeSidePane(){
        if(this.paneRefs!== null){
            const paneInstance = this.paneRefs[this.state.panes.length - 1]
            paneInstance?.closeSidePane();
        }

    }

    updateSidePaneProps(props: object){
        if(this.paneRefs!== null){
            const paneInstance = this.paneRefs[this.state.panes.length - 1]
            paneInstance?.updateSidePaneProps(props);
        }

    }


    getLastPaneXPosition(): number | null{
        if(this.state.panes.length > 0){
            const boundingBox: DOMRect | undefined = this?.paneRefs?.[this.state.panes.length - 1]?.contentRef?.current?.getBoundingClientRect()
            if(typeof boundingBox  !== "undefined"){
                return boundingBox.x + boundingBox.width
            }

        }
        return null

    }

    getPaneManagerLastX(): number| null {
        const boundingBox: DOMRect | undefined = this.contentRef?.current?.getBoundingClientRect()
        if(typeof boundingBox  !== "undefined"){
            return boundingBox.x + boundingBox.width
        }
        return null;

    }


    renderPanes(): React.ReactNode{
        return this.state.panes.map((_,index)=>(
            this.renderMainPane(index)
        ))
    }

    render(){

        return (
            <div className={"pane-manager"} ref={this.contentRef}>
                {this.props.children({
                    addPane:this.addPane,
                    closeLastPane:this.closeLastPane,
                    closePane:this.closePane,
                    setSidePane: this.setSidePane,
                    closeSidePane: this.closeSidePane,
                    updateLastPaneProps: this.updateLastPaneProps,
                    updateSidePaneProps: this.updateSidePaneProps
                })}
                {this.renderPanes()}
            </div
            >
        )
    }

}


export {PaneManager};