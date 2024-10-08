# TON本地节点监控块高程序

该项目是一个基于Node.js的Express框架实现的TON本地节点监控块高程序。该程序使用了Ton liteserver sdk，nodemailer和express等库。

## 设计方式
- 使用Ton liteserver sdk查询本地区块数据。Ton liteserver sdk使用方式：支持js, python, go。
- ton liteserver sdk（查询本地节点数据）:
https://docs.ton.org/participate/run-nodes/enable-liteserver-node#interaction-with-liteserver-lite-client
- ton 公共api（查询主网数据）：
https://toncenter.com/
1. Ton Lite Client: 该程序使用了Ton Lite Client库来连接Ton本地节点并查询块同步信息。Ton Lite Client提供了一个简单的API来查询块同步信息，包括当前块高、块哈希等。
2. getTonSync函数: 该函数封装了Ton Lite Client的API来查询块同步信息。该函数每5分钟执行一次，查询当前的块高和块哈希，并将结果存储在变量中。
3. 监控逻辑: 该程序使用了一个简单的监控逻辑来检查块同步信息。如果当前块高高于预期值20秒，将发送警告邮件。
4. 邮件通知: 该程序使用了Nodemailer库来发送邮件通知。当块同步信息异常时，将发送警告邮件到指定的邮箱。

## 同步查询方式
1. 从客户端获取客户端主链信息 (master) 和公共API获取主链信息 (publicMaster)。
2. 计算客户端主链信息和公共API主链信息之间的序列号差异 (NodeTimeDifference) 。
3. 计算客户端服务器时间戳信息和客户端主链信息的时间戳差异 (blockTimeDifference)。
4. 返回这两个差异值中较大的一个作为节点与主链的时间同步差异 (out_of_sync)，单位为秒。
5. 通过阈值20秒，判断节点是否与主链保持同步。

## Ton liteServer环境配置
- 进入mytonctrl控制台，输入命令installer，进入installer模式。输入命令clcf生成本地配置文件local.config.json  
操作链接说明 https://docs.ton.org/participate/run-nodes/mytonctrl#clcf
- 查看并记录本地文件local.config.json的liteservers配置 ip, port, id ，后续需要配置在ton liteServer sdk中。  
命令示例 sudo cat /usr/bin/ton/local.config.json  
操作链接说明 https://docs.ton.org/participate/run-nodes/enable-liteserver-node#interaction-with-liteserver-lite-client
## 安装
需要 node -v v20.18.0
1. 在终端中导航到项目根目录。
2. 运行`npm install`命令来安装项目所需的依赖。

## 配置

在项目根目录下创建`.env`文件，并添加以下内容：

```
# ton liteServer配置
SERVER_IP=
SERVER_PORT=
SERVER_ID_TYPE=
SERVER_ID_KEY=

# 邮件配置
EMAIL_USER=
EMAIL_PASS=
EMAIL_TO=

# 监控端口
PORT=3000
```

将上述配置中的`SERVER_IP`、`SERVER_PORT`、`SERVER_ID_TYPE`、`SERVER_ID_KEY`、`EMAIL_USER`、`EMAIL_PASS`、`EMAIL_TO`替换为实际的值。

## 运行

1. 在终端中导航到项目根目录。
2. 运行`node monitor.js`命令来启动程序。

## 使用

该程序会每5分钟执行一次监控，并将监控结果发送到指定的邮箱。监控结果包括当前的同步时间，如果同步时间高于预期值20秒，将发送警告邮件。

## API

该程序提供了一个HTTP接口，可以手动查询当前的同步时间。

- GET `/sync-height`：查询当前的同步时间。

## 依赖

- express
- dotenv
- nodemailer
- axios
- ton-lite-client
