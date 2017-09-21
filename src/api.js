const apiClient = require('node-gandi');
const config = require("./config")

const api = new apiClient(config.apikey)

var domainInfo = null

function getDomainInfo(){
	return new Promise((resolve,reject)=>{
		if(domainInfo){
			resolve(domainInfo)
			return
		}
		api.call("domain.info",[config.domain],(err,data)=>{
			if(err) {
				reject(err)
				return
			}
			domainInfo = data
			resolve(domainInfo)
		})
	})
}

var zoneInfo = null

function getZoneInfo(zoneid){
	return new Promise((resolve,reject)=>{
		if(zoneInfo){
			resolve(zoneInfo)
			return
		}
		api.call("domain.zone.info",[zoneid],(err,data)=>{
			if(err) {
				reject(err)
				return
			}
			zoneInfo = data
			resolve(zoneInfo)
		})
	})
}

var records = null

function getRecords(zoneid,version){
	return new Promise((resolve,reject)=>{
		if(records){
			resolve(records)
			return
		}
		api.call("domain.zone.record.list",[zoneid,version],(err,data)=>{
			if(err) {
				reject(err)
				return
			}
			records = data
			resolve(records)
		})
	})
}

function promiseCall(call,params){
	return new Promise((resolve,reject)=>{
		api.call(call,params,(err,data)=>{
			if(err) {
				reject(err)
				return
			}
			console.log(call)
			console.log(params)
			console.log(data)
			resolve(data)
		})
	})
}

async function fullGetRecords(){
	const domain = await getDomainInfo()
	const zoneid = domain["zone_id"]
	const zone = await getZoneInfo(zoneid)
	const zoneversion = zone.version
	const records = await getRecords(zoneid,zoneversion)
	return records
}

async function refreshRecords(records,ipv4){
	const domain = await getDomainInfo()
	const zoneid = domain["zone_id"]
	const newVersionId = await promiseCall("domain.zone.version.new",[zoneid])
	const newVersionRecords = await getRecords(zoneid,newVersionId)

	let newRecords = []
	for(let i = 0; i<records.length; i++){
		record = records[i]
		let newVersionRecord = newVersionRecords.find( el => el.name == record.name && el.type == record.type)
		let newRecord = {name:record.name,type:record.type,value:ipv4,ttl:record.ttl}
		if(newVersionRecord){
			await promiseCall("domain.zone.record.delete",[zoneid,newVersionId,{name:newVersionRecord.name,type:newVersionRecord.type}])
		}
		let registeredRecord = await promiseCall("domain.zone.record.add",[zoneid,newVersionId,newRecord])
		newRecords.push(registeredRecord)
	}
	return newRecords
}

module.exports.fullGetRecords = fullGetRecords
module.exports.refreshRecords = refreshRecords