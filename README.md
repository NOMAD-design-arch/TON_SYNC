```markdown
# TON 节点同步监控 API

这是一个用于监控 TON 节点同步状态的 Node.js API。它提供了一个 HTTP 接口，用于查询当前同步时间、本地区块高度和同步差异。

## 安装

1. **克隆仓库:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **安装依赖:**

   ```bash
   npm install
   ```

3. **配置环境变量:**

   - 将 `.env.example` 文件重命名为 `.env`。
   - 在 `.env` 文件中填写所需的配置值。

   示例 `.env` 文件：

   ```env
   # .env 文件内容

   # TON LiteServer 配置，使用 127.0.0.1 作为服务器 IP
   SERVER_IP=2130706433
   SERVER_PORT=27758
   SERVER_ID_TYPE=pub.ed25519
   SERVER_ID_KEY=

   # 请求 TON Center 公共 API
   # 测试网 API
   TON_CENTER_API=https://testnet.toncenter.com/api/v2/getMasterchainInfo
   # 主网 API
   # TON_CENTER_API=https://toncenter.com/api/v2/getMasterchainInfo

   # 监控端口配置
   API_PORT=3001
   ```

4. **启动 API 服务器:**

   ```bash
   npm start
   ```

## API 接口

API 提供以下接口：

### 1. 获取公共主链信息

- **接口:** `GET /public-block`
- **描述:** 返回当前公共主链信息。
- **响应:**
   ```json
   {
     "publicBlock": <publicMasterchainInfo>
   }
   ```

### 2. 获取本地区块高度

- **接口:** `GET /local-block`
- **描述:** 返回当前本地区块高度信息。
- **响应:**
   ```json
   {
     "localBlock": <localMasterchainInfo>
   }
   ```

### 3. 获取同步状态差异

- **接口:** `GET /sync-status`
- **描述:** 返回本地区块高度与公共主链高度的同步状态差异。
- **响应:**
   ```json
   {
     "syncDifference": <syncStatus>
   }
   ```

## 依赖项

- `express`: 快速、无意见、极简的 Node.js Web 框架。
- `dotenv`: 从 `.env` 文件加载环境变量到 `process.env`。
- `axios`: 浏览器和 Node.js 的基于 Promise 的 HTTP 客户端。
- `ton-lite-client`: 与 TON LiteServer 交互的客户端库。
