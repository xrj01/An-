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
                <h4 className='h4-title'>商品模板列表</h4>
                
                <ListTable totalNum={this.totalNum}/>
                
            </div>
        )
    }

}