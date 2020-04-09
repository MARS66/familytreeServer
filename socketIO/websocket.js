const {ChatModel} = require('../db/models')
const WebSocket = require('ws')
console.log("websocket"); 
module.exports = function (server) {
    var wss = new WebSocket.Server({server});

    wss.on('connection', function connection(ws) {
        console.log('链接成功！');
        ws.on('message', function incoming(data) {
            /**
             * 把消息发送到所有的客户端
             * wss.clients获取所有链接的客户端
             */let Msg=JSON.parse( data)
                Msg.time= Date.now()
            console.log('服务器接收到客户端发送的消息',Msg);
            new ChatModel(Msg).save(function (error, chatMsg) {
              // 向所有连接上的客户端发消息
              console.log(error);       
            })
            wss.clients.forEach(function each(client) {
                
                client.send(data);
            });
        });
    });
}