import React from 'react'
import { connect } from 'react-redux'
import { push ,replace } from 'react-router-redux'
import * as action from './action'
import {Form, Input, Button, Icon,Table } from 'antd'
import Monitor from '../../sidebar/user_log'
import Pagination from '../pagination'
import { title } from '../title.js'
import LogForm from '../form'
import { getUrlParams } from 'function'
import { columns,logData } from './data'
const FormItem = Form.Item;
let data = []; 

class camera_debug_last extends React.Component {
	constructor(){
		super(); 
		this.type = null;
	}

	componentDidMount(){
		if(!this.props.camera_debug_last.posts){
			this.getData({ })	
		}
		this.hasMount = true;
		this.type = getUrlParams(this.props.location.pathname)[1];
		//console.log(1)
	}

	getData(params={}){
		let { dispatch,camera_debug_last } = this.props
		dispatch(action.fetchData(params,this.type));	
	}
	
	onPaginationChange(p){
		this.getData({
			p : p
		})	
	}

    render() {
		//console.log(this.props)
		let { camera_debug_last ,location,dispatch } = this.props;
		let { params } = camera_debug_last;
		if(this.hasMount && camera_debug_last.posts && camera_debug_last.posts.logs){
			if(camera_debug_last.posts.logs[0]){
				if( !camera_debug_last.posts.logs[0].key || module.hot){
					data = logData(camera_debug_last);
				}
			}else{
				data = [];
			}
			
		}
        return (
			<Monitor location={location} >
				<h2>{title[this.type]}</h2>
				<br/>
				<LogForm action={action}/>
				
				{
					!camera_debug_last.posts &&
					<Table className="" loading={camera_debug_last.isFetching} size="middle"
						columns={columns} dataSource={[]} pagination={false} bordered/>
				}
				{
					camera_debug_last.posts &&
					<Table className="" loading={camera_debug_last.isFetching} size="middle"
						columns={columns} dataSource={data} pagination={false} bordered/>
				}
				{
					camera_debug_last.posts && camera_debug_last.posts.total_pages > 1 &&
					<Pagination action={action}/>
				}
			</Monitor>
        )
    }
}
/**
 *	组件初始props,过state传递到props
 */
function mapStateToProps(state,props){
	//console.log("camera_debug_last组件初始props",state);
	return {
		
	    camera_debug_last : state.camera_debug_last
	};
}
module.exports = connect(mapStateToProps)(camera_debug_last)
module.exports.component = camera_debug_last;
