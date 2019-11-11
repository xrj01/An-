import React from "react";
import { Breadcrumb, Row, Col, Descriptions, message, Button, Modal } from "antd"
import { Link } from "react-router-dom";
import './index.scss';
import api from "../../../components/api";
import Public from "../../../components/public";
import { Object } from "core-js";



export default class BusinessInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            approvalStatus: '',
            data: {},
            id: '',
            basic_info: {},
            total_product: {},
            shop: {},
            previewVisible: false,
            imgIndex: 10,           // 图片索引
        }
    }

    componentWillMount() {
        const id = this.props.match.params.id;
        // 拆分数据结构
        api.axiosPost('businessInfo', { id: id }).then((res) => {
            const { data } = res.data;
            if (!data) {
                return;
            }
            let keys = Object.keys(data);
            let total_product = {}, basic_info = {}, shop = {};
            for (let key of keys) {
                if (key == 'total_product') {
                    total_product = data[key];
                } else if (key == 'shop') {
                    shop = data[key]
                } else {
                    basic_info[key] = data[key]
                }
            }
            if (res.data.code === 1) {
                this.setState({
                    data: data,
                    id: id,
                    basic_info,
                    total_product,
                    shop
                })
            } else {
                message.error(res.data.msg)
            }
        })
    }

    // 处理弹窗关闭
    handleModalShow = (e, istrue, $index) => {

        if (!e.target.hasAttribute('data-error') ||  istrue) {
            this.setState({
                previewVisible: istrue,
                imgIndex: $index
            })
        }
    }
    // 图片404
    imgError = (e) => {
        e.target.src= require('../../../image/404.jpg');
        e.target.setAttribute('data-error', true)
        e.target.onerror = null;
    }
    render() {
        const { data, basic_info, total_product, shop, previewVisible, imgIndex } = this.state;
        return (
            <div className="businessInfo-box">
                <Breadcrumb separator=">" className="margin-bottom-20">
                    <Breadcrumb.Item href="/">首页</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/user">商家列表</Breadcrumb.Item>
                    <Breadcrumb.Item>商家信息</Breadcrumb.Item>
                </Breadcrumb>
                <div className="inner-box">
                    <h4 className="h4-title">商家详情</h4>
                    <div className="common-tit margin-bottom-20">
                        商家信息<span className="approvalStatus">{data.state}{data.state == '已驳回'?`(${data.audit_reason})` : ''}</span>
                    </div>
                    <div className="detailed-info margin-bottom-30">
                        <Row>
                            <Col span={3} offset={1}>
                                <div className="business-Img">
                                    <img src={Public.imgUrl(this.state.id, this.state.id, 9, 130, 'merchant')} onError={this.imgError} alt="" />
                                </div>
                            </Col>
                            <Col span={18}>
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" className="basics-info">
                                    <Col span={12}>
                                        <span className="titleLine">公司名称:</span>
                                        <span>{basic_info.company}</span>
                                    </Col>
                                    <Col span={12}>
                                        <span className="titleLine">联系人电话:</span>
                                        <span>{basic_info.contacterPhone}</span>
                                    </Col>
                                </Row>
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="basics-info">
                                    <Col span={12}>
                                        <span className="titleLine">联系人姓名:</span>
                                        <span>{basic_info.contacter}</span>
                                    </Col>
                                    <Col span={12}>
                                        <span className="titleLine">公司地址:</span>
                                        <span>{basic_info.address}</span>
                                    </Col>
                                </Row>
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="basics-info">
                                    <Col span={12}>
                                        <span className="titleLine">注册时间:</span>
                                        <span>{basic_info.regist_time}</span>
                                    </Col>
                                    <Col span={12}>
                                        <span className="titleLine">经纬度:</span>
                                        <span>{basic_info.coordinates}</span>
                                    </Col>
                                </Row>
                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="basics-info">
                                    <Col span={12}>
                                        <span className="titleLine">商家简介:</span>
                                        <span>{basic_info.introduce}</span>
                                    </Col>
                                </Row>
                                {
                                    data.state === '不通过' ?
                                        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} className="basics-info">
                                            <Col span={12}>
                                                <span className="titleLine">驳回原因:</span>
                                                <span>{basic_info.audit_reason}</span>
                                            </Col>
                                        </Row> : ''
                                }
                            </Col>
                        </Row>
                    </div>
                    <div className="storeStatistics">
                        <div className="common-tit margin-bottom-20">
                            店铺统计
            </div>
                        <Row>
                            <Col span={16} offset={1}>
                                <Descriptions column={{ xs: 3, sm: 3, md: 3 }}>
                                    <Descriptions.Item label="被关注数">{shop.follow}</Descriptions.Item>
                                    <Descriptions.Item label="本月销量">{shop.sales}</Descriptions.Item>
                                    <Descriptions.Item label="本月销售额">{shop.sales_price}</Descriptions.Item>
                                    <Descriptions.Item label="累计浏览">{shop.browse}</Descriptions.Item>
                                    <Descriptions.Item label="累计销量">{shop.sales_volume}</Descriptions.Item>
                                    <Descriptions.Item label="累计销售额">{shop.cumulative_sales}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </div>
                    <div className="goodStatistics">
                        <div className="common-tit margin-bottom-20">
                            商品统计
            </div>
                        <Row>
                            <Col span={19} offset={1}>
                                <Descriptions column={{ xs: 3, sm: 3, md: 4 }}>
                                    <Descriptions.Item label="全部商品">{total_product.whole}</Descriptions.Item>
                                    <Descriptions.Item label="已上架">{total_product.upper_shelf}</Descriptions.Item>
                                    <Descriptions.Item label="待上架">{total_product.stay_on_the_shelf}</Descriptions.Item>
                                    <Descriptions.Item label="已下架">{total_product.lower_shelf}</Descriptions.Item>
                                    <Descriptions.Item label="已卖出">{total_product.selled}</Descriptions.Item>

                                </Descriptions>
                            </Col>
                        </Row>
                    </div>
                    <div className="businessLicense">
                        <div className="common-tit margin-bottom-20">
                            营业执照
            </div>
                        <Row className="margin-bottom-30">
                            <Col span={23} offset={1}>
                                <Descriptions column={{ xs: 2, sm: 2, md: 2 }}>
                                    <Descriptions.Item label="公司名称">{basic_info.company}</Descriptions.Item>
                                    <Descriptions.Item label="法定代表人姓名">{basic_info.represent_name}</Descriptions.Item>
                                    <Descriptions.Item label="营业执照注册地址" span={2}>{basic_info.address}</Descriptions.Item>
                                    <Descriptions.Item label="成立日期">{basic_info.set_up_time}</Descriptions.Item>
                                    <Descriptions.Item label="统一社会信用代码">{basic_info.unified_social_credit_code}</Descriptions.Item>
                                    <Descriptions.Item label="营业执照有限期">{basic_info.license_time_begin}&emsp;——&emsp;{basic_info.license_time_type == 1 ? '长期' : basic_info.license_time_end}</Descriptions.Item>
                                    <Descriptions.Item label="注册资本（万元）">{basic_info.registered_capital}</Descriptions.Item>
                                    <Descriptions.Item label="经营范围" span={2}>{basic_info.business_scope}</Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                        <div className="license-show clearfix">
                            <div className="show-box IDElectronic">
                                <span>法人代表身份证电子版</span>
                                <div>
                                    <img 
                                        src={Public.imgUrl(this.state.id, this.state.id, 1, 290, 'merchant')} 
                                        alt="" 
                                        onClick={(e)=>{this.handleModalShow( e, true, 1)}}
                                        onError={this.imgError}
                                    />
                                </div>
                                <div>
                                    <img 
                                        src={Public.imgUrl(this.state.id, this.state.id, 2, 290, 'merchant')} 
                                        alt="" 
                                        onClick={(e)=>{this.handleModalShow( e, true, 2)}}
                                        onError={this.imgError}
                                    />
                                </div>
                            </div>
                            <div className="show-box businessElectronic">
                                <span>营业执照电子版</span>
                                <div>
                                    <img 
                                        src={Public.imgUrl(this.state.id, this.state.id, 0, 290, 'merchant')} 
                                        alt="" 
                                        onClick={(e)=>{this.handleModalShow( e, true, 0)}}
                                        onError={this.imgError}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Row type="flex" justify="center">
                    <Col span={2}>
                        <Button type="primary" onClick={() => { this.props.history.goBack() }}>返回</Button>
                    </Col>
                </Row>

                <Modal visible={previewVisible} footer={null} onCancel={(e)=>{this.handleModalShow(e, false, 10)}}>
                    <img alt="example" style={{ width: '100%' }} src={Public.imgUrl(this.state.id, this.state.id, imgIndex, 1000, 'merchant')} />
                </Modal>
            </div>
        )
    }
}