import React from "react";
import {Tabs } from "antd";
import ListTable from "./listTable";
import "./index.scss"
const { TabPane } = Tabs;
export default class GoodsList extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            whole: 0,
            upper_shelf: 0,
            stay_on_the_shelf: 0,
            lower_shelf: 0,
            state: 2,
            activeKey: '1'
        }
    }
    totalNum = (obj) => {
        this.setState({
            whole: obj.val1 ,
            upper_shelf: obj.val2,
            stay_on_the_shelf: obj.val3,
            lower_shelf: obj.val4,
        })
    }
    tabOnChange = (key) => {
        // console.log(key)
        this.setState({
            activeKey: key
        })
        switch (key) {
            case '1':
                this.setState({state: 2})
                break;
            case '2':
                this.setState({state: -1})
                break;
            case '3':
                this.setState({state: 1})
                break;
            case '4':
                this.setState({state: 0})
                break;
        }
    }
    render(){
        const param ={
            totalNum: this.totalNum,
            currentState: this.state.state        
        }
        const {activeKey} = this.state
        return(
            <div>
                <h4 className='h4-title'>商品列表</h4>
                <Tabs type="card" onChange={this.tabOnChange} activeKey={activeKey}>
                    <TabPane tab={`全部商品(${this.state.whole})`} key="1">
                        {
                            activeKey == '1' ? <ListTable {...this.props} {...param}/> : <div></div>
                        }
                    </TabPane>
                    <TabPane tab={`待上架(${this.state.stay_on_the_shelf})`} key="2">
                        {/* <ListTable {...param}/> */}
                        {
                            activeKey == '2' ? <ListTable {...this.props} {...param}/> : <div></div>
                        }
                    </TabPane>
                    <TabPane tab={`已上架(${this.state.upper_shelf})`} key="3">
                        {/* <ListTable {...param}/> */}
                        {
                            activeKey == '3' ? <ListTable {...this.props} {...param}/> : <div></div>
                        }
                    </TabPane>
                    <TabPane tab={`已下架(${this.state.lower_shelf})`} key="4">
                        {/* <ListTable {...param}/> */}
                        {
                            activeKey == '4' ? <ListTable {...this.props} {...param}/> : <div></div>
                        }
                    </TabPane>
                </Tabs>
            </div>
        )
    }

}