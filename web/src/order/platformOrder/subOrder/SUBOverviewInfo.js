
import React from "react";
import { Button, Icon, Table, message, InputNumber } from "antd";
import { createHashHistory } from 'history'
import { Link } from "react-router-dom";
import InvoiceTable from './../table/invoiceTable';
import SubGoodsInfoTable from './../table/subGoodsInfoTable';
import CostInfoTable from './../table/costInfoTable';
import OperationalInfoTable from './../table/operationalInfoTable';
import ConsigneeTable from './../table/ConsigneeTable';
import api from '../../../components/api';

// import './reviseGoods.scss'
const history = createHashHistory();

class OverviewInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 基础信息列表表头信息
            basicInfoColumns: [
                {
                    title: "订单编号",
                    dataIndex: 'order_id',
                    align: 'center',
                    key: 'order_id',
                },
                {
                    title: "账户来源",
                    dataIndex: 'buyer_from',
                    align: 'center',
                    key: 'buyer_from',
                    render: (text, record) => {
                        const froms = text === 0 ? '企牛采' : '商城';
                        return froms
                    }
                },
                {
                    title: "下单人",
                    dataIndex: 'buyer',
                    align: 'center',
                    key: 'buyer',
                },
                {
                    title: "支付方式",
                    dataIndex: 'pay_type',
                    align: 'center',
                    key: 'pay_type',
                    render: (text, record) => {
                        const thing = text === 0 ? '账期支付' : '-';
                        return thing
                    }
                },
                {
                    title: "订单来源",
                    dataIndex: 'order_from',
                    align: 'center',
                    key: 'order_from',
                    render: (text, record) => {
                        const froms = text === 0 ? '企牛采' : '商城';
                        return froms
                    }
                },
                {
                    title: "订单类型",
                    dataIndex: 'type',
                    align: 'center',
                    key: 'type',
                    render: (text, record) => {
                        switch (text) {
                            case 0:
                                return '昂牛'
                                break;
                            case 1:
                                return '京东'
                                break;
                            case 2:
                                return '昂牛+京东'
                                break;
                        }
                    }
                },
                {
                    title: "配送方式",
                    dataIndex: 'courier_name',
                    align: 'center',
                    key: 'courier_name',
                    render: (text) => {
                        return text ? text : '-'
                    }
                },
                {
                    title: "物流单号",
                    dataIndex: 'courier_id',
                    align: 'center',
                    key: 'courier_id',
                    render: (text) => {
                        return text ? text : '-'
                    }
                },
                {
                    title: "自动确认收货时间",
                    dataIndex: 'day',
                    align: 'center',
                    key: 'day',
                },
                {
                    title: "供应商",
                    dataIndex: 'merchant_name',
                    align: 'center',
                    key: 'merchant_name',
                    render: (text, record) => {
                        const froms = text === 0 ? '企牛采' : '商城';
                        return froms
                    }
                },
                {
                    title: "关联父订单",
                    dataIndex: 'parent_id',
                    align: 'center',
                    key: 'parent_id',
                    render: (text, record) => {
                        return <Link to={{ pathname: `/order/parentOrder/`, search: `?${text}` }}>{text}</Link>
                    }
                },
            ],
            // 表格数据
            basicInfoData: [],
            log: {},                //  订单操作记录
            order_invoice: {},      //  订单发票
            order_state: '',        //  订单状态
            order_goods: {},        //  子订单信息
            order_address: {},      //  收货人信息
            cost_info: {},          //  费用信息
            project: {},            //  项目信息
            remark: '',             //  备注信息
            reason: '',             //  驳回原因
            order_file: '',         //  附件
        }
    }
    //  获取订单详情
    getRefDetails = (details) => {
        // console.log('details', details);
        const { base, log, order_invoice, order_goods, order_address, project, reason, order_file } = details;
        // 从商品信息中提出 费用信息所需字段 --------
        let costInfo = {};
        for (let items in order_goods) {
            if (items.lastIndexOf('tal') > 0) {
                costInfo[items] = order_goods[items]
            }
        }
        // ------------------------------ --------
        this.setState({
            basicInfoData: [{ ...base }],
            order_state: base.state,
            order_invoice: [{ ...order_invoice }],
            order_address: [{ ...order_address }],
            order_goods,
            cost_info: [{ ...costInfo }],
            remark: base.remark,
            project,
            log,
            reason,
            order_file
        })
    }
    // 查看附件
    fileLink=(item)=>{
        const data={
            file_name:item
        };
        api.axiosGet("getProductLookSign",data).then((res)=>{
            // console.log('res', res);
            if(res.status == 200){
                window.open(res.data.url)
            }
        })
    };

    render() {
        const { basicInfoColumns, basicInfoData, log, order_invoice, order_goods, order_address, project, reason, cost_info, remark, order_state, order_file } = this.state;
        // 基础信息头部
        return (
            <div className="reviseGoods-box">
                {/* 驳回原因 */}
                {
                    order_state === -3 ?
                        <div className='tab-box'>
                            <div className="merchant-nums">
                                驳回原因
                            </div>
                            <div className='reject-info-box'>
                                {reason}
                            </div>
                        </div> : ''
                }

                {/* 普通信息 */}
                <div className='tab-box'>
                    <div className="merchant-nums">
                        基础信息
                    </div>
                    <Table
                        dataSource={basicInfoData}
                        columns={basicInfoColumns}
                        bordered
                        pagination={false}
                    // locale= {{emptyText:a}}
                    />
                </div>
                {/* 发票信息 */}
                <InvoiceTable order_invoice={order_invoice} />
                {/* 收货人信息 */}
                <ConsigneeTable order_address={order_address} />
                {/* 商品信息 */}
                <SubGoodsInfoTable order_goods={order_goods} />
                {/* 费用信息 */}
                <CostInfoTable cost_info={cost_info} />
                {/* 备注信息 */}
                <div className='tab-box'>
                    <div className="merchant-nums">
                        备注信息
                    </div>
                    <div className='remark-info-box'>
                        {
                            remark ? remark : '暂无备注信息'
                        }
                    </div>
                </div>
                {/* 项目信息 */}
                {
                    order_state !== 0 && order_state !== -1 && order_state !== -2 ?
                        <div className='tab-box'>
                            <div className="merchant-nums">
                                项目信息
                        </div>
                            <div className='project-info-box'>
                                <div>
                                    <span className='tit'>项目名称：</span>
                                    <span>{project.project_name}</span>
                                </div>
                                <div>
                                    <span className='tit'>项目经理：</span>
                                    <span>{project.project_manager}</span>
                                </div>
                            </div>
                        </div> : ''
                }

                {/* 附件信息 */}
                {
                    order_state !== 0 && order_state !== -1 && order_state !== -2 ?
                        <div className='tab-box'>
                            <div className="merchant-nums">
                                附件信息
                            </div>
                            <div className='enclosure-info-box'>
                                {
                                    order_file && order_file.length > 0 &&
                                    <div>
                                        <div className="appParentOrder-order-file-list">
                                            {order_file.map((item, index) => {
                                                const fileType = item.substring(item.lastIndexOf(".") + 1);
                                                let typeIcon = null;
                                                switch (fileType) {
                                                    case "ppt":
                                                        typeIcon = "img_ppt.png";
                                                        break;
                                                    case "word":
                                                        typeIcon = "img_word.png";
                                                        break;
                                                    case "pdf":
                                                        typeIcon = "img_pdf.png";
                                                        break;
                                                    case "xlsx":
                                                        typeIcon = "img_exl.png";
                                                        break;
                                                    case "xls":
                                                        typeIcon = "img_exl.png";
                                                        break;
                                                    case "doc":
                                                        typeIcon = "img_word.png";
                                                        break;
                                                }
                                                return (
                                                    <div className='file-list' key={index}>
                                                        <div className="file-list-img">
                                                            <span>
                                                                {
                                                                    // typeIcon ? <img src={require(`./../../../image/${typeIcon}`)} alt=""/> : <img src={`${api.imgUrl}${item}`} alt=""/>
                                                                    typeIcon && <img src={require(`./../../../image/${typeIcon}`)} alt="" />
                                                                }
                                                            </span>
                                                        </div>
                                                        <p title={item.substring(item.indexOf("-") + 1)}>
                                                            {item.substring(item.indexOf("-") + 1)}
                                                        </p>
                                                        <a href='javascript:;' onClick={() => { this.fileLink(item) }} >查看</a>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                }
                            </div>
                        </div> : ''
                }

                {/* 操作信息 */}
                <OperationalInfoTable log={log} />
            </div>
        )
    }
}

export default OverviewInfo;