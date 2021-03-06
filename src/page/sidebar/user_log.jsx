import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Tabs,Menu, Dropdown, Icon } from 'antd'
import { push,replace } from 'react-router-redux'
import { title_menu } from '../user_log/title.js'
const TabPane = Tabs.TabPane;

class user_log_sidebar extends React.Component {

	constructor(){
		super(); 
	}

	componentDidMount(){
		
	}
	
	menuclick({key}){
		//this.props.dispatch(fetchData(this.props.params,key));
	}

	callback(key) {
		let { dispatch } = this.props;
		//console.debug(key)
		switch(key){
			case 'other':
				dispatch(push('/user_log_query'));
			break;
		}
		this.title_keys.forEach(function(value,k){
			if(value == key){
				dispatch(push('/user_log/' + value));
			}
		})
	}
	
	getUrlKey(route){
		var title_keys = [],title_contents = [];
		if(!this.title_keys){
			for(var key in title_menu){
				title_keys.push(key);	
				title_contents.push(title_menu[key]);	
				if(route.indexOf(key) != -1){
					this.active = key;	
				}
			}
			this.title_keys = title_keys; 
			this.title_contents= title_contents 
		}
	}

    render() {
		var _this = this;
		let route = this.props.location.pathname;
		let active = 'other';
		this.getUrlKey(route);	
		if(this.active){
			active = this.active;
		}
		return (
			<div className="user-log">
				<Tabs defaultActiveKey={active.toString() } 
						onChange={this.callback.bind(this)} type="card">
					<TabPane tab="日志查询" key="other">
						{
							route.indexOf('user_log_query') != -1 &&  this.props.children
						}
					</TabPane>
					{
						_this.title_contents.map(function(data,index){
							var key = _this.title_keys[index]
							var url = '/user_log/'+key;
							return (
								<TabPane tab={data} key={ key }>
									{
										route.indexOf(key) != -1 &&  _this.props.children
									}
								</TabPane>
							)
						})
					}
				</Tabs>
			</div>
        )
    }
}
/**
 *	组件初始props,过state传递到props
 */
function mapStateToProps(state){
	//console.log("Get_camera_info组件初始props",state);
	return {
	};
}
export default connect(mapStateToProps)(user_log_sidebar)
