import React from "react";
import Menu from "./../component/menu";
import publicFn from "./../components/public";

export default class User extends React.Component{
    constructor(props) {
        super(props);
        const navList = publicFn.permissions(this.props.location.pathname);
        this.state={
            navList:navList
        }
    }


    componentDidMount () {
     
    }

    render(){
        const {routes} = this.props;
        return(
            <Menu routes={routes} navList={this.state.navList} header="用户"/>
        )
    }

}