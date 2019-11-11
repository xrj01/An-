import React from "react";
import {Input,Select,Radio,Button,message,Modal,Switch} from "antd";
import api from "./../../components/api";
import "./addModal.scss";
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
            paramKey:["品牌"], //三级分类的属性key
            paramValue:[["其他"]], //三级分类的属性值
            displayAttribute:[true],
            id:"",
            disabledLen:[],
            paramKeyLength:0,
            loading:false
        }
    }

    //数据值改变时执行
    inputChange=(type,value)=>{
        this.setState({
            [type]:value
        })
    };
    hideModal=()=>{
        this.setState({type:0})
        this.props.hideModal("addClassModal",false)
    };
    //点击保存
    save=()=>{
        const {isAdd} = this.props;
        const {level,type,name,is_index_menu,display,parent,paramKey,paramValue,attributeNumber,displayAttribute,id} = this.state;
        const param = [];
        if(paramKey.length && attributeNumber){
            if(paramValue.length !== paramKey.length){
                message.error('属性名或属性值不能为空');
                return;
            }
            param.push({
                "name":paramKey,
                "val":[paramValue],
                "display":displayAttribute
            })
        }
        const data={ level,type,name,is_index_menu,display,parent,param:JSON.stringify(param)};
        if(isAdd == "edit"){data.id = id}
        if(attributeNumber && !param.length || !data.name){
            message.error("分类名称不能为空 或者 属性不能为空");
            return;
        }
        this.setState({loading:true});
        api.axiosPost("productClass",data).then((res)=>{
            if(res.data.code == 1){
                message.success(res.data.msg);
                this.hideModal();
                if(type == 1){
                    this.props.editRefresh(data,"edit");
                }
                if(type == 0){
                    this.props.editRefresh(res.data.data,"add",parent);
                }

            }
            this.setState({loading:false})
        });
    };
    //父级分类数据
    superiorDate=(record)=>{
        let attributeNumber = 0;
        let superiorClassName = "一级分类";
        let level = 1;
        let parent = 1;
        if(record){
            if(record.id > 999){
                attributeNumber = 1
            }
            superiorClassName = record.name;
            level = 10;
            parent = record.id;
        }
        this.setState({
            superiorClassName,
            level,
            parent,
            attributeNumber,
            type:0,
            name:"",
            paramKey:["品牌"],
            paramValue:[["其他"]],
            displayAttribute:[true]
        })
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
        attribute[i] = value;
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
        const {attributeNumber,paramKey,paramValue,displayAttribute,type,disabledLen,paramKeyLength} = this.state;
        const AttributeDom = [];
        for(let i=0;i<attributeNumber;i++){
            let inputDisabled = false;
            if(i == 0 || type == 1 && i < paramKeyLength){
                inputDisabled = true;
            }
            AttributeDom.push(
                <li key={i}>
                    属性名：<Input disabled={inputDisabled} onChange={(e)=>{this.attributeChange("paramKey",e.target.value,i)}} value={paramKey[i]} placeholder="属性名" className='width-100'/> &emsp;&emsp;
                    属性值：
                    <Select
                        mode="tags"
                        value={paramValue[i]}
                        placeholder="输入属性值"
                        className='width-400'
                        onChange={(value)=>{this.attributeChange("paramValue",value,i)}}
                        style={{ width: '100%' }}
                    >
                        {
                            paramValue[i] && paramValue[i].map((item,index)=>{
                                let disabled = false;
                                if(index == 0 && i ==0 || (type == 1 && index < disabledLen[i])){disabled = true}
                                return(
                                    <Option disabled={disabled} key={item}>{item}</Option>
                                )
                            })
                        }

                    </Select>&emsp;&emsp;
                    <Switch disabled={i == 0 ? true : false} checkedChildren="显示" unCheckedChildren="不显" checked={displayAttribute[i]} onChange={(value)=>{this.displayAttribute(value,i)}}/>
                </li>
            )
        }

        return AttributeDom;
    };
    //修改分类数据
    editDate=(record)=>{
        const classId = record.id;
        this.setState({
            level:classId < 100 ? 1 : 2,
            parent:classId < 100 ? classId : classId/100,
            type:1,
            name:record.name,
            is_index_menu:record.is_index_menu ? 1 : 0,
            display:record.display ? 1 : 0,
            id:classId,
            superiorClassName:record.name,
            attributeNumber:classId > 9999 ? 1 : 0
        });
        if(classId < 100){
            return false;
        }
        const data={ id: classId};
        api.axiosPost("productClassGetParam",data).then((res)=>{
            if(res.data.code == 1){
                const param = res.data.data.param ? res.data.data.param : [];
                const disabledLen=[];
                let paramKeyLength = 0;
                param[0] && param[0].val[0] && param[0].val[0].map((val)=>{
                    disabledLen.push(val.length)
                });
                param.length && param.map((item)=>{
                    paramKeyLength = item.name.length;
                    this.setState({
                        paramKey:item.name,
                        paramValue:item.val[0],
                        displayAttribute:item.display,
                        attributeNumber:item.name.length,
                        paramKeyLength
                    })
                });
                if(!param.length){
                    this.setState({
                        paramKey:["品牌"],
                        paramValue:[["其他"]],
                        displayAttribute:[true]
                    })
                }
                this.setState({
                    superiorClassName:res.data.data.parent_name,
                    disabledLen
                })
            }
        })
    };


    render(){
        console.log(this.state.superiorClassName);
        
        const {attributeNumber,loading} = this.state;
        const {isAdd,addLevel} = this.props;
        return(
            <Modal
                visible={this.props.display}
                title={`${isAdd == 'add' ? '新增': '修改'}分类信息`}
                width="800px"
                onOk={this.save}
                maskClosable={false}
                onCancel={this.hideModal}
                footer={[
                    <Button key="back" onClick={this.hideModal}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={this.save}>
                        保存
                    </Button>,
                ]}
            >
                <div className='goods-class-box'>
                    <ul>
                        <li style={{display:addLevel ? "none" : "block"}}>
                            <span>上级分类：</span>
                            {
                                this.state.superiorClassName
                            }
                        </li>
                        <li>
                            <span>分类名称：</span>
                            <Input maxLength={30} value={this.state.name} onChange={(e)=>{this.inputChange("name",e.target.value)}}/>
                        </li>
                        <li>
                            分类显示：
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
                            
                        </li>
                        {
                            attributeNumber ? this.renderAttributeDom() : ''
                        }
                    </ul>
                    <div className="line-height-30 margin-top-10 text-right" key={Math.random()}>
                        <Button onClick={()=>{this.addAttribute("+")}} style={{display: (attributeNumber && attributeNumber < 5) ? "line-block" : "none"}}>添加新属性</Button>
                    </div>
                </div>
            </Modal>
        )
    }

}