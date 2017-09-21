const publicIp = require("public-ip")
const apiClient = require('node-gandi');
const config = require("./config")

const api = new apiClient(config.apikey)

publicIp.v4().then((myIpv4) => {
	console.log("Votre IP : "+myIpv4)
})

api.call("domain.available",config.domain,(err,data)=>{
	if(err) throw err
	console.log(data)
})