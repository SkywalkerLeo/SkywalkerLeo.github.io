var clientId = "1234567890";
var device_sub_type = 0; //0 读证 ,1 SAM读证, 2 SDT读证
var deviceName = "SR236";
var deviceType = 0;
var isConnected = false;
var cardutil = {
    certWsStatus: false,
    // 主通道，用于打开设备、关闭设备等
    websocket: null,
    wsUrl: PROTOCOL_DEFAULT + SERVICE_HOST + cardWebsocketPort,
    //打开读证
    openReadDeviceParms: {
        cmd: "open_device",
        client_id: clientId,
        device_name: "Id_Card",
        device_type: 4,
        channel: 0,
        device_sub_type: device_sub_type,
    },
    //设置秘钥
    secretParams: {
        cmd: "set_app_param",
        client_id: clientId,
        device_name: "Id_Card",
        device_type: 4,
        channel: 0,
        device_sub_type: device_sub_type,
        app_key: "",
        app_secret: "",
        app_pass_word: "",
    },
    //读证
    readIDCardParams: {
        cmd: "read_card_info",
        client_id: clientId,
        device_name: "Id_Card",
        device_type: 4,
        channel: 0,
        write_cmd: "",
        timeout: 3,
    },
    //获取设备型号
    getDevModelParams: {
        cmd: "get_device_model",
        client_id: clientId,
        device_name: "Id_Card",
        device_type: 5,
        timeout: 3,
    },
    //关闭读证
    closeReadDeviceParams: {
        cmd: "close_device",
        client_id: clientId,
        device_name: "Id_Card",
        device_type: 4,
    },
    wsListCardParams: {
        //读卡获取设备
        cmd: "list_card",
        client_id: clientId,
        device_name: "SR-CCID",
        device_type: 5,
        channel: 0,
    },
    wsConnectCardParams: {
        //连接卡
        cmd: "connect_card",
        client_id: clientId,
        device_name: "SR-CCID",
        device_type: 5,
        channel: 0,
    },
    wsTransmitCardParams: {
        //发送APDU
        cmd: "transmit_card",
        client_id: clientId,
        device_name: "Card",
        device_type: 5,
        channel: 0,
    },
    wsDisconnectCardParams: {
        //断开卡
        cmd: "disconnect_card",
        client_id: clientId,
        device_name: "SR-CCID",
        device_type: 5,
    },
    //连接回调
    certConnectCallback: null, //读证连接回调
    readIDCardCallback: null, //读取身份证回调
    setAppParamExCallback: null, //读证秘钥回调
    readCardExCallback: null, //读证回调
    wsListCardCallback: null, //读卡获取设备回调
    wsConnectCardCallback: null, //连接卡回调
    wsTransmitCardCallback: null, //发送APDU回调
    wsDisconnectCardCallback: null, //断开卡回调
    wsGetDevModelCallback: null, //获取设备信息
    logMessage: function (message) {
        if (typeof window.onHandleMessage !== "undefined")
            window.onHandleMessage(message);
        else console.log(message);
    },
    // 连接主通道的websocket
    startWebSocket: function (callback) {
        cardutil.certConnectCallback = callback;
        if ("WebSocket" in window) {
            cardutil.websocket = new WebSocket(cardutil.wsUrl);
        } else if ("MozWebSocket" in window) {
            cardutil.websocket = new MozWebSocket(cardutil.wsUrl);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        cardutil.websocket.binaryType = "arraybuffer";
        cardutil.websocket.onopen = function () {
            console.log("Connected 主通道的URL: ", cardutil.wsUrl);
            if (cardutil.websocket.readyState == 1) {
                console.log("链接成功");
                isConnected = true;
                cardutil.certConnectCallback(true);
            }
        };
        cardutil.websocket.onmessage = function (evt) {
            cardutil.wsMessage(evt);
        };
        cardutil.websocket.onclose = function (evt) {
            if (cardutil.websocket.readyState == 3 && isConnected) {
                isConnected = false;
                console.log("链接关闭", evt);
                cardutil.certConnectCallback(false);
            }
        };
        cardutil.websocket.onerror = function (evt) {
            if (cardutil.websocket.readyState == 3) {
                console.log("链接报错", evt);
                cardutil.certConnectCallback(false);
            }
        };
    },
    // 发送信息
    sendMsg: function (param) {
        // console.log('发送信息', cardutil.websocket, param)
        if (cardutil.websocket && param) {
            cardutil.websocket.send(JSON.stringify(param));
        }
    },
    // websocket主通道的数据返回
    wsMessage: function (res) {
        var retcode = {};
        // console.log('收到返回的信息', res.data)
        var res = JSON.parse(res.data);
        var cmd = res.cmd;
        retcode.err_msg = res.message;
        switch (cmd) {
            case "open_device": //打开读证
                if (res.statuCode == 0) {
                    //SAM读证
                    if (device_sub_type == 1 || device_sub_type == 2) {
                        cardutil.sendMsg(cardutil.readIDCardParams);
                    } else {
                        //读证
                        // 秘钥
                        cardutil.sendMsg(cardutil.secretParams);
                    }
                } else {
                    textarea.value += res.message + "\r\n";
                    if (cardutil.readIDCardCallback) {
                        cardutil.readIDCardCallback(retcode);
                    }
                    //关闭读证
                    cardutil.sendMsg(cardutil.closeReadDeviceParams);
                }
                break;
            case "read_card_info": //读证
                if (device_sub_type == 1 || device_sub_type == 2) {
                    retcode.err_code = res.result;
                    retcode.data = res.read_result;
                    retcode.photoFront = res.id_card_photo_f;
                    retcode.photoBack = res.id_card_photo_b;
                    cardutil.readIDCardCallback(retcode);
                } else {
                    retcode.resultFlag = res.result;
                    retcode.status = "";
                    retcode.errorMsg = res.message;
                    retcode.verderId = "";
                    retcode.resultContent = res.read_result;
                    retcode.photoFront = res.id_card_photo_f;
                    retcode.photoBack = res.id_card_photo_b;

                    cardutil.readCardExCallback(retcode);
                }
                cardutil.sendMsg(cardutil.closeReadDeviceParams);
                break;
            case "close_device": //关闭读证
                // if (res.statuCode == 0) {
                //     textarea.value += '关闭读证' + res.message + "\r\n";
                // } else {
                //     textarea.value += res.message + "\r\n";
                // }
                // cardutil.readIDCardCallback(res);
                break;
            case "set_app_param": //设置秘钥
                retcode.resultFlag = res.statuCode;
                retcode.errorMsg = res.message;
                cardutil.setAppParamExCallback(retcode);
                if (res.statuCode != 0) {
                    //关闭读证
                    cardutil.sendMsg(cardutil.closeReadDeviceParams);
                }
                break;
            case "get_device_model":
                retcode.err_code = res.result;
                retcode.manufacturerName = res.manufacturerName;
                retcode.equipmentNumber = res.equipmentNumber;
                retcode.sn = res.dev_sn;
                retcode.have_screen = res.have_screen;
                cardutil.wsGetDevModelCallback(retcode);
                break;
            case "list_card": //读卡获取设备
                retcode.err_code = res.result;
                retcode.data = res.dev_name;
                cardutil.wsListCardCallback(retcode);
                break;
            case "connect_card": //连接卡
                retcode.err_code = res.statuCode;
                retcode.data = "";
                cardutil.wsConnectCardCallback(retcode);
                break;
            case "transmit_card": //发送APDU
                retcode.err_code = res.result;
                retcode.data = res.read_result;
                cardutil.wsTransmitCardCallback(retcode);
                break;
            case "disconnect_card": //断开卡
                retcode.err_code = res.statuCode;
                retcode.data = "";
                cardutil.wsDisconnectCardCallback(retcode);
                break;
        }
    },
    // 断开检测服务器连接
    cwStopWebSocket: function () {
        if (cardutil.websocket) {
            if (cardutil.websocket.readyState == 1) cardutil.websocket.close();
            cardutil.websocket = null;
            return true;
        } else {
            return false;
        }
    },
    // 服务连接出错
    onSocketError: function (evt) {
        cardutil.logMessage("连接检测服务有问题...");
    },
    //服务连接关闭onSocketClose
    onSocketClose: function (evt) {
        // websocket = null;
        cardutil.logMessage("服务已断开...");
    },
    // 读取身份证(SAM)
    wsReadIntegratedCard: function (callback) {
        device_sub_type = 1;
        cardutil.openReadDeviceParms.device_sub_type = 1;
        cardutil.readIDCardCallback = callback;
        cardutil.sendMsg(cardutil.openReadDeviceParms);
    },
    // 读取身份证(Sdt)
    wsSdtCard: function (callback) {
        device_sub_type = 2;
        cardutil.openReadDeviceParms.device_sub_type = 2;
        cardutil.readIDCardCallback = callback;
        cardutil.sendMsg(cardutil.openReadDeviceParms);
    },

    //获取设备型号
    getDevModel: function (callback) {
        cardutil.wsGetDevModelCallback = callback;
        cardutil.sendMsg(cardutil.getDevModelParams);
    },

    // 设置秘钥
    setAppParamEx: function (appKey, appSecret, password, callback) {
        device_sub_type = 0;
        cardutil.secretParams.device_sub_type = 0;
        cardutil.openReadDeviceParms.device_sub_type = 0;
        cardutil.secretParams.app_key = appKey;
        cardutil.secretParams.app_secret = appSecret;
        cardutil.secretParams.app_pass_word = password;
        cardutil.setAppParamExCallback = callback;
        cardutil.sendMsg(cardutil.openReadDeviceParms);
    },
    // 读证
    readCardEx: function (callback) {
        // console.log("readCardEx start")
        cardutil.readCardExCallback = callback;
        // console.log("readCardEx start", callback)
        cardutil.sendMsg(cardutil.readIDCardParams);
    },
    /**读卡**/
    // 获取设备
    wsListCard: function (callback) {
        cardutil.wsListCardCallback = callback;
        cardutil.sendMsg(cardutil.wsListCardParams);
    },
    //连接卡
    wsConnectCard: function (callback) {
        cardutil.wsConnectCardCallback = callback;
        cardutil.sendMsg(cardutil.wsConnectCardParams);
    },
    //发送APDU
    wsTransmitCard: function (Apdu, CardName, callback) {
        cardutil.wsTransmitCardParams.apdu_cmd = Apdu;
        cardutil.wsTransmitCardParams.device_name = CardName;
        cardutil.wsTransmitCardCallback = callback;
        cardutil.sendMsg(cardutil.wsTransmitCardParams);
    },
    //断开卡
    wsDisconnectCard: function (callback) {
        cardutil.wsDisconnectCardCallback = callback;
        cardutil.sendMsg(cardutil.wsDisconnectCardParams);
    },

    // 修改通讯协议
    changeProtocol: function (protocol) {
        cardutil.websocket = null;
        isConnected = false;
        cardutil.certWsStatus = false;
        var head = (protocol == 'wss') ? PROTOCOL_WSS : PROTOCOL_WS;
        var end = (protocol == 'wss') ? cardWebsocketPortWSS : cardWebsocketPort;
        cardutil.wsUrl = head + SERVICE_HOST + end;
    },
};
