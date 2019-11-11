import React from "react";
import {Breadcrumb,Row,Col }  from "antd"
import {Link} from "react-router-dom";
import { Tabs } from 'antd';
import api from './../../../../components/api';
import './../index.scss';
const { TabPane } = Tabs;


export default class AccountInfo extends React.Component{
  constructor(props){
    super(props);
    this.state={
      accountDetail: {}  //  账户详情信息
    }
  }
  // 获取详情
  getDetail = (id) => {
    api.axiosPost('seeMainAccountDetail',{id:id}).then(res => {
      // console.log(res)
      if( res.data.code === 1 ){
        this.setState({
          accountDetail: res.data.data
        })
      }
    })
  }
  componentDidMount(){
    this.getDetail(this.props.accountID)
  }
  componentWillReceiveProps(nextProps){
    this.getDetail(nextProps.accountID)
  }

  render(){
    const { accountDetail } = this.state;
    // console.log('accountDetail',accountDetail);
    return(
      <div className="accountInfo-box">
        <div className="inner-box">
          <div className="margin-bottom-30">
            <div className="common-tit margin-bottom-20">
              账户信息
            </div>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" className="infomation">
              <Col span={8}>
                <span className="titleLine">联系人姓名：</span>
                <span>{accountDetail.contact}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">创建时间：</span>
                <span>{accountDetail.create_time}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">邮箱账户：</span>
                <span>{accountDetail.email}</span>
              </Col>
            </Row>
            <Row className="infomation">
              <Col span={8}>
                <span className="titleLine">联系电话：</span>
                <span>{accountDetail.phone}</span>
              </Col>
            </Row>
          </div>
          
          <div className="margin-bottom-30">
            <div className="common-tit margin-bottom-20">
              公司信息
            </div>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" className="infomation">
              <Col span={8}>
                <span className="titleLine">公司名称：</span>
                <span>{accountDetail.company_name}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">经营范围：</span>
                <span>{accountDetail.scope}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">所在地区：</span>
                <span>{accountDetail.address}</span>
              </Col>
            </Row>
            <Row className="infomation" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" >
              <Col span={8}>
                <span className="titleLine">公司项目：</span>
                <span>{accountDetail.department_num}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">公司类型：</span>
                <span>{accountDetail.company_type}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">联系地址：</span>
                <span>{accountDetail.address_info}</span>
              </Col>
            </Row>
          </div>
          
          <div className="margin-bottom-30">
            <div className="common-tit margin-bottom-20">
              统计信息
            </div>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" className="infomation">
              <Col span={8}>
                <span className="titleLine">授信总额（元）：</span>
                <span>{accountDetail.credit}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">累计订单：</span>
                <span>{accountDetail.order_num}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">可用余额（元）：</span>
                <span>{accountDetail.balance}</span>
              </Col>
            </Row>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} type="flex" justify="space-around" align="middle" className="infomation">
              <Col span={8}>
                <span className="titleLine">累计还款：</span>
                <span>{accountDetail.repayment}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">累计消费：</span>
                <span>{accountDetail.consumption}</span>
              </Col>
              <Col span={8}>
                <span className="titleLine">价格上浮比例：</span>
                <span>{accountDetail.float_scale}</span>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    )
  }
}