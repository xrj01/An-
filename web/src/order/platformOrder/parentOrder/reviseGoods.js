
import React from "react";
import { Button, Icon, Table, message, InputNumber, Divider, Modal, Popconfirm } from "antd";
import { createHashHistory } from 'history'
// import {Link} from "react-router-dom";
import AddGoodsModal from './modal/addGoodsModal'
import './reviseGoods.scss';
import Public from '../../../components/public'
import api from "../../../components/api";
const history = createHashHistory();

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 列表表头信息
            columns: [
                {
                    title: '商品图片',
                    dataIndex: 'img',
                    align: 'center',
                    render: (text, record) => {
                        const img = record.type  ? record.pic : Public.imgUrl(record.merchant_id, record.product_id)
                        return <div className='thumbnail'><img src={img} /></div>
                        
                    }
                },
                {
                    title: '商品名称',
                    dataIndex: 'product_name',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            <div className='goodsName'>
                                <p>{text}</p>
                                <p>货号：{record.article_number}</p>
                            </div>
                        )
                    }
                },
                {
                    title: '价格',
                    dataIndex: 'price',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            <div>价格&nbsp;:<span className='delete'>￥{text}</span></div>
                        )
                    }
                },
                {
                    title: '属性',
                    dataIndex: 'sku_value',
                    align: 'center'
                },
                {
                    title: '数量',
                    dataIndex: 'count',
                    align: 'center',
                },
                {
                    title: '库存',
                    dataIndex: 'inventory',
                    align: 'center'
                },
                {
                    title: '小计',
                    dataIndex: 'order_price',
                    align: 'center',
                    render: (text, record) => {
                        return <span className='delete'>￥{text}</span>
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    align: 'center',
                    render: (text, record, index) => {
                        return (
                            <div>
                                <Popconfirm title="您确定要删除么?" onConfirm={() => this.handleDelete(record)}>
                                    <span className='delete'>删除</span>
                                </Popconfirm>
                                <Divider type="vertical" />
                                <span className='blue' onClick={() => { this.isShowModal('editModal', true, index, record) }}>编辑</span>
                            </div>
                        )
                    }
                }
            ],
            // 表格数据
            tableData: [],        //  表格数据
            total: '',            //  合计
            visible: false,       //  新建账户和编辑账户弹窗的操作
            editModal: false,     //  编辑商品弹框的显示与隐藏
            parent_id: '',        //  父级订单的ID
            rowIndex: '',         //  行内索引
            record: {},           //  当前行的数据
            price: '',            //  修改之后的单价
            count: '',            //  修改之后的数量
        }
    }
    // 控制弹窗的显示与隐藏
    isShowModal = (type, isTrue, index, record) => {
        this.setState({
            [type]: isTrue,
            rowIndex: index,
            record: record,
            price: record ? record.price : '',
            count: record ? record.count : ''
        })
    }

    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }

    // 获取修改商品的列表
    getGoodsList = () => {
        api.axiosPost('orderEditGoodsList', { order_id: this.state.parent_id }).then(res => {
            // console.log('res', res);
            if (res.data.code === 1) {
                const { data, goods_total } = res.data.data;
                data.map(item => {
                    item.key = item.son_order_id
                })
                this.setState({
                    tableData: data,
                    total: goods_total
                })
            }
        })
    }

    // 删除商品
    handleDelete = (record) => {
        const dataSource = [...this.state.tableData];
        this.setState({ tableData: dataSource.filter(item => item.key !== record.key) });
        const param = {
            order_id: record.son_order_id,
            num: record.count,
            sku: record.sku,
            product_id: record.product_id
        }
        api.axiosPost('deleteGoods', param).then(res => {
            if (res.data.code === 1) {
                message.success(res.data.msg);
            } else {
                message.error(res.data.msg);
            }
        })
    }

    // 编辑商品
    saveEdit = () => {
        const { rowIndex, record, price, count, tableData } = this.state;
        // 不请求接口回填数据
        tableData[rowIndex].price = price;
        tableData[rowIndex].count = count;
        tableData[rowIndex].order_price = price*count;
        this.setState({
            tableData: tableData
        })
        // -------------- ↑↑↑↑ -------------
        const param = {
            order_id: record.son_order_id,
            price: price,
            count: count,
        }
        api.axiosPost('editGoodsNumAndParice', param).then(res=>{
            if (res.data.code === 1) {
                message.success(res.data.msg);
                this.isShowModal('editModal', false)
            } else {
                message.error(res.data.msg);
            }
        })
    }

    componentDidMount() {
        const id = this.props.location.search.split('?')[1];
        this.setState({
            parent_id: id
        }, () => {
            this.getGoodsList(id)
        })
    }

    render() {
        const { editModal, price, count, total, parent_id } = this.state;
        const footer = <div className='footer'>合计：<b>￥{total}</b></div>
        const addGoodsProps = {
            display: this.state.visible,
            hideModal: this.isShowModal,
            parent_id : parent_id,
            getGoodsList: this.getGoodsList
        };
        return (
            <div className="reviseGoods-box">
                <h4 className='h4-title clearfix'>
                    修改商品信息
                    <Button className="goback" size="small" type="link" onClick={() => { history.goBack() }}>
                        <Icon type="left" />
                        回到父订单
                    </Button>
                </h4>
                <div className="merchant-nums margin-bottom-10 clearfix">
                    <Icon type="info-circle" className="iconColor" />&nbsp;商品列表
                    <div className="addNew">
                        <Button type="primary" size="small" onClick={() => { this.isShowModal("visible", true) }}>添加商品<Icon type="double-right" /></Button>
                    </div>
                </div>

                <div className="tab-box">
                    <Table
                        dataSource={this.state.tableData}
                        columns={this.state.columns}
                        bordered
                        footer={() => { return footer }}
                    />
                </div>
                <AddGoodsModal {...addGoodsProps} />
                <Modal
                    title="编辑商品"
                    visible={editModal}
                    onCancel={() => { this.isShowModal('editModal', false) }}
                    onOk={this.saveEdit}
                    destroyOnClose
                >
                    <div className="edit-goods-input-box">
                        商品价格：&nbsp;
                        <InputNumber
                            defaultValue={price}
                            formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\￥\s?|(,*)/g, '')}
                            onChange={(e)=>{this.handleInputOnchange('price', e)}}
                            min={1}
                        />&nbsp;
                    </div>
                    <div className="edit-goods-input-box">
                        商品数量：&nbsp;
                        <InputNumber
                            min={1} 
                            defaultValue={count} 
                            onChange={(e)=>{this.handleInputOnchange('count', e)}}
                            formatter={value => { return value.replace(/\./g, '') }}
                            parser={value =>{ return value}}
                        />
                    </div>
                </Modal>
            </div>
        )
    }
}

export default Account;