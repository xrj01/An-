import React from "react";
import {Link} from 'react-router-dom';
import "./index.scss";
import api from "./../components/api";
import { createHashHistory } from 'history';
import {Input,Icon ,Button,message,Modal} from "antd";
const history = createHashHistory();
class Login extends React.Component {
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
    keyDown =(e)=>{
        if(e.keyCode == 13){
            this.login()
        }
    }
    componentDidMount() {

    }
    //点击登录
    login=()=>{
        const {userName,password} = this.state;
        if(!userName || !password){
            message.error("用户名密码不能为空");
            return false;
        }
        const data={
            user_name:userName,
            pass_word:password
        };
        api.axiosPost("login",data).then((res)=>{
            // console.log('res.data.sessionId', res.data.data.sessionId, res);
            // return
            console.log('登录信息', res);

            if(res.data.code == 1){
                window.sessionStorage.setItem("token",res.data.data.sessionId);
                const loginJur = res.data.data.data
                loginJur.map((item, index)=>{
                    item.path = item.second[0].path
                })   
                window.sessionStorage.setItem('Jurisdiction', JSON.stringify(loginJur));
                window.sessionStorage.setItem('role_id', res.data.data.role_id);
                const firstUrl = loginJur[0].second[0].path
                history.push(firstUrl);
            }else{
                message.error(res.data.msg)
            }
        });
    };

    render(){
        return(
            <div className="login-box">
                <div className="login">
                    <h4>铁道商城后台管理系统</h4>
                    <div className='login-input'>
                        <Input
                            onChange={(e)=>{this.inputChange("userName",e.target.value)}}
                            placeholder="用户名"
                            value={this.state.userName}
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            onKeyDown={(e)=>{this.keyDown(e)}}
                        />
                    </div>
                    <div className='login-input'>
                        <Input
                            onChange={(e)=>{this.inputChange("password",e.target.value)}}
                            placeholder="密码"
                            type='password'
                            onKeyDown={(e)=>{this.keyDown(e)}}
                            value={this.state.password}
                            prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        />
                    </div>
                    <div className='login-input'>
                        <Button type='primary' onKeyDown={(e)=>{this.keyDown(e)}} onClick={this.login}>登录</Button>
                    </div>
                </div>
            </div>
        )
    }

}

export default Login