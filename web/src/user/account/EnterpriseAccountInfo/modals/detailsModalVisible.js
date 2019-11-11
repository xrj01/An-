import React from 'react';
import { Modal, Tree } from 'antd';
import './detailsModal.scss';
import api from '../../../../components/api';
const { TreeNode } = Tree;

export default class AddressListModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // id: '',  // 账户ID
            type: 0, // 角色
            detailOBJ: {},  // 详情
            allClass: [],   // 所有分类
            firstLevel: [], // 一级分类
            secondLevel: [], // 二级分类
            thirdLevel: [],  // 三级分类
            classData: [],   // 分类格式
        }
        this.getIdAndType = this.getIdAndType.bind(this)
    }
    // 隐藏弹窗
    hideModal = () => {
        this.props.isShowModal('detailsModalVisible', false, -1)
    }
    // 获取id和角色类型
    getIdAndType = async (id, role) => {
        this.setState({ type: role })
        const param = {
            id: id,
            type: role
        }
        let allClass = null;
        if (role === 2) {
            allClass = await this.getAllClass()    //  ← 获得所有的分类
        }
        let levelClass = await this.getDetail(param);  //  ← 获得账户详情以及采购员的分类

        const { firstLevel, secondLevel, thirdLevel } = levelClass
        // console.log('length------', levelClass[2].length);
        if(role === 2) {
            this.setState({ classData: this.screeningClass(allClass,levelClass) });
        }
        
    }
    // 筛选数据   (递归)
    screeningClass = (data, levelClass) => {
        let $index = 0;  //  根据index取不同的等级数据
        data = data.filter((item, index, arr) => {
            for (let sub = 0; sub < levelClass[$index].length; sub++) {
                const element = levelClass[$index][sub];
                // 删选到第三级  ---  3  ---
                // console.log('element', element, item.key);
                if (item.key == element) {
                    $index = $index++
                    this.screeningClass(item.children,levelClass)
                    return item  // 删选到第三级  ---  3  ---
                }
            }
        })
        return data
    }

    // 获取账户详情
    getDetail = (param) => {
        return api.axiosPost('seeSubAccountDetail', param).then(res => {
            // console.log(res)
            if (res.data.code === 1) {
                const data = res.data.data;      // ← 所有详情数据
                // 设置 采购员 审批员 管理员 的详情
                this.setState({
                    detailOBJ: data,
                })
                if (this.state.type === 2) {
                    // console.log('采购员所有分类', res.data.data.classids);
                    const classids = res.data.data.classids;
                    // 从所有用户所选的分类中 筛选出对应的 一二三 级分类
                    let firstLevel = [], secondLevel = [], thirdLevel = []
                    classids && classids.length && classids.map(item => {
                        const textLength = item.toString().length;
                        if (textLength > 0 && textLength < 3) {
                            firstLevel.push(item);
                        } else if (textLength > 2 && textLength < 5) {
                            secondLevel.push(item);
                        } else if (textLength > 4) {
                            thirdLevel.push(item);
                        }
                    })
                    return  [
                            firstLevel,
                            secondLevel,
                            thirdLevel
                        ]
                        
                    
                } else {
                    return {}
                }

            }
        })
    }
    // 获取全部分类的接口
    getAllClass = () => {
        return api.axiosPost('getAllClass').then(res => {
            // console.log('分类接口', res.data.data);
            if (res.data.code === 1) {
                return res.data.data.concat([])
            } else {
                return []
            }
        })
    }
    // 遍历树形控件的子元素
    renderTreeNodes = data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} />;
        });

    render() {
        /* 
          @type : 1  //  管理员
                  2  //  采购员
                  3  //  审批员
        */
        const { type, detailOBJ, classData } = this.state;
        const { display } = this.props;
        // 角色
        const role = () => {
            switch (type) {
                case 1:
                    return '管理员'
                    break;
                case 2:
                    return '采购员'
                    break;
                case 3:
                    return '审批员'
                    break;
            }
        }
        return (
            <Modal
                title={`${role()}账户详情`}
                visible={display}
                onCancel={this.hideModal}
                footer={null}
                destroyOnClose
                maskClosable={false}
                centered
                width={500}
            >
                <div className='account-info-box'>
                    <div className='info-row'>
                        <span className='props'>账户名称：</span>
                        <span className='value'>{detailOBJ.username}</span>
                    </div>
                    <div className='info-row'>
                        <span className='props'>真实姓名：</span>
                        <span className='value'>{detailOBJ.real_name}</span>
                    </div>
                    {
                        role() == '审批员' || role() == '采购员' ?
                            <div className='info-row'>
                                <span className='props'>所属部门：</span>
                                <span className='value'>{detailOBJ.department}</span>
                            </div> : ''
                    }
                    {
                        role() == '采购员' ?
                            <div className='info-row'>
                                <span className='props'>授信额度：</span>
                                <span className='value'>{detailOBJ.sub_credit}</span>
                            </div> : ''
                    }
                    <div className='info-row'>
                        <span className='props'>手机号码：</span>
                        <span className='value'>{detailOBJ.phone}</span>
                    </div>
                    <div className='info-row'>
                        <span className='props'>账户邮箱：</span>
                        <span className='value'>{detailOBJ.email}</span>
                    </div>
                    {
                        role() == '采购员' ?
                            <div className='purchase-class'>
                                <h1>采购分类信息</h1>
                                <Tree
                                    showLine
                                >
                                    {this.renderTreeNodes(classData)}
                                </Tree>
                            </div>
                            : ''
                    }

                </div>
            </Modal>
        )
    }
}