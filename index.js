const { importer } = require('ipfs-unixfs-importer')
const { globSource } = require('ipfs-http-client');
const { CID } = require('multiformats/cid')
const { create } = require('multiformats/hashes/digest');
const block = {
  get: async cid => { throw new Error(`unexpected block API get for ${cid}`) },
  put: async () => { throw new Error('unexpected block API put') }
}
const file = async (content, options) => {
  let lastCid
  for await (const { cid } of importer([{ content }], block, Object.assign({ onlyHash: true, cidVersion: 1, rawLeaves: true, }, options))) {
    lastCid = cid
  }
  return `${lastCid}`
}
/*
folder := [{
  path: <filename>,
  content: <uint8array>
}]
*/
const folder = async (folderItems, options, callback) => {
  let lastCid
  let i=0;
  let lastDepth;
  for await (const entry of importer(folderItems, block, Object.assign({ onlyHash: true, cidVersion: 1, rawLeaves: true, wrapWithDirectory: true }, options))) {
    console.log("entry", i, entry, entry.cid.toString())
    lastCid = entry.cid
    i++;
    if (callback) callback(i)
    let depth = entry.path.split("/").length
    if (lastDepth && depth < lastDepth) {
      break;
    } else {
      lastDepth = depth
    }
  }
  return `${lastCid}`
}
const directory = async (dirPath, options, callback) => {
  const files = globSource(dirPath, "**/*", { recursive: true });
  let lastCid
  for await (const entry of importer(files, block, Object.assign({ onlyHash: true, cidVersion: 1, rawLeaves: true, wrapWithDirectory: true }, options))) {
    console.log("entry", entry, entry.cid.toString())
    lastCid = entry.cid
    if (callback) callback(i)
  }
  return `${lastCid}`
}
// digest (0x...) to cid
const dtoc = (hex) => {
  let arr = new Uint8Array(hex.slice(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  let digest = create(18, arr)
  //let cid = CID.createV1(0x70, digest)
  let cid = CID.createV1(0x55, digest)
  return cid.toString()
}
// cid to digest (0x...)
const ctod = (cid) => {
  if (cid && cid.length > 0) {
    let digest = CID.parse(cid).multihash.digest
    let bytes = digest.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    return "0x" + bytes
  } else {
    return "0x00"
  }
}


// digest (0x...) to cid
const toCid = (hex, encoding) => {
  let arr = new Uint8Array(hex.slice(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  let digest = create(18, arr)
  let e = (encoding === "dag-pb" ? 0x70 : 0x55)
  let cid = CID.createV1(e, digest)
  return cid.toString()
}
const fromCid = (cid) => {
  if (cid && cid.length > 0) {
    let parsed = CID.parse(cid)
    let digest = parsed.multihash.digest
    let bytes = digest.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    let encoding
    if (parsed.code === 112) encoding = "dag-pb"
    else if (parsed.code === 85) encoding = "raw"
    else encoding = parsed.code
    return {
      digest: "0x" + bytes,
      encoding,
    }
  } else {
    return {
      digest: "0x00"
    }
  }
}
module.exports = { file, folder, directory, CID, dtoc, ctod, fromCid, toCid }
