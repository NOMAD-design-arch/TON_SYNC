"use strict";
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { LiteClient, LiteRoundRobinEngine, LiteSingleEngine } = require('ton-lite-client');

// 定义缓存对象
let cache = {
    publicMasterchainInfo: null,
    localMasterchainInfo: null,
    syncStatus: null,
    lastUpdateTime: null
};

// 定义缓存过期时间，单位为毫秒（30s）
const CACHE_DURATION = 30 * 1000; // 30秒

// Express App 设置
const app = express();
const port = process.env.API_PORT || 3001; // 使用环境变量配置API端口

// 定义 TON 服务器配置
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

// Lite client 初始化
const engines = [];
engines.push(new LiteSingleEngine({
    host: `tcp://${intToIP(server.ip)}:${server.port}`,
    publicKey: Buffer.from(server.id.key, 'base64'),
}));
const engine = new LiteRoundRobinEngine(engines);
const client = new LiteClient({ engine });

// 获取公共主链信息
async function getPublicMasterchainInfo() {
    try {
        const response = await axios.get(process.env.TON_CENTER_API, {
            headers: {
                'accept': 'application/json'
            }
        });
        return response.data.result.last;
    } catch (error) {
        throw new Error('Failed to fetch public masterchain info: ' + error.message);
    }
}

// 获取本地主链信息
async function getLocalMasterchainInfo() {
    try {
        const master = await client.getMasterchainInfoExt();
        return master.last;
    } catch (error) {
        throw new Error('Failed to fetch local masterchain info: ' + error.message);
    }
}

/**
 * 获取TON本地节点的同步信息
 * @returns {Promise<number>} - 节点与主链的时间同步差异，单位为秒
 */
async function getTonSync(){
    console.log('get master info');
    const master = await client.getMasterchainInfoExt(); // 获取客户端主链信息
    //console.log('master', master);
    const publicMaster = await getPublicMasterchainInfo(); // 获取公共主链信息
    //console.log('publicMaster', publicMaster);
    const NodeTimeDifference = Math.abs(publicMaster.seqno - master.last.seqno); // 计算序列号差异
    console.log(`Node Time difference: ${NodeTimeDifference} seconds`);
    const blockTimeDifference = Math.abs(master.now - master.lastUtime); // 计算时间戳差异
    console.log(`Block Time difference: ${blockTimeDifference} seconds`);
    const out_of_sync = Math.max(NodeTimeDifference, blockTimeDifference); // 选择较大的差异作为节点与主链的时间同步差异
    console.log(`Out of sync: ${out_of_sync} seconds`);
    return out_of_sync;
}

// 检查缓存是否有效
function isCacheValid() {
    return cache.lastUpdateTime && (Date.now() - cache.lastUpdateTime) < CACHE_DURATION;
}

// 查询 TON 公共块高 API
app.get('/public-block', async (req, res) => {
    try {
        if (!isCacheValid() || !cache.publicMasterchainInfo) {
            cache.publicMasterchainInfo = await getPublicMasterchainInfo();
            cache.lastUpdateTime = Date.now();
        }
        res.json({ publicBlock: cache.publicMasterchainInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 查询 TON 本地块高 API
app.get('/local-block', async (req, res) => {
    try {
        if (!isCacheValid() || !cache.localMasterchainInfo) {
            cache.localMasterchainInfo = await getLocalMasterchainInfo();
            cache.lastUpdateTime = Date.now();
        }
        res.json({ localBlock: cache.localMasterchainInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 查询 TON 同步相差时间 API
app.get('/sync-status', async (req, res) => {
    try {
        if (!isCacheValid() || !cache.syncStatus) {
            cache.syncStatus = await getTonSync();
            cache.lastUpdateTime = Date.now();
        }
        res.json({ syncDifference: cache.syncStatus });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 启动 API 服务
app.listen(port, () => {
    console.log(`TON Sync API is running on port ${port}`);
});
