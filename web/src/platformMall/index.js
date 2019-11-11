import React from "react";
import Menu from "./../component/menu";
import publicFn from "./../components/public";

export default class Platform extends React.Component{
    constructor(props) {
        super(props);
        const navList = publicFn.permissions(this.props.location.pathname);
        this.state={
            navList:navList
        }
    }

    componentDidMount () {
        // console.log('this.props', this.props);
        // const JurisdictArr = JSON.parse(sessionStorage.getItem('Jurisdiction'));
        // let navList = []
        // JurisdictArr.map((item, index)=>{
        //     if(item.path === this.props.location.pathname){
        //         navList = item.second
        //     }
        // })      
        // this.setState({
        //     navList
        // })
    }


    render(){
        const {routes} = this.props;
        return(
            <Menu routes={routes} navList={this.state.navList} header="商品"/>
        )
    }

}