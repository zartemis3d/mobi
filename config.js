/*
安装nodejs :
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
然后 nvm install node

部署 : npm install && npm install -g pm2
启动 : pm2 start tx.json
log : pm2 logs
*/

module.exports = {
    db_host: '47.92.65.155',  //数据库 服务器
    db_user: 'develop',     //数据库 用户名
    db_password: '3edc$RFV2017',    //数据库 密码
    db_database: 'mobi',         //数据库名称

    address: '0x2A19b9aDEdBbAF5d2f72e516B9b24929687fC5ce',      //地址
    privkey: '31f836e85a5cab56f4cd5fc1b191e8cdb1374c90a54219344f4f0664dade9404',        //私钥

    interval: 20000,    //提取记录 间隔执行时间(毫秒)
    
    provider: 'wss://mainnet.infura.io/ws',      //以太坊服务节点,
    //provider: 'https://mainnet.infura.io/v3/40da3111ca294cb9941fec79566117ef',  //以太坊服务节点, 目前使用的是网络的, 为了性能, 应该用geth建立本地节点
    //provider : '127.0.0.1:8545',  //本地节点
    //provider : 'https://ropsten.infura.io/v3/40da3111ca294cb9941fec79566117ef',  //测试节点
    
 
}

 

 