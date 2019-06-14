const mysql = require('mysql')
const cfg = require('./config')
const pool = require('./DB')

/*
ip  47.92.65.155
端口 3306
数据库名称 mobi
用户名 develop
密码 
3edc$RFV2017


用户
gameUsers
userId 用户ID（同ETH地址） 类型 String 
addUpEth 玩家累计支付的ETH总量 类型 bigint
totalEth 玩家持有的ETH总量 类型 bigint
totalMobi 玩家持有的魔币总量 类型 double

充值记录
reChargeInfo
reChangeId 充值记录主键ID 类型 int(自增)
userId 用户ID 
reChangTime 充值时间 类型dateTime 
reChangNum 充值数量 类型bigint
reChangState 充值状态  类型 int（默认为0，代表链上支付成功但未统计入ETH支付总量；后台统计入ETH总量后变为1）
 
提取记录
recordInfo
recordId 提取记录主键ID 类型 int(自增)
userId 用户ID
recordTime 提取申请时间 类型dateTime
recordNum 提取数量 类型bigint
recoedState 提取状态 类型int (默认为0，代表数据库录入但链上未执行；链上执行过程中应变为1，执行完成后变为2)
注：状态值链上可根据实际情况做调整，若不存在到账延迟则可直接由0变为1

玩家当日产出
oubputInfo
outputId 产出记录ID 类型int(自增)
userId 用户ID
outputTime  产出时间 类型dateTime
outputNum  产出数量 类型 bigint

魔币信息
moBiInfo 
moBiId 魔币ID 
initialization 初始值 类型 bigint
ordered  已售出数量 类型 double 
rulingPrice 现价 类型 bigint

log信息
logInfo
logId  logID 
logUserId  log用户ID（记录出入的用户ETH地址）
logTime  log时间 类型dateTime
logNum  出入数量 类型bigint
logType  log类型值 类型 int(0出，1入)



*/

let CURRENT_TIMESTAMP = { toSqlString: function () { return 'CURRENT_TIMESTAMP()'; } };

module.exports = {
  initDB,
  receiveEth,
  updateRecoedState,
  updateHash,
  sendEth,
  updateBalance
}

async function initDB() {
 
/*     let create_tbl = `CREATE TABLE IF NOT EXISTS XXX ( 
  id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
  blockHash char(66) DEFAULT '',  
  blockNumber INT UNSIGNED NOT NULL  , 
  logIndex INT UNSIGNED NOT NULL  , 
  transactionHash char(66) DEFAULT '', 
  \`from\` char(42) DEFAULT '', 
  \`to\` char(42) DEFAULT '', 
  \`value\` char(42) DEFAULT '', 
  PRIMARY KEY (id), 
  INDEX(logIndex ), 
  INDEX(transactionHash ), 
  INDEX(\`from\` ), 
  INDEX(\`to\` ) 
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1`

    _query(create_tbl, [], function (error, results, fields) {
      if (error) console.error(error)
    }); */
 
}
 
async function receiveEth(hash, from, to, value) {
  try {
    //console.log(ev)
    _query(`SELECT * FROM reChargeInfos WHERE hash = ?`, [hash], function (error, results, fields) {
      if (error) console.error(error)
      //console.log(results)
      if (results && results.length == 0) {
        
        _query(`INSERT INTO reChargeInfos ( userId, reChangTime, reChangNum, reChangState, hash) VALUES ( ?, NOW(),?,?,? )`,
          [from.toLowerCase(),  value, 0 , hash], function (error, results, fields) {
            if (error) console.error(error);
          });
      }
    })

  } catch (e) {
    console.error(e)
  }
}



async function deleteFromDB(symbol, ev) {
  try {
    let tx = ev.transactionHash.toLowerCase()
    _query(`DELETE FROM ${symbol} WHERE logIndex = ? AND transactionHash = ?`, [ev.logIndex, tx], function (error, results, fields) {
      if (error) console.error(error)
    })
  } catch (e) {
    console.error(e)
  }
}

 
async function sendEth(cb) {
  try {
    //console.log(ev)
    let sql = `SELECT * FROM recordInfos WHERE recoedState = ? `
    _query(sql, [0], function (error, results, fields) {
      if (error) return "error";
      //console.log(JSON.stringify(results))

      if (results && results.length > 0) {
        cb(results)
      }

    })

  } catch (e) {
    console.error(e)
  }
}

async function updateRecoedState(recordId, state) {
  try {
    _query(`UPDATE recordInfos SET recoedState = ? WHERE recordId = ? `, [state, recordId], function (error, results, fields) {
      if (error) console.error(error)
    })
  } catch (e) {
    console.error(e)
  }
}

async function updateHash(recordId, hash) {
  try {
    _query(`UPDATE recordInfos SET hash = ? WHERE recordId = ? `, [hash, recordId], function (error, results, fields) {
      if (error) console.error(error)
    })
  } catch (e) {
    console.error(e)
  }
}

async function updateBalance(id, bal) {
  try {
    _query(`UPDATE balance SET balances = ? WHERE balanceId = ? `, [bal, id], function (error, results, fields) {
      if (error) console.error(error)
    })
  } catch (e) {
    console.error(e)
  }
}

var _query = function (sql, options, callback) {
  // console.log(`_query  ${sql} options  ${options} `)
  pool.getConnection(function (err, conn) {
    if (err) {
      callback(err, null, null);
    } else {
      try {
        conn.query(sql, options, function (err, results, fields) {
          //释放连接  
          conn.release();
          //事件驱动回调  
          callback(err, results, fields);
        });
      } catch (e) {
        console.error(e)
      }
    }
  });
};



async function dbClose() {
  await pool.end();
}

 