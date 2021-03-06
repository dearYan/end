import React from 'react'
import Component from 'libs/react-libs/Component'
import { Row, Col, Table } from 'antd'
import { connect } from 'react-redux'
import { isEmptyObj, generateMixed } from 'libs/function'
import { fetchMemoryServiceMonitorData, clearData } from './action' 
import { Bar } from './components/Bar'
import { Pie } from 'libs/defined-chart/Pie'
import { Detail } from './components/Detail'
import { LineChar } from './components/LineChar'
import { AREA_BG, THRITY_USER_TOTAL_COLOR,SEVEN_USER_TOTAL_COLOR,MENORY_SERVICE_MONITOR_SEVEN_NORMAL,
	     MENORY_SERVICE_MONITOR_THRITY_NORMAL,MENORY_SERVICE_MONITOR_SEVEN_BG,MENORY_SERVICE_MONITOR_THRITY_BG,
	     MEMORY_SERVICE_MONITOR_HEADER,areaColor } from './components/until'
require('../../../style/css/memory_service_monitor.css')
let IScroll = require('../../libs/iscroll.js')
let imgUrl = require('../../../style/img/background.jpg')

class memoryMonitor extends Component{
	constructor(){
		super(); 
	}

	dataAdapter(){
		var obj = {
			getMaxUserTotal(data){
				var  max = 0,
				     group = data["data"]["groups"];
				for(var i=0;i<group.length;i++){
					var tempObj = group[i];
					if(max<tempObj["total_user"]){
						max = tempObj["total_user"];
					}
				}
				return max;
			},
			getAreatotal(data){
				var area = data["data"]["area_user_count"],
				    total = 0,
				    len = 0,
				    pieArr = [],
				    htlArr = [];
				for(var name in area){
					len ++;
					total = total + area[name];
					htlArr.push(<span className ="memory_service_monitor_city" 
						key={"memory_service_monitor_city_key_"+new Date().getTime()+generateMixed(6)}>{ name + ":"+ area[name] }</span>);
					pieArr.push({
						x : name,
						y : area[name]
					});
				}
				return {
					total : total,
					pieArr : pieArr,
					len : len,
					city : htlArr
				};
			},
			formatData(data,max,svgWidth,sevenHeight,areaLen){
				var tempArra = data["data"]["groups"],
				    returnArr = [],
				    len = tempArra.length,
				    area = data["data"]["area_user_count"],
				    width = (svgWidth-10*(len-1))/len,
				    itemsW = (svgWidth-10*(len-1)-10*areaLen)/len;   

				for(var city in area){
					var cityObj = [],
					    num = 0;

					for(var i=0;i<len;i++){
						if(city == tempArra[i]["area"]){
							var rectH = (sevenHeight/max)*tempArra[i]["total_user"],
							    fill = '',
							    bgfill = MENORY_SERVICE_MONITOR_SEVEN_BG,
							    textY =  0,
							    label = tempArra[i]["group"],
							    innerRectH = 50 - rectH,
							    textY = innerRectH;

		                    if(innerRectH<17){
		                    	textY = 17;
		                    }

		                    if(tempArra[i]["total_user"]>0){
		                    	fill = SEVEN_USER_TOTAL_COLOR;
		                    }else{
		                    	fill = "#fff";
		                    	rectH = 0;
		                    	textY = 50-7;
		                    	innerRectH = 0;
		                    }

		                    if(tempArra[i]["cycle"] === 30){
		                    	bgfill = MENORY_SERVICE_MONITOR_THRITY_BG;
		                    	fill = THRITY_USER_TOTAL_COLOR;
		                    }

		                    var obj = {
								width : itemsW,
								innerRectH : rectH,
								innerRectW : itemsW,
								outRectH : sevenHeight,
								rectX : num*(itemsW+10),
								rectY : innerRectH,
								innerRectX : num*(itemsW+10),
								innerRectY : 0,
								textX :  num*(itemsW+10)+itemsW/2,
								textY : textY-5,
								label : label,
								style : bgfill,
								rectStyle : fill,
								key : 'memory_servece_monitor_seven_total_key_'+ new Date().getTime()+Math.random()
							}

							num ++ ;
							cityObj.push(obj);
						}
					}
					returnArr.push({
						area : city,
						width : (width+10)*num-10,
						obj : cityObj
					})
				}
				return returnArr;
			},
			formatHealth(data,healthWidth,healthHeight,areaLen){

				var date = new Date(data["data"]["timestamp"]*1000).Format("yyyy-MM-dd hh:mm:ss"),
				    group = data["data"]["groups"],
				    area = data["data"]["area_user_count"],
				    len = group.length,
				    returnArr = [],
				    width = (healthWidth - 10*(len-1))/len,
				    itemWidth = (healthWidth - 10*(len-1)-10*areaLen)/len;

				for(var city in area){
					var num = 0,
					    arr = [];

					for(var i=0;i<len;i++){
					    if(city == group[i]["area"]){
							var temp = group[i],
							    style = '',
							    label = '',
							    tempObj = {};
		                    
	                    	if(temp["cycle"] == 30){
	                    		if(temp["total_user"] >0){
									style = THRITY_USER_TOTAL_COLOR;
	
									if(temp["unhealth_user"]>0){
										style = "#BD0808";
									}
									if(temp["subhealth_user"]>0){
										style = "#068216";
									}
								}else{
									style = MENORY_SERVICE_MONITOR_THRITY_BG;
								}
							}

							if(temp["cycle"] == 7){
								if(temp["total_user"] >0){
									style = SEVEN_USER_TOTAL_COLOR;

									if(temp["unhealth_user"]>0){
										style = "#BD0808";
									}
									if(temp["subhealth_user"]>0){
										style = "#068216";
									}
								}else{
									style = MENORY_SERVICE_MONITOR_SEVEN_BG;
								}
							}

		                    label = temp["group"];
							tempObj = {
								width : itemWidth,
								height : healthHeight,
								x : (itemWidth+10)*num,
								y : 0,
								label : label,
								labelX : (itemWidth+10)*num+itemWidth/2,
								RectStyle : style
							}
							num ++;
							arr.push(tempObj);
						}
					}

					returnArr.push({
						area : city,
						obj : arr,
						width : (width+10)*num-10
					})
				}
                
				return {
					date : date,
					returnArr : returnArr
				};

			},
			formatDisk(data,diskWidth,diskHeight,areaLen){
				var date = new Date(data["data"]["timestamp"]*1000).Format("yyyy-MM-dd hh:mm:ss"),
				    group = data["data"]["groups"],
				    area = data["data"]["area_user_count"],
				    groupLen = group.length,
				    returnArr = [],
				    max = 0,
				    rate = 0,
				    width = (diskWidth - 10*(groupLen-1))/groupLen,
				    itemWidth = (diskWidth - 10*(groupLen-1)-10*areaLen)/groupLen;

				 for(var j=0;j<groupLen;j++){
				 	 if(group[j]["total_user"]>max){
				 	 	max = group[j]["total_user"]
				 	 } 
				 }
				 rate = diskHeight/max;

				 for(var city in area){
				 	 var num = 0,
				 	     obj = [];

				 	 for(var i=0;i<groupLen;i++){
				 	 	 var  tempArr = [];
				 	 	 if(city == group[i]["area"]){
				 	 	 	 var diskArr = group[i]["disc"],
						 	     innerWidth = itemWidth/diskArr.length,
						 	     innerHeight = rate*group[i]["total_user"],
						 	     temp = {},
						 	     fillBg = MENORY_SERVICE_MONITOR_SEVEN_BG,
						 	     fill = '';

						 	 if(group[i]["cycle"] == 30){
						 	 	fillBg = MENORY_SERVICE_MONITOR_THRITY_BG;
						 	 }

						 	 tempArr.push({
		                    	width : itemWidth,
		                    	height : diskHeight,
		                    	x : (itemWidth+10)*num,
		                    	y : 0,
		                    	fill : fillBg
		                    });
                            
						 	for(var k=0;k<diskArr.length;k++){
						 		var itemArr = diskArr[k],
						 		    itemX = innerWidth*k,
						 		    itemY = diskHeight-innerHeight;
						 		if(itemArr.length){
						 			fill = "#BD0808";
						 			this.errorData.push({
										area : city,
										key : 'memory_servcie_monitor_error_table_key_'+new Date().getTime()+generateMixed(6),
										date : data["data"]["timestamp"],
										group_id : group[i]["group_id"],
										cycle : group[i]["cycle"],
										cid : itemArr.join(",")
									});
					 				
						 		}else{
						 			fill = MENORY_SERVICE_MONITOR_SEVEN_NORMAL;
						 			if(group[i]["cycle"] == 30){
						 				fill = MENORY_SERVICE_MONITOR_THRITY_NORMAL;
						 			}
						 			
						 		}
		                        tempArr.push({
		                        	width : innerWidth,
		                        	height : innerHeight,
		                        	x : (itemWidth+10)*num + innerWidth*k,
		                        	y : diskHeight-innerHeight,
		                        	fill : fill,
		                        });
						 	}
						 	num ++ ;
						 	obj.push({
						 		arr : tempArr,
						 		date : data["data"]["timestamp"],
						 		groupId : group[i]["group_id"]
						 	});
				 	    }
				 	    
				 	 }

				 	 returnArr.push({
				 	 	area : city,
				 	 	obj : obj,
				 	 	width : (width+10)*num-10
				 	 })
				 	 
				 }
				 return {
				 	date : date,
				 	returnArr : returnArr
				 }
			},
			formatCity(data,width,rate){
				var area = data["data"]["area_user_count"],
				    obj = [],
				    returnArr = [],
				    group = data["data"]["groups"],
				    len = group.length,
				    everyWidth = (width-10*(len-1))/len;
                
				for(var name in area){
					var total  = 0;
					for(var i=0;i<len;i++){
						if(name === group[i]["area"]){
							total ++;
						}
					}
					obj.push({
						area : name,
						total : total
					});
				}

                for(var j=0;j<obj.length;j++){
                	var wid = obj[j]["total"] * (everyWidth+10) -10,
                	    bg = AREA_BG[0];

                	if(j%2 == 0){
                		bg = AREA_BG[1];
                	}
                	returnArr.push(<div key={'memory_service_monitor_city_item_key_'+new Date().getTime()+generateMixed(6)} 
                		style = {{width:(wid/width)*100+"%",background:bg,marginRight:rate+"%"}} className="memory_service_monitor_city_item">{ obj[j]["area"] }</div>)
                }
                return returnArr;
			},
			initRender(){
				if(this.diskData.length>10){
		        	var deleteArr = this.diskData[this.diskData.length-1],
		        	    Arr = deleteArr["returnArr"],
		        	    tempError = [],
		        	    tableArr = [];
		        	this.diskData.pop();

		        	for(var q = 0;q<Arr.length;q++){
		        		var tempArr = Arr[q]["obj"];
		        		for(var k = 0;k<tempArr.length;k++){
		        			var groupId = tempArr[k]["groupId"];
		        			var tempDate = tempArr[k]["date"];
		        			for(var j=0;j<this.errorData.length;j++){
		        				if(groupId === this.errorData[j]["group_id"] && tempDate === this.errorData[j]["date"]){
		        					tableArr.push(this.errorData[j])
		        				}
		        			}
		        		}
		        	}

		        	for(var k=0;k<this.errorData.length;k++){
		        	    var isAdd = true;
		        		for(var i=0;i<tableArr.length;i++){
		        			var deleteG = tableArr[i]["group_id"],
		        		        tempDate = tableArr[i]["date"];
		        		    isAdd = true;
		        		    if(this.errorData[k]["group_id"] == deleteG && this.errorData[k]["date"] == tempDate){
		        		    	isAdd = false;
			    				break;
			    			}
		        		}
		        		if(isAdd){
		        			tempError.push(this.errorData[k]);
		        		}
		    		}
		    		this.errorData = tempError;
		        }
			}
		};
		return obj;
	}

	events(){

		var obj = {
			showTips(data, position){
				return data+":"+position;
			},
			colorScale(){
				return areaColor(arguments[0])
			}
		}
		return obj;
	}

	componentDidMount(){
		const { memoryServiceData, dispatch } = this.props;

		dispatch(fetchMemoryServiceMonitorData());
		this.clearInt = setInterval(function(){
			dispatch(fetchMemoryServiceMonitorData());
		},30*1000)
	}

    componentWillMount(){
       var contentWith = window.document.body.offsetWidth - 280;
    	this.diskData = [];
		this.totalCity = [];
		this.errorData = [];
		this.healthWidth = contentWith*0.9166666667;
		this.pieWidth = contentWith*0.9166666667*0.2083333333;
		this.lineWidth = contentWith*0.9166666667*0.7916666667;
		this.myScroll = null;
		clearInterval(this.clearInt);
		//dispatch(fetchMemoryServiceMonitorData());
    }

	shouldComponentUpdate(nextProps,nextState){
		var memoryMonitorData = nextProps.memoryServiceData;
		if(memoryMonitorData["data"] === undefined){
			return false;
		}
		return true;
	}
    
    componentDidUpdate(){
    	if(this.myScroll == null){
    		this.myScroll = new IScroll('#memory_service_monitor_iscroll', { mouseWheel: true });
    	}
    	this.myScroll.refresh();
    	var windowH = window.document.body.scrollHeight - 50;
    	document.getElementById("memory_service_monitor_content_container").style.height = windowH+"px"

    }

    componentWillUnmount(){
    	const { memoryServiceData, dispatch } = this.props;
    	this.diskData = [];
		this.totalCity = [];
		this.errorData = [];
		dispatch(clearData());
    }

	render(){
		const { memoryServiceData } = this.props;

		if(isEmptyObj(memoryServiceData["data"])){		
			return false;
		}

		let max = this.getMaxUserTotal(memoryServiceData),
		    sevenHeight = 50,
		    healthArr = [],
		    diskArr = [],
		    rate = (10/this.healthWidth)*100,
		    cityTitle = this.formatCity(memoryServiceData,this.healthWidth,rate),
		    totalObj = this.getAreatotal(memoryServiceData),
		    pieData = {
	            label: 'area_pie',
	            values: totalObj["pieArr"]
	        },
		    diskTotal = this.formatData(memoryServiceData,max,this.healthWidth,sevenHeight,totalObj["len"]),
		    disk = this.formatDisk(memoryServiceData,this.healthWidth,24,totalObj["len"]);
         
        if(this.diskData.length){
        	if(new Date(memoryServiceData["data"]["timestamp"]*1000).Format("yyyy-MM-dd hh:mm:ss") === this.diskData[0]["date"]){
        	}else{
        		 this.diskData.unshift(disk);
        	}
        }else{
        	this.diskData.unshift(disk);
        }
       
        this.initRender();

        var area = memoryServiceData["data"]["area_user_count"];
    	for(var name in area){

    		 if( this.totalCity[name] === undefined){
    		 	this.totalCity[name] = []
    		 }

    		if(this.totalCity[name].length>119){
    			this.totalCity[name].shift();
	    		for(var i=0;i<this.totalCity[name].length;i++){
	    			this.totalCity[name][i]["x"]--;
	    		}
	        }
    		
    		this.totalCity[name].push({
        		x : this.totalCity[name].length,
        		y : area[name]
        	});
    	}

        for(var j=0;j<this.diskData.length;j++){
        	var padding = '0 5px 5px 5px';
        	var colorPadding = '0 0 0 0';
	        diskArr.push(<Detail key={'memory_service_monitor_disk_key_'+new Date().getTime()+generateMixed(6)}
	        	healthData = { this.diskData[j] } rate = { rate } colorPadding = { colorPadding } padding = { padding } style = { "memory_service_monitor_disk" } healthWidth = { this.healthWidth } healthHeight = { 24 } type = { 'memory_service_monitor_disk' }/>);
        }

		return <div style = {{background:'url('+imgUrl+') repeat',margin:'-20px -40px',height : window.document.body.scrollHeight-50+"px"}} id = {"memory_service_monitor_content_container"}>
		    <div className = "memony_service_monitor_container">
				<Row>
			        <Col span="24" className = "memory_service_monitor_fontSize">存储健康状态监控</Col>
			        <Col span="24" className = "memory_service_monitor_total">
			            <Col span="16">总:{totalObj["total"]}{totalObj["city"] }</Col>
			            <Col span="8" className = "memory_service_monitor_color_desc">
			                <div className = "memory_service_monitor_stroage_type">
			                     <span className="memory_service_monitor_stroage_seven"></span>
			                     <span className="memory_service_monitor_stroage_desc">七日存储</span>
			                </div>
			                <div className = "memory_service_monitor_stroage_type">
			                     <span className="memory_service_monitor_stroage_thrity"></span>
			                     <span className="memory_service_monitor_stroage_desc">三十日存储</span>
			                </div>
			            </Col>
			        </Col>
			    </Row>
			    <Row style = {{marginBottom:"40px",height:"180px"}}>
			        <Col span="2" className = "memory_service_monitor_textHide">12</Col>
			        <Col span="22">
			             <Col span="5">
			                 <Pie 
			                     width = { 180 } 
			                     height = { 180 } 
			                     data = { pieData } 
			                     tooltipHtml = { this.showTips } 
			                     viewBox = { "0,0,180,180" }
			                     colorScale = { this.colorScale }
			                     className = { "memory_service_monitor_pie_shadow" }
			                     style = {{ width:'180px',height:'180px' }}/>
			             </Col>
			             <Col span="19" style = {{height:'180px'}}>
			                 <div style = {{marginTop:"20px"}} className = "memory_servcie_monitor_linechart_shadow">
			                    <LineChar width = { this.lineWidth } data = { this.totalCity } viewBox = { "0,0,180,180" }/>
			                 </div>
			             </Col>
			        </Col>
			    </Row>
			    <Row>
			        <Col span="2" className = "memory_service_monitor_textHide">12</Col>
			        <Col span="22">{ cityTitle }</Col>
			    </Row>
			    <Row>
			        <Col span="2" className = "memory_service_monitor_seven">磁盘存储</Col>
			        <Col span="22"><Bar width = { this.healthWidth } sevenData = { diskTotal } height = { sevenHeight } rate = { rate }/></Col>
			    </Row>
			    <div className = "memory_service_monitor_margin">
			         { diskArr }
			    </div>
			    <Row>
			        <Col span="2" className = "memory_service_monitor_seven">错误情况</Col>
			        <Col span="22">
			            <div id="memory_service_monitor_iscroll">
			                 <Table columns = { MEMORY_SERVICE_MONITOR_HEADER } dataSource={ this.errorData } pagination={false}  bordered/>
			            </div>
			        </Col>
			    </Row>
			</div>
        </div>
	}
}

function mapStateToProps(state){
	console.log("=================init state:");
	return {
	    memoryServiceData : state.memory_service_monitor
	};
}
module.exports = connect(mapStateToProps)(memoryMonitor)