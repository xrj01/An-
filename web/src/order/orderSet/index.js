import React from "react";
import { Input, Button, Row, Col, message, Divider, Tag, Icon } from 'antd';
// import { TweenOneGroup } from 'rc-tween-one';
import api from "../../components/api";
import publicFn from './../../components/public';

export default class OrderSet extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            payment: '',      // 付款超时时间 单位 分
            take_delivery: '', // 收货超时时间 单位 天

            tags: [],
            inputVisible: false,
            inputValue: '',
            thirdJur: {},         // 权限
        }
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // 设置订单
    setOrder = () => {
        const { take_delivery, payment } = this.state;
        const param = {
            payment,
            take_delivery
        }

        const reg = /^[1-9]\d*$/;

        if (!payment) {
            message.error('付款超时时间为必填!');
            return;
        }
        if (!take_delivery) {
            message.error('发货超时时间为必填!');
            return;
        }
        if (!reg.test(take_delivery)) {
            message.error('发货超时时间必须为正整数！')
            return;
        } else if (!reg.test(payment)) {
            message.error('付款超时时间必须为正整数！')
            return;
        }
        api.axiosPost('setOrder', param).then(res => {
            if (res.data.code === 1) {
                message.success(res.data.msg)
                // this.setState({
                //     take_delivery: '',
                //     payment      : ''
                // })
            }
        })
    }

    componentDidMount() {
        // 时间回填
        api.axiosPost('checkOrderTime').then(res => {
            if (res.data.code === 1) {
                this.setState({
                    take_delivery: res.data.data.take_delivery,
                    payment: res.data.data.payment,
                })
            }
            
        })
        // 审批原因
        this.getReason();

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    // 获取系统审批原因
    getReason = (rtype=0,content ) => {
        let { tags } = this.state;
        const param = {
            type: rtype,
        }
        if(rtype === 1){ param.content = content}
        api.axiosPost('addApprovalReason', param).then(res=>{
            // console.log('res', res);
            if(res.data.code === 1 && rtype === 0) {
                if(typeof res.data.data === 'string'){
                    message.warning(res.data.data)
                } else {
                    this.setState({
                        tags: res.data.data
                    })
                }
            } else if (res.data.code === 1 && rtype === 1) {
                this.setState({
                    tags: [...tags, res.data.data]
                })
            }
        })
    }

    handleClose = removedTag => {
        api.axiosPost('deleteApprovalReason',{id: removedTag.id}).then(res => {
            if(res.data.code === 1){
                const tags = this.state.tags.filter(tag => tag !== removedTag);
                console.log(tags);
                this.setState({ tags });
            }
        })
        
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.state;
        if (inputValue && tags.length < 3) {
            this.getReason(1,inputValue);
        } 
        if(tags.length >= 3 && inputValue){
            message.error('系统默认原因最多可设置三条,请删除后重新添加！')
        }
        this.setState({
            inputVisible: false,
            inputValue: '',
        });
    };

    saveInputRef = input => (this.input = input);

    forMap = tag => {
        const tagStyle = {
            height: '32px',
            lineHeight: '32px'
        }
        const reasonJur = Object.keys(this.state.thirdJur).length && this.state.thirdJur[32].display;
        const tagElem = (
            <Tag
                closable
                style={{...tagStyle}}
                onClose={e => {
                    e.preventDefault();
                    if(reasonJur){
                        this.handleClose(tag);
                    } else {
                        message.error('暂无权限！')
                    }
                }}
            >
                {tag.content}
            </Tag>
            
        );
        return (
            <span key={tag.id} style={{ display: 'block', marginBottom: 10 }}>
                {tagElem}
            </span>
        );
    };

    render() {
        const { payment, take_delivery, tags, inputValue, inputVisible, thirdJur } = this.state
        const titStyle = {
            width: 120,
            textAlign: 'right',
            display: 'inline-block',
        }
        const btnStyle = {
            marginLeft: '120px'
        }
        const tagStyle = {
            height: '32px',
            lineHeight: '32px'
        }
        // 订单设置的权限
        const orderSetJur = Object.keys(thirdJur).length && !thirdJur[30].display
        // 系统驳回原因的权限
        const reasonJur = Object.keys(thirdJur).length && thirdJur[32].display;

        const tagChild = tags.map(this.forMap);
        return (
            <div>
                <h4 className='h4-title margin-bottom-20'>订单设置</h4>
                <Row className='line-height-30 margin-bottom-20'>
                    <Col span={24}>
                        <span style={titStyle}><i style={{ color: 'red' }}>*</i>正常订单超过：</span>
                        <Input className='width-100' addonAfter='分' disabled={orderSetJur} value={payment} onChange={(e) => { this.handleInputOnchange('payment', e.target.value) }} />
                        &nbsp;
                        &nbsp;
                        未付款，订单自动关闭
                    </Col>
                </Row>
                <Row className='line-height-30 margin-bottom-20'>
                    <Col span={24}>
                        <span style={titStyle}><i style={{ color: 'red' }}>*</i>发货超过：</span>
                        <Input className='width-100' addonAfter='天' disabled={orderSetJur}  value={take_delivery} onChange={(e) => { this.handleInputOnchange('take_delivery', e.target.value) }} />
                        &nbsp;
                        &nbsp;
                        未收货，订单自动完成
                    </Col>
                </Row>
                <Button style={btnStyle} type='primary' disabled={orderSetJur} onClick={this.setOrder}>提交</Button>
                <Divider />
                <h4 className='h4-title margin-bottom-20'>系统驳回原因设置</h4>
                <div style={{display: 'flex'}}>
                    <span style={titStyle}>系统驳回原因：</span>
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            {!reasonJur && <Tag color="red">当前角色无权限查看驳回原因！</Tag>}
                            {tagChild}
                        </div>
                        {inputVisible && (
                            <Input
                                ref={this.saveInputRef}
                                type="text"
                                size="small"
                                style={{ width: 400, height: 32 }}
                                value={inputValue}
                                onChange={this.handleInputChange}
                                onBlur={this.handleInputConfirm}
                                disabled={Object.keys(thirdJur).length && !thirdJur[32].display}
                                onPressEnter={this.handleInputConfirm}
                            />
                        )}
                        {!inputVisible && (
                            <Tag 
                                onClick={
                                    ()=>{
                                        if(reasonJur){
                                            this.showInput();
                                        }else {
                                            message.error('暂无权限！')
                                        }
                                        
                                    }
                                } 
                                style={{ background: '#1890ff', color: '#fff', ...tagStyle }}
                            >
                                <Icon type="plus" />添加驳回原因
                            </Tag>
                        )}
                    </div>
                </div>

            </div>
        )
    }

}