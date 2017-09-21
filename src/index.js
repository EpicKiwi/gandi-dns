const publicIp = require("public-ip")

publicIp.v4().then((myIpv4) => {
	console.log(myIpv4)
})
