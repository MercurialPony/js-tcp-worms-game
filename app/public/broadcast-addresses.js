const OS = require("os");



function get()
{
	return Object.values(OS.networkInterfaces())
	.flatMap(e => e)
	// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
	// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
	.filter(net => !net.internal && net.family === (typeof net.family === 'string' ? 'IPv4' : 4))
	.map(net =>
	{
		const address = net.address.split(".");
		const netmask = net.netmask.split(".");
		// bitwise OR over the splitted NAND netmask, then glue them back together with a dot character to form an ip
		// we have to do a NAND operation because of the 2-complements; getting rid of all the 'prepended' 1's with & 0xFF
		return address.map( (e, i) => ((~netmask[i] & 0xFF) | e) ).join(".");
	});
}

module.exports = {
	get
};