"use strict";
require('dotenv').config(); // 加载环境变量
Object.defineProperty(exports, "__esModule", { value: true });
const ton_lite_client_1 = require("ton-lite-client");
const axios = require('axios');

function intToIP(int) {
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);
    return part4 + "." + part3 + "." + part2 + "." + part1;
}

let server = {
    ip: process.env.SERVER_IP,
    port: process.env.SERVER_PORT,
    id: {
        "@type": process.env.SERVER_ID_TYPE,
        key: process.env.SERVER_ID_KEY
    }
};

async function getPublicMasterchainInfo() {
    try {
        const response = await axios.get('https://testnet.toncenter.com/api/v2/getMasterchainInfo', {
            headers: {
                'accept': 'application/json'
                //'X-API-Key': API_KEY  // 使用公共 API 密钥
            }
        });
        return response.data.result.last;
    } catch (error) {
        console.error('Failed to fetch public masterchain info:', error);
        throw error;
    }
}

async function getTonSync(){
    console.log('get master info');
    const master = await client.getMasterchainInfoExt();
    console.log('master', master);
    const publicMaster = await getPublicMasterchainInfo();
    console.log('publicMaster', publicMaster);
    const NodeTimeDifference = Math.abs(publicMaster.seqno - master.last.seqno);
    console.log(`Node Time difference: ${NodeTimeDifference} seconds`);
    const blockTimeDifference = Math.abs(master.now - master.lastUtime);
    console.log(`Block Time difference: ${blockTimeDifference} seconds`);
    const out_of_sync = Math.max(NodeTimeDifference, blockTimeDifference);
    console.log(`Out of sync: ${out_of_sync} seconds`);
    return out_of_sync;
}

//lite client 初始化
const engines = [];
engines.push(new ton_lite_client_1.LiteSingleEngine({
    host: `tcp://${intToIP(server.ip)}:${server.port}`,
    publicKey: Buffer.from(server.id.key, 'base64'),
}));
const engine = new ton_lite_client_1.LiteRoundRobinEngine(engines);
const client = new ton_lite_client_1.LiteClient({ engine });

async function test() {
    const out_of_sync = await getTonSync();
    console.log(`Out of sync: ${out_of_sync} seconds`);

}

//test();

exports.getTonSync = getTonSync;