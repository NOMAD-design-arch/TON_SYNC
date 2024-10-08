const express = require('express');
require('dotenv').config(); // 加载环境变量
const nodemailer = require('nodemailer');
const { getTonSync } = require('./sync'); // 导入你的 getTonSync 函数

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000; // 使用环境变量中的端口或默认3000

// 设置邮件传输器
const transporter = nodemailer.createTransport({
    service: 'Gmail', // 选择你的邮件服务提供商
    auth: {
        user: process.env.EMAIL_USER, // 从环境变量中获取邮箱
        pass: process.env.EMAIL_PASS // 从环境变量中获取密码
    }
});

// 发送通知邮件的函数
async function sendEmailNotification(syncHeight) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // 发件人
        to: process.env.EMAIL_TO, // 收件人
        subject: 'TON Blockchain Sync Alert',
        text: `警告: 当前TON区块同步时间为 ${syncHeight}，高于预期值！`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('通知邮件已发送');
    } catch (error) {
        console.error('发送邮件失败:', error);
    }
}

// 监控函数
async function monitorSync() {
    try {
    const syncHeight = await getTonSync();
    
    if (syncHeight >= 20) {
        console.log(`当前同步时间: ${syncHeight}，高于预期值20，发送通知邮件...`);
        await sendEmailNotification(syncHeight); 
    } else {
        console.log(`当前同步时间: ${syncHeight}，正常。`);
    }

    // 在页面上更新同步信息
    updateSyncInfo(syncHeight);
    } catch (error) {
    console.error('查询块高失败:', error);
    await sendEmailNotification('TON Node Service Error', `查询块高失败: ${error.message}`);
    }
}

// 每5分钟（600000毫秒）执行一次监控
setInterval(monitorSync, 1 * 60 * 1000);

// 更新同步信息的函数（示例）
function updateSyncInfo(syncHeight) {
    console.log(`同步时间更新: ${syncHeight}`);
}

// 手动查询块高的接口
app.get('/sync-height', async (req, res) => {
    try {
        const syncHeight = await getTonSync();
        //await sendEmailNotification(syncHeight);//测试邮件功能
        res.json({ syncHeight });
    } catch (error) {
        console.error('查询块高失败:', error);
        res.status(500).json({ error: '查询块高失败' });
    }
});

// 启动HTTP服务器
app.listen(port, () => {
    console.log(`服务器正在运行，访问 http://localhost:${port}/sync-height 查询块高`);
});
