import React from "react";
import "./index.scss";
import {Input,Select,Radio,Button,message,Modal,Switch} from "antd";
import api from "./../../components/api";
const Option = Select.Option;
export default class GoodsClass extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            level:1,
            type:0,
            name:"",
            is_index_menu:0,
            display:1,
            parent:1,
            superiorClassName:"一级分类", //上级分类名字
            attributeNumber:0,
            param:[],  //三级分类的属性值
            paramKey:[], //三级分类的属性key
            paramValue:[], //三级分类的属性值
            displayAttribute:[true],
            brands:[] //品牌
        }
    }

    //数据值改变时执行
    inputChange=(type,value)=>{
        this.setState({
            [type]:value
        })
    };
    hideModal=()=>{
        this.props.hideModal("addClassModal",false)
    };
    //点击保存
    save=()=>{
        const {level,type,name,is_index_menu,display,parent,paramKey,paramValue,attributeNumber,displayAttribute,brands} = this.state;
        const param = [];
        if(paramKey.length){
            param.push({
                "name":paramKey,
                "val":[paramValue],
                "display":displayAttribute
            })
        }
        if(attributeNumber && !param.length){
            message.error("属性不能为空");
            return;
        }
        const data={ level,type,name,is_index_menu,display,parent,param:JSON.stringify(param)};
        api.axiosPost("productClass",data).then((res)=>{
            if(res.data.code == 1){
                message.success("添加成功");
                this.hideModal();
            }else{
                message.error("失败")
            }
        });
    };
    //父级分类数据
    superiorDate=(record)=>{
        let attributeNumber = 0;
        if(record){
            if(record.id > 999){
                attributeNumber = 1
            }
            this.setState({
                superiorClassName:record.name,
                level:10,
                parent:record.id,
                attributeNumber
            })
        }
        else{
            this.setState({
                level:1,
                superiorClassName:"一级分类",
                parent:1,
                attributeNumber
            })
        }
    };
    //添加属性框
    addAttribute=(type)=>{
        let {attributeNumber,displayAttribute} = this.state;
        if(type == "+"){
            attributeNumber +=1;
            displayAttribute.push(true)
            if(attributeNumber>=5){
                attributeNumber=5;
            }
        }
        this.setState({
            attributeNumber
        })
    };

    //属性框值变化
    attributeChange=(type,value,i)=>{
        let attribute = this.state[type];
        if(i){
            attribute[i] = value;
        }else{
            attribute = value
        }
        this.setState({
            [type]:attribute
        })
    };
    //控制属性是否显示
    displayAttribute=(value,i)=>{
        const {displayAttribute} = this.state;
        displayAttribute[i] = value;
        this.setState({displayAttribute})
    };
    //添加属性框
    renderAttributeDom=()=>{
        const {attributeNumber,paramKey,paramValue,displayAttribute} = this.state;
        const AttributeDom = [];
        for(let i=0;i<attributeNumber;i++){
            AttributeDom.push(
                <li key={i}>
                    属性名：<Input onChange={(e)=>{this.attributeChange("paramKey",e.target.value,i)}} value={paramKey[i]} placeholder="属性名" className='width-100'/> &emsp;&emsp;
                    属性值：
                    <Select
                        mode="tags"
                        value={paramValue[i]}
                        placeholder="输入属性值"
                        className='width-400'
                        onChange={(value)=>{this.attributeChange("paramValue",value,i)}}
                        style={{ width: '100%' }}
                    >

                    </Select>&emsp;&emsp;
                    <Switch checkedChildren="显示" unCheckedChildren="不显" checked={displayAttribute[i]} onChange={(value)=>{this.displayAttribute(value,i)}}/>
                </li>
            )
        }

        return AttributeDom;
    };

    render(){
        const {attributeNumber} = this.state;
        return(
            <Modal
                visible={this.props.display}
                cancelText="取消"
                title="添加分类"
                okText="保存"
                width="800px"
                onOk={this.save}
                maskClosable={false}
                onCancel={this.hideModal}
            >
                <div className='goods-class-box'>
                    <ul>

                        <li>
                            <span>上级分类：</span>
                            {
                                this.state.superiorClassName
                            }
                        </li>
                        <li>
                            <span>分类名称：</span>
                            <Input value={this.state.name} onChange={(e)=>{this.inputChange("name",e.target.value)}}/>
                        </li>
                        <li>
                            是否显示：
                            <Radio.Group onChange={(e)=>{this.inputChange("display",e.target.value)}}
                                         value={this.state.display}>
                                <Radio value={0}>否</Radio>
                                <Radio value={1}>是</Radio>
                            </Radio.Group>
                        </li>
                        <li>
                            是否显示在导航栏目：
                            <Radio.Group
                                onChange={(e)=>{this.inputChange("is_index_menu",e.target.value)}}
                                value={this.state.is_index_menu}>
                                <Radio value={0}>否</Radio>
                                <Radio value={1}>是</Radio>
                            </Radio.Group>  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                            <Button onClick={()=>{this.addAttribute("+")}} style={{display: (attributeNumber && attributeNumber < 5) ? "block" : "none"}}>添加新属性</Button>
                        </li>
                        <li>
                            品牌：
                            <Select
                                mode="tags"
                                value={this.state.brands}
                                placeholder="输入属性值"
                                className='width-400'
                                onChange={(value)=>{this.attributeChange("brands",value)}}
                                style={{ width: '100%' }}
                            >

                            </Select>&emsp;&emsp;
                        </li>
                        {
                            attributeNumber ? this.renderAttributeDom() : ''
                        }
                    </ul>
                </div>
            </Modal>
        )
    }

}