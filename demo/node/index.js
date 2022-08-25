const ipfsh = require('../../index')
const cid = "bafkreia2ctix6qekb6c6q5dauvbot7nbvtxdvhj4cmeriqyajseo2gqve4"
console.log("s", cid)
let digest = ipfsh.ctod(cid)
console.log("d = ", digest)
let end = ipfsh.dtoc(digest)
console.log("e", end)

let c = ipfsh.toCid("0x5f8dcbfb26e8a4c16d31cb65f1068b6f9d5541e47e72bb42974d89322ed4eb97", "dag-pb")
console.log("CID", c)
let x = ipfsh.fromCid(c)
console.log("x", x)
