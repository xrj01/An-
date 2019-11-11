import React from "react";
import {Row,Col,Statistic} from "antd";
import {Link} from "react-router-dom";
import './home.scss';
import api from "../components/api";

export default class Home extends React.PureComponent {
    constructor(props) {

        console.log(props)
        super(props);
        this.state = {
            total: {}, //所有数据统计集合
        }
    }
    componentDidMount(){
        api.axiosPost('homeStatistics').then(res=>{
            // console.log('res', res);
            if(res.data.code === 1) {
                this.setState({
                    total: res.data.data
                })
            }
        })
    }

    render(){
        const {total} = this.state;
        return(
            <div className="home-page-box">
                <h4 className='h4-title'>系统首页</h4>
                <Row className="line-height-30 margin-bottom-10">
                    <Col span={24}>
                        <div className="innerbox totalOrdersNum">
                            <Statistic title="累计订单总数" value={total.all} />
                        </div>
                        <div className="innerbox totalSales">
                            <Statistic title="累计销售总数" value={total.total} prefix="￥" />
                        </div>
                        <div className="innerbox totalMerchants">
                            <Statistic title="商家总数" value={total.merchants_num} />
                        </div>
                        <div className="innerbox totalAccount">
                            <Statistic title="企业账户总数" value={total.member_num} />
                        </div>
                    </Col>
                </Row>
                <div className="card-box margin-bottom-10">
                    <div className="card-tit">
                        待处理事物
                    </div>
                    <div className="card-container">
                        <Row gutter={32}>
                            <Col span={12}>
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">待付款订单</a></span>
                                    <span className="task-num">(<i>{total.order_num1}</i>)</span>
                                </div>
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">待发货订单</a></span>
                                    <span className="task-num">(<i>{total.order_num2}</i>)</span>
                                </div>
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">已发货订单</a></span>
                                    <span className="task-num">(<i>{total.order_num3}</i>)</span>
                                </div>
                                
                            </Col>
                            <Col span={12} >
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">已完成订单</a></span>
                                    <span className="task-num">(<i>{total.order_num4}</i>)</span>
                                </div>
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">待支付京东订单</a></span>
                                    <span className="task-num">(<i>{total.order_jd}</i>)</span>
                                </div>
                                <div className="task-line">
                                    <span className="task-tit"><a href="javascript:;">待处理商家审核</a></span>
                                    <span className="task-num">(<i>{total.merchants_num_jo}</i>)</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="card-box margin-bottom-10">
                    <div className="card-tit">
                        快捷入口
                    </div>
                    <div className="card-container">
                        <div className="Shortcut ">
                            <div>
                                <Link to='/user'><i className="iconfont icon-shangjialiebiao"></i></Link>
                                <div>商家列表</div>
                            </div>
                            <div>
                                <Link to='/order'><i className="iconfont icon-cainiaoicondingdan"></i></Link>
                                <div>平台订单</div>
                            </div>
                            <div>
                                <Link to='/order/JDOrder'><i className="iconfont icon-jingdongdingdan"></i></Link>
                                <div>京东订单</div>
                            </div>
                            <div>
                                <Link to='/permissions'><i className="iconfont icon-shangjiaguanli"></i></Link>
                                <div>商家管理</div>
                            </div>
                            <div>
                                <Link to='/user/account'><i className="iconfont icon-zhanghuguanli"></i></Link>
                                <div>企业账户管理</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-box margin-bottom-10">
                    <div className="card-tit">
                        商品总览
                    </div>
                    <div className="card-container">
                        <div className="overview">
                            <div>
                                <div className="num">{total.goods_num2}</div>
                                <div className="tit">已下架</div>
                            </div>
                            <div>
                                <div className="num">{total.goods_num3}</div>
                                <div className="tit">已上架</div>
                            </div>
                            <div>
                                <div className="num">{total.goods_num1}</div>
                                <div className="tit">待上架</div>
                            </div>
                            <div>
                                <div className="num">{total.goods_num_all}</div>
                                <div className="tit">全部商品</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}