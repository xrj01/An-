import React from 'react';
import { Button, Checkbox, Row, Col, message } from 'antd';
import './role.scss';
import api from './../../components/api';
import { createHashHistory } from 'history';

const history = createHashHistory();

export default class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',    // 角色id
            role: '',  // 角色
            jurisdicArr: [],  // 权限数组
            jurisdic:{},      // 父id 对应的权限情况
            checkValObj:{},
            checkALL: false,   // 是否选择全部
            initCheckValObj: {},   // 首次进入所选中的值
        }
    }

    componentDidMount() {
        const { location } = this.props;
        console.log('location.search.substring(1)', sessionStorage.getItem('roles'));
        
        this.setState({
            id: JSON.parse(sessionStorage.getItem('roles')).id,
            role: JSON.parse(sessionStorage.getItem('roles')).name
        }, () => {
            
            this.getJurisdiction()
        })
    }
    // 获取权限数据
    getJurisdiction = (type = 0) => {
        let { id,jurisdic} = this.state;
        // 后台参数
        const param = {
            type: type,
            role_id: id
        }
        api.axiosPost('role_set', param).then(res => {
            console.log('所有权限：', res);
            if (res.data.code === 1) {
                const jurData = res.data.data;
                jurData && jurData.map((item)=>{
                    const valLen = item.val.length;
                    const checkIdLen = item.check_ids.length;
                    if(checkIdLen == 0){
                        item.indeterminate = false;
                        item.checked = false;
                    }else if(checkIdLen < valLen){
                        item.indeterminate = true;
                        item.checked = false;
                    }else{
                        item.indeterminate = false;
                        item.checked = true;
                    }
                    jurisdic[item.id] = item;
                    if(checkIdLen){
                        this.onGroupChange(item.id,item.check_ids,true);
                    }
                });
                this.state.initCheckValObj = Object.assign({},this.state.checkValObj)
                console.log('this.state.initCheckValObj', this.state.initCheckValObj);
                let checkALL = !jurData.some((tag) => tag.checked === false);
                // console.log('checkALL', checkALL);
                this.setState({
                    jurisdicArr: jurData,
                    jurisdic,
                    checkALL,
                })
            }
        })
    }


 
    
    // 一级分类状态管理
    onCheckAllChange = (type,checked) => {
        const {jurisdic, jurisdicArr} = this.state;
        const isJurisdic = jurisdic[type];
        if(checked){
            const checkVal = [];
            isJurisdic.val && isJurisdic.val.map((item)=>{ checkVal.push(item.jid) })
            isJurisdic.check_ids = checkVal;
            isJurisdic.indeterminate = false;
            isJurisdic.checked = true;
            this.onGroupChange(type,checkVal)
        }else{
            isJurisdic.check_ids = [];
            isJurisdic.indeterminate = false;
            isJurisdic.checked = false;
            this.onGroupChange(type,[]);
        }
        let checkALL = !jurisdicArr.some((tag) => tag.checked === false);
        this.setState({
            jurisdic,checkALL
        })
    };



    // 二级分类组改变后的回调
    onGroupChange = (level1,checkedValue, init=false) => {
        const {checkValObj,jurisdic,jurisdicArr} = this.state;
        const checkVal=[];
        const check_ids_len = checkedValue.length;
        const check_val_len = jurisdic[level1].val.length;

        jurisdic[level1].check_ids = checkedValue;
        
        if(check_ids_len == 0){
            jurisdic[level1].indeterminate = false;
            jurisdic[level1].checked = false;
        }else if(check_ids_len == check_val_len){
            jurisdic[level1].indeterminate = false;
            jurisdic[level1].checked = true;
        }else{
            jurisdic[level1].indeterminate = true;
            jurisdic[level1].checked = false;
        }

        checkedValue && checkedValue.map((item)=>{
            checkVal.push(`${level1}_${item}`);
        });
        let checkALL = !jurisdicArr.some((tag) => tag.checked === false);
        checkValObj[level1] = checkVal;
        
        this.setState({checkVal,jurisdic,checkALL});
    }
    // 判断是否有改变
    isChangeJur = () => {
        const {checkValObj, initCheckValObj} = this.state;
        let isEqual = true;
        for(let key in checkValObj){
            if(initCheckValObj[key]){
                if(checkValObj[key].join(',') === initCheckValObj[key].join(',')){
                    isEqual = true
                }else {
                    return false
                }
            }else{
                return false
            }
        }
        return isEqual
    }

    // 点击保存
    save = () => {
        const {checkValObj, id} = this.state;
        const saveArr = [];
        for(let key in checkValObj){
            checkValObj[key] && checkValObj[key].map((item)=>(
                saveArr.push(item)
            ));
        }
        if(!saveArr.length){
            message.warning('请至少设置一个权限！')
            return;
        }
        const isEqual = this.isChangeJur()
        // console.log('isEqual', isEqual);
        // return
        // 后台参数
        const param = {
            type: 1,
            role_id: id,
            jurisdiction: saveArr.join(',')
        }
        api.axiosPost('role_set', param).then(res => {
            console.log('res', res);
            if(res.data.code === 1) { 
                message.success(`权限设置${res.data.msg}。`)
                
                if(!isEqual && JSON.parse(sessionStorage.getItem('roles')).id == sessionStorage.getItem('role_id')){
                    this.state.initCheckValObj = Object.assign({},this.state.checkValObj)
                    message.warning('当前角色权限改变，将为您跳转到登录界面重新登录。',3,()=>{
                        sessionStorage.clear()
                        history.push('/');
                    })
                }
            }else{
                message.error(res.data.msg)
            }
        })
    }

    // 选择全部
    allChecked=(e)=>{
        const isTrue = e.target.checked;
        const {jurisdicArr} = this.state;
        this.setState({
            checkALL: isTrue
        })
        
        jurisdicArr && jurisdicArr.map((item)=>{
            this.onCheckAllChange(item.id,isTrue)
        });
    };
    render() {
        let { jurisdicArr,checkALL,role } = this.state;

        return (
            <div className="roleJurisdiction-box">
                <h4 className='h4-title margin-bottom-20'>权限设置</h4>
                <div className="merchant-nums margin-bottom-10 table-title">
                    <div>
                        当前角色： {role}
                    </div>
                </div>
                {/* 角色展示 */}
                {
                    jurisdicArr && jurisdicArr.length && jurisdicArr.map((item, index) => {
                        return (
                            <div className="roleJurisdiction-item" key={index}>
                                <div className="first-jurisdiction">
                                    <Checkbox 
                                        value={item.id} 
                                        indeterminate={item.indeterminate}
                                        checked={item.checked}
                                        onChange={(e)=>{this.onCheckAllChange(item.id,e.target.checked)}}
                                    >
                                        {item.name}
                                    </Checkbox>
                                </div>

                                <div className="second-jurisdiction" style={{display: item.val.length?'dispaly' : "none"}}>
                                    <Checkbox.Group 
                                        style={{ width: '100%' }}
                                        value={item.check_ids} 
                                        onChange={(checkedValue)=>{this.onGroupChange(item.id,checkedValue)}}
                                    >
                                        <Row>
                                            {
                                                item.val.length>0 && item.val.map((child, cindex) => {
                                                    return (
                                                        <Col span={4} key={child.jid} >
                                                            <Checkbox 
                                                                value={child.jid}
                                                            >
                                                                {child.node_name}
                                                            </Checkbox>
                                                        </Col>
                                                    )
                                                })
                                            }
                                        </Row>
                                    </Checkbox.Group>,
                                 </div>
                            </div>
                        )
                    })
                }

                <div className="check-all-jurisdiction">
                    <Checkbox onChange={this.allChecked} checked={checkALL}>选择全部</Checkbox>
                </div>
                <div className="save-btn">
                    <Button type="primary" onClick={this.save}>保存</Button>
                </div>
            </div>
        )
    }
}