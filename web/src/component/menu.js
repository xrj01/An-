import React from "react";
import {Route,Link} from "react-router-dom";
import Header from "./../component/header";
import {Menu} from "antd";
import "./menu.scss";
export default class MenuList extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            urlKey:window.location.hash,
            clickActive:null,
        };
        this.activeList = [];
    }

    menuClick=(clickActive,menuKey)=>{
        this.setState({clickActive})
        sessionStorage.setItem('menuUrl',menuKey)
    };
    navChange=()=>{
        const clickActive = this.activeList[0];
        this.setState({clickActive})
    };
    componentDidMount(){
        
    }
    render(){
        const {routes,header,navList} = this.props;
        const {urlKey,clickActive} = this.state;
        const selectKeys = clickActive ? clickActive : "active";
        // console.log('routes',routes)
        // console.log('header',header)
        // console.log('---navList---',navList)
        return(
            <div className='platform-warp'>
                <Header active={header} navChange={this.navChange}/>
                <div className="platform-box">
                    <div className="leftBar"></div>
                    <Menu
                        style={{ width: 240 }}
                        selectedKeys={[`${selectKeys}`]}
                        className='mainMenu-box'
                        theme="dark"
                    >
                        {
                            navList && navList.map( (item,index) => {
                                let defaultSelectedKeys = index + 1;
                                if(urlKey == `#${item.path}`){
                                    defaultSelectedKeys = "active";
                                }
                                this.activeList.push(defaultSelectedKeys);
                                return(
                                    <Menu.Item key={defaultSelectedKeys} onClick={()=>{this.menuClick(defaultSelectedKeys,`#${item.path}`)}}>
                                        <Link to={item.path}>{item.name}</Link>
                                    </Menu.Item>
                                )
                            })
                        }
                    </Menu>
                    <div className='menu-right'>
                        {
                            routes && routes.map((route,i)=>{
                                // console.log('---route---', route);
                                return(
                                <Route exact={route.exact} key={i} path={route.path}
                                    render={ props => {
                                        return (
                                        <route.component navList={navList} {...props} routes={route.routes} />
                                    )}}
                                />
                            )})
                        }
                    </div>
                </div>
            </div>
        )
    }

}