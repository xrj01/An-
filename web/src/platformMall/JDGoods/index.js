import React from "react";
import {Tabs } from "antd";
import ListTable from "./listTable";

import bind from "react-autobind"
import "./index.scss"
const { TabPane } = Tabs;
export default class GoodsList extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            totalNum: 0
        }
    }
    totalNum = (num) => {
        this.setState({
            totalNum: num
        })
    }
    render(){
        return(
            <div>
                <h4 className='h4-title'>京东商品</h4>
                <Tabs type="card">
                    <TabPane tab={`全部商品(${this.state.totalNum})`} key="1">
                        <ListTable {...this.props} totalNum={this.totalNum}/>
                    </TabPane>
                </Tabs>
            </div>
        )
    }

}