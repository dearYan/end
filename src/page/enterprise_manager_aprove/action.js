// import fetch from 'isomorphic-fetch'
import { REQUESTURL } from 'libs/common'
import Fetch from 'libs/fetch2'
export const ENTERPRISE_MANAGER_APROVAL_REQ = 'ENTERPRISE_MANAGER_APROVAL_REQ'
export const ENTERPRISE_MANAGER_APROVAL_DAILOG = 'ENTERPRISE_MANAGER_APROVAL_DAILOG'

function  getEnterpriseManagerAprovalResponse(json,reddit){
    Object.assign(json,reddit);
    return {
        type : ENTERPRISE_MANAGER_APROVAL_REQ,
        param : json
    }
}

function getEnterpriseManagerAprovalQuest(){
	return {
		type : ENTERPRISE_MANAGER_APROVAL_REQ
	}
}

export function enterpriseManagerAprovalDailog(params,json){
    return {
        type : ENTERPRISE_MANAGER_APROVAL_DAILOG,
        visible : params,
        json : json
    }
}

export function getEnterpriseManagerAprovalFetch(reddit){
    var url = REQUESTURL+'/dev/v1/partitions?app_id='+reddit["app_id"]+'&app_code='+reddit["app_code"]+
              '&identity='+reddit["identity"]+'&status='+reddit["aproval_status"]+'&page='+reddit["page"]+
              '&size='+reddit["size"];
    return dispatch => {
        r3fetch({
             urls:[url],
             method: 'GET'
        }).fetch(dispatch,getEnterpriseManagerAprovalResponse,{
            app_id : reddit["app_id"],
            page : reddit["page"],
            app_code : reddit["app_code"],
            identity : reddit["identity"],
            aproval_status : reddit["aproval_status"]
        },null);
    }
}

export function enterpriseManagerAprovalAgreeFetch(reddit){
    var url = REQUESTURL+'/dev/v1/partitions/'+reddit["id"]
    return dispatch => {
        r3fetch({
             urls:[url],
             method: 'PATCH',
             params: reddit
        }).fetch(dispatch,enterpriseManagerAprovalDailog,{
            hidden : false
        },null);
    }
}