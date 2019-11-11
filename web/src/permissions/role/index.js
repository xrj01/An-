import React from "react";
import {  Button ,Pagination,Icon,Table,Divider,message,Modal } from "antd";

import {Link} from "react-router-dom";
import api from "./../../components/api";
import publicFn from "./../../components/public"
import MerchantModal from './MerchantModal';
import { createHashHistory } from 'history';

import './index.scss';
const { confirm } = Modal;
const history = createHashHistory();

class Merchants extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            columns : [
                {
                    title: '角色名称',
                    dataIndex: 'name',
                    align: 'center'
                },
                {
                    title: '角色描述',
                    dataIndex: 'info',
                    align: 'center'
                },
                {
                    title: '添加时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    width:230,
                    align: 'center',
                    render:(text,record)=>{
                        const {thirdJur} = this.state;
                        return(
                            <div>
                                {
                                    thirdJur[45].display ? <span className="blue" onClick={()=>{this.goSet(record)}}>权限设置<Divider type="vertical" /></span> : ''
                                }
                                {
                                    thirdJur[39].display ? <span className="editbtn" onClick={()=>{ this.isShowModal('visible',true,record) }}>编辑<Divider type="vertical" /></span> :''
                                }
                                {
                                    thirdJur[40].display ? <span className="editbtn" onClick={()=>{ this.resetAcountPWDModal(record) }}>删除</span> : ""
                                }
                                
                                
                                
                            </div>
                        )
                    }
                }, 
            ],
            data:[],         // 表格数据
            visible: false,  // 控制弹出层的显示与隐藏
            singleRowData: {}, //  编辑弹窗单条数据
            page_number:1,  // 页码
            page_size:10,    // 每页数量
            total:0,
            tabloading:false, // 表格加载状态
            count:0,
            thirdJur: {},    // 权限
            
        }
    }

    
    componentWillMount(){
        this.roleList()

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    // 去设置界面设置权限
    goSet = (record) => {
        
        let param = {
            id: record.id,
            name: record.name
        }
        sessionStorage.setItem('roles',JSON.stringify(param));
        history.push('/permissions/roleJurisdiction')
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

    // 角色管理列表数据获取
    roleList = () => {
        const {page_number,page_size} = this.state;
        const data = {
            pageNumber : page_number,
            pageSize : page_size,
        }

        api.axiosPost('role_list',data).then((res) => {
            if(res.data.code === 1){
                res.data.data.result.length && res.data.data.result.map((item, index) => {
                    item.key = item.id
                })
                this.setState({
                    data : res.data.data.result,
                    total : res.data.data.page.totalRow,
                    count : res.data.data.count
                })
            }else {
                message.error(res.data.msg);
            }
        })
    }
    
    // 删除操作
    resetAcountPWDModal = (record) => {
        let _this = this
        confirm({
        title: '删除角色',
        content: '确定删除此角色？',
        okText: '确认',
        icon:<Icon type="exclamation-circle" className='delet-icon'></Icon>,
        centered:true,
        okType: '',
        cancelText: '取消',
        onOk() {
            return new Promise((resolve, reject) => {
                api.axiosPost('role_delete',{id:record.id}).then(res=>{
                    if(res.data.code === 1){
                        message.success(res.data.msg);
                        _this.roleList()
                        resolve(true);
                    }else{
                        message.error(res.data.msg);
                        reject(false);
                    }
                })
            }).catch(() => console.log('Oops errors!'));
        },
        onCancel() {
            // console.log('Cancel');
        },
        });
    }
    // 分页数量切换
    onShowSizeChange = (number,size) =>{
        this.setState({
            page_number:number,
            page_size:size
        },()=>{this.roleList()})
    }
    render(){
        // 编辑弹框的props
        const modalObj = {
            display: this.state.visible,
            hideModal: this.isShowModal,
            getList : this.roleList,
            singleRowData : this.state.singleRowData
        }
        
        const {count,total,page_size,page_number,thirdJur} = this.state
        // 分页配置
        const pagination={
            total:total,
            pageSize:page_size,
            current:page_number,
            onChange:(page,size)=>{
                this.setState({page_number:page,page_size:size,spinning:true},()=>{
                    this.roleList()
                })
                document.getElementById('root').scrollIntoView(true)
            }
        };
        return(
            <div className="merchant-list-box">
                <h4 className='h4-title'>角色管理</h4>

                <div className="merchant-nums margin-bottom-10 table-title">
                    <div>
                        <Icon type="info-circle" className="iconColor"/>&nbsp;角色总数：<em>{count}</em>个 
                    </div>
                    <div>
                        {
                            Object.keys(thirdJur).length && thirdJur[38] ? <Button type="primary" onClick={()=>{ this.isShowModal('visible',true)}}>添加角色</Button> : ''
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
                
            </div>
        )
    }

}

export default Merchants;