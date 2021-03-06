import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Userlogin from './user_login'
import Layout from './layout'
import Loading from 'libs/antd/Loading'
class App extends React.Component {

	constructor(){
		super(); 
		this.isLoading = true;
	}

    render() {
		let url = this.props.location.pathname;
		let container 
        console.log("+++++++++++++ user_login",url);
        if(url.indexOf("user_login") === 1){
        	container = <Userlogin/>
        }else{
        	container = <Layout contents={this.props.children || "" } />
        }
       //	container = <Layout contents={this.props.children || "" } />
		if(module.hot){
			if(url.indexOf('r2g') != -1){
				var Layout2 = require('frontend/view/layout/main');
				container = <Layout2 contents={this.props.children || "" } />
			}
		}
		return (
			<div> 
				{container}
			</div>	
		);
    }
}
function mapStateToProps(state){
	//console.debug('组件初始props:',state)
	return {
		current : 'mail',
		theme : 'dark'
	};
}
export default connect(mapStateToProps)(App)

