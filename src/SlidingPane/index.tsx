import React from "react";

import classnames from 'classnames'
import type {PaneManagerControls, SidePane} from "../PaneManager";



type childrenAttribute = (paneManagerControls:PaneManagerControls)=> React.ReactNode



interface CustomSlidingPaneProps {
    screenWidth: string,
    sideBySide?:boolean,
    isClosing?: boolean,
    children:childrenAttribute,
    contentWidth: number | string,
    zIndex:number,
    timeoutMS:number,
    fullscreen: boolean,
    onSidePaneOpen?:(sidePane:SidePane)=>void,
    onClose?: ()=>void,
    className?: string,
    backgroundClassName?:string,
    contentClassName?:string
}

const Z_INDEX_STEP:number = 1;


interface CustomSlidingPaneState {
    isOpen: boolean,
    isSidePaneClosing:boolean,
    sidePane: SidePane | undefined

}

export class SlidingPane extends React.Component<CustomSlidingPaneProps, CustomSlidingPaneState>{
    private timeoutID: number | undefined;
    public contentRef: React.RefObject<HTMLDivElement>;

    private sidePaneRef: SlidingPane | null;

    constructor(props: CustomSlidingPaneProps | Readonly<CustomSlidingPaneProps>) {
        super(props);

        this.setSidePane = this.setSidePane.bind(this)
        this.closeSidePane = this.closeSidePane.bind(this)
        this.updateSidePaneProps = this.updateSidePaneProps.bind(this)
        this.contentRef = React.createRef();
        this.sidePaneRef = null;
        this.state = {
            isOpen:false,
            isSidePaneClosing: false,
            sidePane:undefined
        }
    }




    static defaultProps = {
        zIndex: 100
    }

    updateSidePaneProps(props: object){
        this.setState((state)=>{
            if(state.sidePane){
                const sidePane = {...state.sidePane, props: {...state.sidePane.props, ...props}}
                return {sidePane}
            }
            return null
        })
    }

   setSidePane(sidePane:SidePane){
        if(this.props.fullscreen){
            return;
        }
        clearTimeout(this.timeoutID)
        if(this.state.sidePane){
            return;
        }


        this.setState({
            sidePane
        },()=>{this.props.onSidePaneOpen?.(sidePane)})

    }

  closeSidePane(callback?:()=>void): boolean{
        const shouldClose = !this.state.sidePane?.shouldClose || this.state.sidePane.shouldClose()
        if(shouldClose){
            this.setState({isSidePaneClosing:true},()=>{
                const cb = this.state.sidePane?.willClose
                typeof cb === "function" && cb()
                this.timeoutID = setTimeout(()=>{
                    const cb = this.state.sidePane?.onClose
                    typeof cb === "function" && cb()
                    this.setState({sidePane:undefined,isSidePaneClosing:false},callback)
                },this.props.timeoutMS)
            })
        }
        return shouldClose
    }


    componentDidMount() {
        setTimeout(()=>{
            this.setState({
                isOpen:true
            })
        },0)
    }

    componentDidUpdate(prevProps: Readonly<CustomSlidingPaneProps>, prevState: Readonly<CustomSlidingPaneState>, snapshot?: any) {
        if(!prevProps.isClosing && this.props.isClosing){
            this.setState({isOpen:false})
        }
    }

    renderSidePane(){

        if(this.state.sidePane){
            return (
                <div className={"unp-sliding-pane-content-side-by-side-content"}>
                    <SlidingPane zIndex={this.props.zIndex + Z_INDEX_STEP} ref={e=>{this.sidePaneRef = e}} fullscreen={false} screenWidth={"100%"} sideBySide={true} isClosing={this.state.isSidePaneClosing} contentWidth={this.props.contentWidth} timeoutMS={this.props.timeoutMS} className={this.props.className} contentClassName={this.props.contentClassName}>
                        {(paneControls) => {
                            const sidePane = this.state.sidePane
                            return sidePane?.content({
                                closeSidePane:this.closeSidePane,
                                addPane:()=>{},
                                closePane:()=>{},
                                closeLastPane:()=>{},
                                setSidePane:()=>{},
                                compressPanes:()=>{},
                                decompressPanes:()=>{},
                                updateSidePaneProps:this.updateSidePaneProps,
                                updateLastPaneProps:(props)=>undefined,
                                getPaneCount:()=>null
                            },sidePane?.props)

                        }}
                    </SlidingPane>
                </div>
            )
        }

        return null;

    }



    render(){

        const contentWidth = this.props.fullscreen?"100%": this.props.contentWidth
        return (
            <div>
                {this.props.sideBySide?null:<div onClick={this.props.onClose} style={{transition:"background-color " + this.props.timeoutMS + "ms",zIndex:this.props.zIndex}} className={classnames(["unp-sliding-pane-background", {transparent: !this.state.isOpen},this.props.backgroundClassName])}/>}

                <div className={classnames("unp-sliding-pane",{"side-by-side":this.props.sideBySide},{closing:!this.state.isOpen},{"unp-no-shadow":this.props.sideBySide},this.props.className)} style={{width:this.props.screenWidth,transition:"transform " + this.props.timeoutMS + "ms, width " + this.props.timeoutMS+"ms",zIndex:this.props.zIndex + Z_INDEX_STEP}}>

                    <div ref={this.contentRef } className={classnames("unp-sliding-pane-content",this.props.contentClassName)} style={{minWidth:contentWidth,width:contentWidth}}>

                         {this.props.children({
                             setSidePane:this.setSidePane,
                             closeSidePane:this.closeSidePane,
                             addPane:()=>{},
                             closeLastPane:()=>{},
                             closePane:()=>{},
                             compressPanes:()=>{},
                             decompressPanes:()=>{},
                             updateSidePaneProps:this.updateSidePaneProps,
                             updateLastPaneProps:(props)=>undefined,
                             getPaneCount:()=>null
                         })}

                    </div>
                   {this.renderSidePane()}



                </div>
            </div>
        )
    }
}

