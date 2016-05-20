import React from 'react'
import { Form, Button, Modal, Select, Input, Row } from 'antd'
import { ENTERPRISE_MANAGER_TABLE_BACK_DAILOG } from './until'
import { enterpriseManagerAprovalDailog, enterpriseManagerAprovalAgreeFetch } from '../action'
import { generateMixed, isEmptyObj } from 'libs/function'
const createForm = Form.create;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;
const formItemLayout = {
     labelCol: { span: 6 },
     wrapperCol: { span: 14 },
};
let AddBackForm = React.createClass({
    getInitialState(){
        return {
            alloc_type : 1
        }
    },

    componentWillReceiveProps(nextProps){
        const { resetFields } = this.props.form;
        const { dailog_data } = nextProps;
        if(!isEmptyObj(dailog_data)){
            if(!dailog_data["visible"]["hidden"]){
                 resetFields();
            }
        }
    },

    handleChanageId(e){
        this.setState({
            alloc_type : e
        })
    },

    cancelBtn(){
        const { dispatch } = this.props;
        dispatch(enterpriseManagerAprovalDailog({
            hidden : false 
        },{}));
        this.setState({
            alloc_type : 1
        });
    },
    
    validatorStartStr(rule, value, callback){
        if(value){
            var exp=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/; 
            console.log("value",value);
            if(exp.test(value)){
                callback();
            }else{
                callback('请输入正确的IP地址！');
            }
        }else{
            callback("");
        }
    },

    validatorStart(rule, value, callback){
        if(value){
            if(/^\d+$/.test(value)){
                callback();
            }else{
                callback("起始段字符必须为整数！");
            }
        }else{
            callback("");
        }
    },

    validatorEnd(rule, value, callback){
        const { getFieldValue } = this.props.form;
        if(value){
            if (/^\d+$/.test(value)) {
                if(parseInt(getFieldValue("start"))>parseInt(value)){
                    callback("结束值必须大于开始值");
                }else{
                    callback();
                }
            }else{
                callback("ID段结束值必须为整数！");
            }
        }else{
            callback("");
        }
    },

    handleSubmit(e){
         e.preventDefault();
        const { dispatch, dailog_data } = this.props;
        this.props.form.validateFields((errors, values) => {
             if (!!errors) {
                 console.log('Errors in form!!!');
                 return;
             }

             var id = dailog_data["json"]["id"],
                 data = {};
             if(values["alloc_type"] === 1){
                 data["start_str"] = values["start_str"];
                 data["mask_str"] = values["mask_str"];
             }else{
                 data["start"] = parseInt(values["start"]);
                 data["end"] = parseInt(values["end"]);
             }
             dispatch(enterpriseManagerAprovalAgreeFetch({
                 id : id,
                 type : values["type"],
                 alloc_type : values["alloc_type"],
                 data : data
             }));
             this.setState({
                alloc_type : 1
             });
        });
    },

    render(){
        const { getFieldProps } = this.props.form;
        var htlArr = [];

        if(this.state.alloc_type === 1){
            htlArr = <div>
                <FormItem
                     {...formItemLayout}
                     hasFeedback
                     label="ID段起始字符：">
                     <Input { ...getFieldProps('start_str',{
                        rules: [
                            { 
                                 required: true, 
                                 whitespace: true, 
                                 message: '起始字符不能为空' 
                            },{ 
                                 validator: this.validatorStartStr
                            }
                        ]}) } placeholder="请输入起始段字符" />
                </FormItem>
                <FormItem
                     {...formItemLayout}
                     label="ID段的分配掩码：">
                     <Select 
                         { ...getFieldProps('mask_str',{
                                 initialValue : "255.0.0.0"
                             })
                         }
                         style={{ width: "284px" }}>
                         <Option value= "255.0.0.0">A类</Option>
                         <Option value= "255.255.0.0">B类</Option>
                         <Option value= "255.255.255.0">C类</Option>
                     </Select>
                </FormItem>
            </div>
        }else{
            htlArr = <div>
                <FormItem
                     { ...formItemLayout }
                     hasFeedback
                     label="ID 段开始值：">
                     <Input { ...getFieldProps('start',{
                         rules: [
                            {   
                                required: true, 
                                whitespace: true, 
                                message: 'ID段开始值不为空' 
                            },
                            { validator: this.validatorStart }
                        ]
                     }) } placeholder="请输入起始段字符" />
                </FormItem>
                <FormItem
                     { ...formItemLayout }
                     hasFeedback
                     label="ID 段结束值：">
                     <Input { ...getFieldProps('end',{
                         rules: [
                            { 
                                 required: true,
                                 whitespace: true,  
                                 message: 'ID段结束值不为空'
                            },
                            { validator: this.validatorEnd }
                         ]
                     }) } placeholder="请输入起始段字符" />
                </FormItem>
            </div>
        }
        
        return (
            <Form horizontal form={this.props.form}>
                <FormItem
                     {...formItemLayout}
                     label="ID段类型：">
                     <Select 
                         { ...getFieldProps('type',{
                                initialValue : 1
                            }) 
                         }
                         style={{ width: "284px" }}>
                         <Option value={ 1 }>摄像头</Option>
                         <Option value={ 2 }>用户</Option>
                     </Select>
                </FormItem>
                <FormItem
                     {...formItemLayout}
                     label="分配ID段的类型：">
                     <Select 
                         { ...getFieldProps('alloc_type',{
                                initialValue : this.state.alloc_type
                            }) 
                         }
                         style={{ width: "284px" }} onChange = { this.handleChanageId }>
                         <Option value= { 1 }>IP掩码方式</Option>
                         <Option value={ 2 }>起始点方式</Option>
                     </Select>
                </FormItem>
                { htlArr }
                <Row type="flex" justify="end">
                    <Button type="primary" className="enterprise_manager_back_dailog_btn cancel" onClick={this.cancelBtn}>取消</Button>
                    <Button type="primary" className="enterprise_manager_back_dailog_btn" onClick={this.handleSubmit}>确定</Button>
                </Row>
            </Form>
        )
    }
});
AddBackForm = createForm()(AddBackForm);

export const Dailog = React.createClass({
    getInitialState() {
        return { 
            visible: false,
        }
    },

    componentWillReceiveProps(nextProps){
    	const { dailog_data } = nextProps;
        if(!isEmptyObj(dailog_data)){
            this.setState({
                 visible: dailog_data["visible"]["hidden"]
            });
        }
    },

    handleOk(){
    	this.setState({
		     visible: false
		});
    },

    handleCancel(){
        const { dispatch } = this.props;
    	this.setState({
		     visible: false
		});
        dispatch(enterpriseManagerAprovalDailog({
            hidden : false 
        },{}));
    }, 

    render(){
    	return (
            <Modal title="新增黑名单" 
                 className = "enterprise_manager_back_dailog"
                 visible={this.state.visible}
	             onOk={this.handleOk} 
	             onCancel={this.handleCancel} >
	             <AddBackForm { ...this.props }/>
	        </Modal>
    	)
    }
})