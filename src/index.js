const refresh = require("./refresh")

refresh().then((result)=>{
	console.info(result)
}).catch((err)=>{
	console.error(err)
})