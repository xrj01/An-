import React from "react";
import {Button, Icon} from "antd";
import {Link} from "react-router-dom";
import { createHashHistory } from 'history';
import "./header.scss";

const history = createHashHistory();

export default class Header extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            navList:[
                // {name:"首页",path:"/home"},
                // {name:"用户",path:"/user"},
                // {name:"商品",path:"/platform"},
                // {name:"订单",path:"/order"},
                // {name:"权限",path:"/permissions"},
            ]
        }
    }

    navChange=()=>{
        this.props.navChange &&  this.props.navChange()
    };
    // 退出登录
    loginOut = () => {
        sessionStorage.clear()
        history.push('/')
    }

    componentDidMount () {
        // console.log('this.props', this.props);
        const JurisdictArr = JSON.parse(sessionStorage.getItem('Jurisdiction'));
        let navList = []
        JurisdictArr.map((item, index)=>{
            navList.push({id: item.id, name: item.name, path: item.path})
        })      
        this.setState({
            navList
        })
    }

    render(){
        const {active} = this.props;
        const {navList} = this.state;
        return(
            <header>
                <img src={require(`./../image/logo.png`)} alt=""/>
                <ul>
                    {
                        navList.map(item =>(
                            <li key={item.path} className={ active == item.name ? "active" :""} onClick={this.navChange}>
                                <Link to={item.path}>{item.name}</Link>
                            </li> ))
                    }
                </ul>
                <div className="login-out" onClick={this.loginOut}>
                    <div><Icon type="login" /></div>
                    <div>退出登录</div>
                </div>
            </header>
        )
    }

}