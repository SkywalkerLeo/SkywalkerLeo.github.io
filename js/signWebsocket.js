var signutil = {
    signWsStatus: false,
    // 主通道，用于打开设备、关闭设备等
    websocket: null,
    wsUrl: PROTOCOL_DEFAULT + SERVICE_HOST + signWebsocketPort,
    // wsUrl: 'ws://192.168.200.56:32561/',
    // 用于签字坐标返回数据的通道
    websocketSc: null,
    wsUrlSc: PROTOCOL_DEFAULT + SERVICE_HOST + signWebsocketSourcePort,
    // wsUrlSc: 'ws://192.168.200.56:42561/',
    //获取设备状态
    deviceStatusParams: {
        cmd: "get_device_status",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
    },
    // 打开设备
    openParamsOne: {
        cmd: "open_device",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
        recv_msg_port: 42561,
        ui_type: 2,
        html_url: "",
        show_html_type: 0,
        whether_sign: false,
        x: 0,
        y: 0,
        show_text: 0,
        time: 0,
    },
    openParamsTwo: {
        cmd: "open_device",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
        recv_msg_port: 42561,
        ui_type: 3,
        pic_type: "",
        x: 0,
        y: 0,
        show_text: 0,
        time: 0,
        is_compose: 0,
        composition: {
            left: 100,
            top: 0,
            width: 200,
            height: 100,
            page: 0,
        },
        pdf_data: "",
        pdf_file_type: "",
        pic_data: "",
        pic_file_type:"",
    },

    evaluateParams: {
        cmd: "evaluate_sign",
        device_type: 1,
        client_id: "1234567890",
        device_name: "SR501",
        ui_type: 4,
        pic: "",
        type: "jpg",
        name: "xxx",
        post: "测试员",
        no: "12345678",
        star: 2,
        timeout: 15,
    },

    //获取设备信息
    deviceInfoParams: {
        cmd: "get_device_info",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
    },
    // 确认签字
    signConfirmParams: {
        cmd: "sign_confirm",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
    },
    // 重签
    againSignParams: {
        cmd: "revived_sign",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
    },
    // 取消签字
    signCancelParams: {
        cmd: "sign_cancel",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 1,
    },
    // 关闭设备
    signCloseParams: {
        cmd: "close_device",
        client_id: "1234567890",
        device_name: "SR501",
        device_type: 0,
    },
    openDeviceCallback: null, //打开设备
    connectCallback: null, //链接回调
    getCoordinateCallback: null,
    deviceInfoCallback: null, //设备信息回调
    signConfirmCallback: null,
    revivedSignCallback: null, //重签
    getDeviceStatusCallback: null, //获取设备状态
    deviceTriggerCallback: null, //
    closeDeviceCallback: null,
    evaluateSignCallback: null,//评价功能

    logMessage: function (message) {
        if (typeof window.onHandleMessage !== "undefined")
            window.onHandleMessage(message);
        else console.log(message);
    },
    // 连接主通道的websocket
    startWebSocket: function (callback) {
        signutil.connectCallback = callback;
        if ("WebSocket" in window) {
            signutil.websocket = new WebSocket(signutil.wsUrl);
        } else if ("MozWebSocket" in window) {
            signutil.websocket = new MozWebSocket(signutil.wsUrl);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        signutil.websocket.binaryType = "arraybuffer";
        signutil.websocket.onopen = function () {
            console.log("Connected 主通道的URL: ", signutil.wsUrl);
            if (signutil.websocket.readyState == 1) {
                console.log("链接成功");
                signutil.connectCallback(true);
            }
        };
        signutil.websocket.onmessage = function (evt) {
            signutil.wsMessage(evt);
        };
        signutil.websocket.onclose = function (evt) {
            if (signutil.websocket.readyState == 3) {
                console.log("链接关闭", evt);
                signutil.connectCallback(false);
            }
        };
        signutil.websocket.onerror = function (evt) {
            if (signutil.websocket.readyState == 3) {
                console.log("链接报错", evt);
                signutil.connectCallback(false);
            }
        };
    },
    // 连接签字坐标通道的websocket
    startWebSocketSc: function (callback1, callback2) {
        WebSocketScCallback = callback1;
        signutil.getCoordinateCallback = callback2;
        if ("WebSocket" in window) {
            signutil.websocketSc = new WebSocket(signutil.wsUrlSc);
        } else if ("MozWebSocket" in window) {
            signutil.websocketSc = new MozWebSocket(signutil.wsUrlSc);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        signutil.websocketSc.binaryType = "arraybuffer";
        signutil.websocketSc.onopen = function () {
            console.log("签字坐标URL链接成功ready");
            console.log("签字坐标URL链接成功", signutil.websocketSc);
            console.log("Connected 签字坐标URL: ", signutil.wsUrlSc);
            if (signutil.websocketSc.readyState == 1) {
                console.log("签字坐标URL链接成功");
                WebSocketScCallback(true);
            }
        };
        signutil.websocketSc.onmessage = function (evt) {
            signutil.wsMessageSc(evt);
        };
        signutil.websocketSc.onclose = signutil.onSocketClose;
        signutil.websocketSc.onerror = signutil.onSocketError;
    },
    // 发送信息
    sendMsg: function (param) {
        // console.log('发送信息', signutil.websocket, param)
        if (signutil.websocket && param) {
            signutil.websocket.send(JSON.stringify(param));
        }
    },
    // websocket主通道的数据返回
    wsMessage: function (res) {
        var res = JSON.parse(res.data);
        var cmd = res.cmd;
        switch (cmd) {
            case "get_device_status":
                if (signutil.getDeviceStatusCallback != null) {
                    signutil.getDeviceStatusCallback(res);
                }
                break;
            case "open_device":
                if (signutil.openDeviceCallback != null) {
                    signutil.openDeviceCallback(res);
                }
                break;
            case "get_device_info":
                if (signutil.deviceInfoCallback != null) {
                    signutil.deviceInfoCallback(res);
                }
                break;
            case "start_get_coordinate":
                if (signutil.openDeviceCallback != null) {
                    signutil.openDeviceCallback(res);
                }
                break;
            case "sign_cancel":
                if (signutil.signCancelCallback != null) {
                    signutil.signCancelCallback(res);
                } else {
                    signutil.openDeviceCallback(res);
                }
                break;
            case "close_device":
                if (signutil.closeDeviceCallback != null) {
                    signutil.closeDeviceCallback(res);
                }
                break;
            case "revived_sign":
                if (signutil.revivedSignCallback != null) {
                    signutil.revivedSignCallback(res);
                } else {
                    signutil.openDeviceCallback(res);
                }
                break;
            case "sign_pic":
                if (signutil.signConfirmCallback != null) {
                    signutil.signConfirmCallback(res);
                } else {
                    signutil.openDeviceCallback(res);
                }
                break;
            case "evaluate_sign":
                textarea.value += "评价成功：结果为 " + res.result + "\r\n";
                textarea.scrollTop = textarea.scrollHeight;

                if (signutil.evaluateSignCallback != null) {
                    signutil.evaluateSignCallback(res);
                }
                break;
        }
    },
    // 签字坐标通道的数据返回
    wsMessageSc: function (res) {
        // console.log('签字坐标通道的数据返回', res)
        signutil.getCoordinateCallback(res);
    },
    // 断开检测服务器连接
    cwStopWebSocket: function () {
        if (signutil.websocket || signutil.websocketSc) {
            if (
                signutil.websocket.readyState == 1 ||
                signutil.websocketSc.readyState == 1
            )
                signutil.websocket.close();
            signutil.websocketSc.close();
            signutil.websocket = null;
            signutil.websocketSc = null;
            return true;
        } else {
            return false;
        }
    },
    // 服务连接出错
    onSocketError: function (evt) {
        signutil.logMessage("连接检测服务有问题...");
    },
    //服务连接关闭onSocketClose
    onSocketClose: function (evt) {
        // websocket = null;
        signutil.websocketSc = null;
        signutil.logMessage("服务已断开...");
    },
    // 获取设备状态
    getDeviceStatus: function (callback) {
        signutil.getDeviceStatusCallback = callback;
        signutil.sendMsg(signutil.deviceStatusParams);
    },
    // 打开设备
    openDevice: function (status, param, callback) {
        signutil.openDeviceCallback = callback;
        if (status == 0) 
        {
            signutil.openParamsOne.whether_sign = false;
            signutil.openParamsOne.ui_type = 2;
            signutil.openParamsOne.show_html_type = 0;
            signutil.sendMsg(signutil.openParamsOne);
        }
        else if (status == 1) {
            if (param.signFileType == "pdf") {
                signutil.openParamsTwo.ui_type = 3;
                signutil.openParamsTwo.pdf_data = param.signData;
                signutil.openParamsTwo.pdf_file_type = 0;
                signutil.sendMsg(signutil.openParamsTwo);
            }
            else if (param.signFileType == "png" || param.signFileType == "jpg" || param.signFileType == "bmp") {
                signutil.openParamsTwo.ui_type = 5;
                signutil.openParamsTwo.pic_type = param.signFileType;               
                signutil.openParamsTwo.pic_data = param.signData;
                signutil.openParamsTwo.pic_file_type = 0;
                signutil.sendMsg(signutil.openParamsTwo);
            }
            else {
                alert("不支持");
            }
        }
        else if (status == 2) {
            signutil.openParamsOne.whether_sign = true;
            signutil.openParamsOne.ui_type = 0;
            signutil.openParamsOne.show_html_type = 2;
            signutil.openParamsOne.html_url = param.signUrl;
            signutil.sendMsg(signutil.openParamsOne);
        }
        else if(status == 3)
        {
            if (param.signFileType == "png" || param.signFileType == "jpg" || param.signFileType == "bmp") {
                signutil.openParamsTwo.ui_type = 6;
                signutil.openParamsTwo.pic_type = param.signFileType;               
                signutil.openParamsTwo.pic_data = param.signData;
                signutil.openParamsTwo.pic_file_type = 0;
                signutil.sendMsg(signutil.openParamsTwo);
            }
        }
    },


    // 评价功能
    evaluateSign: function (param, callback) {
        signutil.evaluateParams.evaluateSignCallback = callback;
        signutil.evaluateParams.name = param.name;
        signutil.evaluateParams.pic = param.pic;
        signutil.evaluateParams.type = param.type;
        signutil.evaluateParams.post = param.post;
        signutil.evaluateParams.no = param.no;
        signutil.evaluateParams.star = param.star;
        signutil.evaluateParams.timeout = param.timeout;
        signutil.sendMsg(signutil.evaluateParams);
    },

    // 获取设备信息
    getDeviceInfo: function (callback) {
        signutil.deviceInfoCallback = callback;
        signutil.sendMsg(signutil.deviceInfoParams);
    },
    // 取消签名
    signCancel: function (callback) {
        signutil.signCancelCallback = callback;
        signutil.sendMsg(signutil.signCancelParams);
    },
    // 重签
    revivedSign: function (callback) {
        signutil.revivedSignCallback = callback;
        signutil.sendMsg(signutil.againSignParams);
    },
    // 确认签名
    signConfirm: function (callback) {
        signutil.signConfirmCallback = callback;
        signutil.sendMsg(signutil.signConfirmParams);
    },
    // 关闭设备
    signClose: function (callback) {
        signutil.closeDeviceCallback = callback;
        signutil.sendMsg(signutil.signCloseParams);
    },

    // 修改通讯协议
    changeProtocol: function (protocol) {
        signutil.websocket = null;
        signutil.signWsStatus = false;
        var head = (protocol == 'wss') ? PROTOCOL_WSS : PROTOCOL_WS;
        var end = (protocol == 'wss') ? signWebsocketPortWSS : signWebsocketPort;
        var end_sc = (protocol == 'wss') ? signWebsocketSourcePortWSS : signWebsocketSourcePort;

        signutil.wsUrl = head + SERVICE_HOST + end;
        signutil.wsUrlSc = head + SERVICE_HOST + end_sc;
    },
};
