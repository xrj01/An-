import React from "react";
import { Input, Button,Select ,Pagination,Row,Col,Icon,Table,Divider,message,Modal } from "antd";

import {Link} from "react-router-dom";
import api from "./../../components/api";
import publicFn from "./../../components/public"
import MerchantModal from './MerchantModal';
// import ExamineModal from './examineModal';

import './index.scss';

const { confirm } = Modal;

class Merchants extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            totalNum:'',  // 商家总数
            columns : [
                {
                    title: '用户账户',
                    dataIndex: 'user_name',
                    align: 'center'
                },
                {
                    title: '成员姓名',
                    dataIndex: 'name',
                    align: 'center'
                },
                {
                    title: '所属部门',
                    dataIndex: 'department_name',
                    align: 'center'
                },
                {
                    title: '对应角色',
                    dataIndex: 'role_name',
                    align: 'center'
                },
                {
                    title: '手机号码',
                    dataIndex: 'phone',
                    align: 'center'
                },
                {
                    title: '添加时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '最后登录',
                    dataIndex: 'last_login_time',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    width:230,
                    align: 'center',
                    render:(text,record)=>{
                        // console.log(text,record)
                        const { thirdJur } = this.state;
                        return(
                            <div>
                                {
                                    thirdJur[42].display ? 
                                    <span className="editbtn" onClick={()=>{ this.isShowModal('visible',true,record) }}>编辑<Divider type="vertical" /></span> : ''
                                }
                                
                                {
                                    thirdJur[43].display ? 
                                    <span className="editbtn" onClick={()=>{ this.deleteUser(record) }}>删除</span> : ''
                                }
                                
                            </div>
                        )
                    }
                }, 
            ],
            data:[],         // 表格数据
            visible: false,  // 控制弹出层的显示与隐藏
            examineVisable: false,
            
            singleRowData: {}, //  编辑弹窗单条数据
            singleExaminData: {}, //  审核弹窗单条数据
            userName:'',
            name:'',    //   搜索内容
            departmentSelect:[],         // 部门列表
            department:undefined,    //  所属部门
            page_number:1,  // 页码
            page_size:10,    // 每页数量
            total:0,
            tabloading:false, // 表格加载状态
            totalRowNum: '',  // 分页总数
            isSearch: 0,
            thirdJur: {},      // 权限
        }
    }

    
    componentWillMount(){
        this.userList()
        this.departmentSelect()

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    // 控制编辑弹窗显示与隐藏
    isShowModal = (type,isTrue,record) =>{
        this.setState({
            [type]:isTrue,
            singleRowData: record
        },()=>{
            if(record){
                this.merchantModal.editForm(record)
            }
        });
        
    }

    // 获取输入框值
    handelInputOnChange = (type,value)  => {
        this.setState({
            [type]: value
        })
    }
    // 获取部门名称 下拉框
    onChangeDepartment = (value) =>{
        
        this.setState({department : value})
    }
    // 用户管理列表
    userList = () => {
        const {page_number,page_size,name,department} = this.state;
        const data = {
            pageNumber : page_number,
            pageSize : page_size,
            name: name,
            department_id : department ? department : 0
        }
    
        api.axiosPost('user_list',data).then((res) => {
            if(res.data.code === 1){
                
                this.setState({
                    data : res.data.data.result,
                    total : res.data.data.page.totalRow
                })
            }else {
                message.error(res.data.msg);
            }
        })
    }
    
    // 删除用户的操作
    deleteUser = (record) => {
        const _this = this;
        confirm({
        title: '删除用户',
        content: '确定删除此用户？',
        okText: '确认',
        centered:true,
        icon:<Icon type="exclamation-circle" className='delet-icon'></Icon>,
        okType: '',
        cancelText: '取消',
        onOk() {
            
            api.axiosPost('delete',{id:record.id}).then(res=>{
                if(res.data.code ===1){
                    message.success(res.data.msg);
                    _this.userList()
                }else{
                    message.error(res.data.msg);
                    
                }
            })
            
        },
        onCancel() {
            // console.log('Cancel');
        },
        });
    }
    // 获取部门下拉数据
    departmentSelect = () =>{
        const data = {}
        api.axiosPost('department_select',data).then((res)=>{
            console.log('res', res);
            this.setState({
                departmentSelect : res.data.data
            })
        })
    }
    // 搜索
    handelSearch = () => {
        const {userName,department} = this.state
        if(userName || department){
            this.setState({
                name: userName,
                page_number:1,
            },()=>{this.userList()})
            
        }else{
            message.error('请设置搜索条件！')
        }
        
    }
    // 重置按钮
    resetBtn = () =>{
        this.setState({
            page_number:1,
            page_size:10,
            userName : '',
            name:'',
            department : undefined
        },()=>{this.userList()})
        
    }
    // 分页数量切换
    onShowSizeChange = (number,size) =>{
        this.setState({
            page_number:number,
            page_size:size
        },()=>{this.userList()})
    }
    render(){
        
        // 编辑弹框的props
        const modalObj = {
            display: this.state.visible,
            hideModal: this.isShowModal,
            getList : this.userList,
            singleRowData : this.state.singleRowData
        }

        const {columns,data,total,page_size,page_number,} = this.state
        // 动态加载下拉数据
        const {departmentSelect, thirdJur} = this.state
        const { Option } = Select;
        const children = [];
        for (let i = 0; i < departmentSelect.length; i++) {
            children.push(<Option key={i} value={departmentSelect[i].id}>{departmentSelect[i].name}</Option>);
        }
        
        
        // 分页配置
        const pagination={
            total:total,
            pageSize:page_size,
            current:page_number,
            onChange:(page,size)=>{
                this.setState({page_number:page,page_size:size,spinning:true},()=>{
                    this.userList()
                })
                document.getElementById('root').scrollIntoView(true)
            }
        };
        return(
            <div className="merchant-list-box">
                <h4 className='h4-title'>用户管理</h4>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className="form-box search-box">
                        <div>
                            <Input 
                                className="width-200 " 
                                value={this.state.userName}
                                onChange={(e)=>{this.handelInputOnChange('userName',e.target.value)}} 
                                placeholder="请输入成员姓名">
                            </Input>
                        </div>
                        <div>
                            <Select placeholder="所属部门" className="width-200" onChange={this.onChangeDepartment} value = {this.state.department}>
                                {children}
                            </Select>
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={()=>(this.handelSearch())}>搜索</Button>
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={()=>{this.resetBtn()}}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>

                <div className="merchant-nums margin-bottom-10 table-title">
                    <div>
                        <Icon type="info-circle" className="iconColor"/>&nbsp;成员总数：<em>{total}</em>个 
                    </div>
                    <div>
                        {
                            Object.keys(thirdJur).length && thirdJur[41].display ? 
                            <Button type="primary" onClick={()=>{this.isShowModal('visible',true)}}>添加</Button> : ''
                        }
                        
                    </div>
                 
                </div>

                <div className="tab-box">
                    <Table 
                        dataSource={this.state.data} 
                        columns={this.state.columns}
                        bordered
                        pagination={false}
                        loading={this.state.tabloading}
                    />
                    
                </div>
                <div className="class-pagination-box">
                    <Pagination 
                        defaultCurrent={1}   
                        {...pagination} 
                        hideOnSinglePage={true} 
                        showSizeChanger 
                        showQuickJumper={{goButton: <Button className='pagination-btn'>确定</Button>}} 
                        onShowSizeChange={this.onShowSizeChange}/>
                </div>
                <MerchantModal {...modalObj} wrappedComponentRef={(e)=>{this.merchantModal = e}}/>
                {/* <ExamineModal {...exanineModal} ref="exanineModal"/> */}
            </div>
        )
    }

}

export default Merchants;