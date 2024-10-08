"use strict";
require('dotenv').config(); // 加载环境变量
Object.defineProperty(exports, "__esModule", { value: true });
const ton_lite_client_1 = require("ton-lite-client");
const axios = require('axios');

/**
 * 将整数转换为IP地址字符串
 * @param {number} int - 整数
 * @returns {string} - IP地址字符串
 */
function intToIP(int) {
    // 将整数分别取出每个字节
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);
    // 将字节组合成IP地址字符串
    return part4 + "." + part3 + "." + part2 + "." + part1;
}

// 定义ton服务器配置
let server = {
    ip: process.env.SERVER_IP, // 服务器IP地址
    port: process.env.SERVER_PORT, // 服务器端口
    id: {
        "@type": process.env.SERVER_ID_TYPE, // 服务器ID类型
        key: process.env.SERVER_ID_KEY // 服务器ID密钥
    }
};

/**
 * 获取公共主链信息
 * @returns {Promise<object>} - 主链信息对象
 */
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

/**
 * 获取TON本地节点的同步信息
 * @returns {Promise<number>} - 节点与主链的时间同步差异，单位为秒
 */
async function getTonSync(){
    console.log('get master info');
    const master = await client.getMasterchainInfoExt(); // 获取客户端主链信息
    console.log('master', master);
    const publicMaster = await getPublicMasterchainInfo(); // 获取公共主链信息
    console.log('publicMaster', publicMaster);
    const NodeTimeDifference = Math.abs(publicMaster.seqno - master.last.seqno); // 计算序列号差异
    console.log(`Node Time difference: ${NodeTimeDifference} seconds`);
    const blockTimeDifference = Math.abs(master.now - master.lastUtime); // 计算时间戳差异
    console.log(`Block Time difference: ${blockTimeDifference} seconds`);
    const out_of_sync = Math.max(NodeTimeDifference, blockTimeDifference); // 选择较大的差异作为节点与主链的时间同步差异
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