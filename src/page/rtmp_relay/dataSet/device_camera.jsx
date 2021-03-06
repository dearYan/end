//import React from 'react'
import * as fn from 'function'

let column_dataIndexs = [ 
	'app_name',
	'camera_all',
	'camera_new',
	'camera_online',
	'private_camera_online',
	'store_camera_online',
	'public_camera_online',
	'public_store_camera_online',
]
export let columns = [
	{
		title: '厂商',
		className:'first_td',
	}, 
	{
		title: '摄像机数',
	}, 
	{
		title: '新增摄像机数',
	}, 
	{
		title: '在线摄像机数',
	}, 
	{
		title: '私有摄像机数',
	}, 
	{
		title: '私有存储摄像机数',
	}, 
	{
		title: '公众摄像机数',
	}, 
	{
		title: '公众存储摄像机数',
	}, 
];


export function dataAdapter(data){
	let re = [];
	data[0]._reData_ = null;
	re = fn.fieldSort(data,column_dataIndexs,columns,function(key){
		let t_data = data[key];
	})
	return re;
}
