import React from "react";
import {Link, Route} from 'react-router-dom';
import Login from "./../login/loginMobal";
import Header from "./../component/header";
import Menu from "./../component/menu";
import "./index.scss";

export default class Home extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            navList:[
                // {name:"系统首页",path:"/home"},
                // {name:"账户设置",path:"/home"},
                // {name:"登录日志",path:"/home"},
            ],
            headerLink: [],      // 头部链接
        }
    }

    componentDidMount () {
        const { headerLink } = this.state;
        const JurisdictArr = JSON.parse(sessionStorage.getItem('Jurisdiction'));
        let navList = []
        JurisdictArr.map((item, index)=>{
            if(item.path === this.props.location.pathname){
                navList = item.second
            }
        })      
        this.setState({
            navList
        })
    }
    render(){
        const {routes} = this.props;

        return(
            <div>
                <Menu 
                    routes={routes} 
                    navList={this.state.navList} 
                    header="首页" 
                />
            </div>
        )
    }

}