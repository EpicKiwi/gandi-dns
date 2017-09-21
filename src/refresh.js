const api = require("./api")
const config = require("./config")
const publicIp = require("public-ip")

module.exports = async function refreshRecords(){
	
	console.log("Getting public IP address")
	const myipv4 = await publicIp.v4()
	console.log("Public ip : "+myipv4)
	console.log("Getting records")
	const records = await api.fullGetRecords()
	
	console.log("Refreshing records")
	let needRefresh = []
	for(let i = 0; i<records.length; i++){
		let record = records[i]
		let configRecord = config.records.find( el => el.name == record.name && el.type == record.type)
		if( configRecord && record.value != myipv4){
			needRefresh.push(record)
		}
	}

	if(needRefresh.length > 0){
		await api.refreshRecords(needRefresh,myipv4)
	} else {
		console.log("Everything up to date")
	}

	return needRefresh.length+" records updated"
}