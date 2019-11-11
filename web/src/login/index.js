import React from "react";
import {Link} from 'react-router-dom';
import "./index.scss";
import api from "./../components/api";
import { createHashHistory } from 'history';
import {Input,Icon ,Button,message} from "antd";
import LoginModal from "./loginMobal";
const history = createHashHistory();
export default class Login extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state={
            userName:"",
            password:""
        }
    }

    inputChange=(type,value)=>{
        this.setState({
            [type]:value
        })
    };

    //点击登录
    login=()=>{
        const {userName,password} = this.state;
        const data={
            user_name:userName,
            pass_word:password
        };

        api.axiosPost("login",data).then((res)=>{
            if(res.data.code == 1){
                window.sessionStorage.setItem("token",res.data.data.sessionId);
                history.push('/home');
            }
        });
    };

    render(){
        return(
            <div className='login-home-box'>
                <LoginModal login={true}/>
            </div>
        )
    }

}