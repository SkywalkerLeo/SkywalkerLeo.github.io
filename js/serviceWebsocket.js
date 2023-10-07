var clientId = "1234567890";
var serviceutil = {
    // 主通道
    websocket: null,
    wsUrl: PROTOCOL_DEFAULT + SERVICE_HOST + serviceWebsocketPort,
    connectCallback: null,
    serviceInfoCallback: null,
    abilityCallback: null,
    deviceInfoCallback: null,
    deviceModelCallback: null,
    //获取信息参数
    infoParams: {
        cmd: "get_service_version",
        client_id: clientId,
        device_name: "common_dev",
        device_type: 10
    },
    //获取能力集参数
    ablityParams: {
        cmd: "get_service_ability",
        client_id: clientId,
        device_name: "common_dev",
        device_type: 10
    },
    //获取设备信息
    deviceInfoParams: {
        cmd: "get_device_info",
        client_id: clientId,
        device_name: "common_dev",
        device_type: 10
    },
    //获取设备类型
    deviceModelParams: {
        cmd: "get_device_model",
        client_id: clientId,
        device_name: "common_dev",
        device_type: 10
    },

    logMessage: function (message) {
        if (typeof window.onHandleMessage !== "undefined")
            window.onHandleMessage(message);
        else console.log(message);
    },
    // 连接主通道的websocket
    startWebSocket: function (callback) {
        serviceutil.connectCallback = callback;
        if ("WebSocket" in window) {
            serviceutil.websocket = new WebSocket(serviceutil.wsUrl);
        } else if ("MozWebSocket" in window) {
            serviceutil.websocket = new MozWebSocket(serviceutil.wsUrl);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        serviceutil.websocket.binaryType = "arraybuffer";
        serviceutil.websocket.onopen = function () {
            console.log("Connected 主通道的URL: ", serviceutil.wsUrl);
            if (serviceutil.websocket.readyState == 1) {
                console.log("链接成功");
                serviceutil.connectCallback(true);
            }
        };
        serviceutil.websocket.onmessage = function (evt) {
            serviceutil.wsMessage(evt);
        };
        serviceutil.websocket.onclose = function (evt) {
            if (serviceutil.websocket.readyState == 3) {
                console.log("链接关闭", evt);
                serviceutil.connectCallback(false);
            }
        };
        serviceutil.websocket.onerror = function (evt) {
            if (serviceutil.websocket.readyState == 3) {
                console.log("链接报错", evt);
                serviceutil.connectCallback(false);
            }
        };
    },
    // 发送信息
    sendMsg: function (param) {
        // console.log('发送信息', serviceutil.websocket, param)
        if (serviceutil.websocket && param) {
            serviceutil.websocket.send(JSON.stringify(param));
        }
    },
    // websocket主通道的数据返回
    wsMessage: function (res) {
        // console.log('主通道的返回', res)
        var res = JSON.parse(res.data);
        var cmd = res.cmd;
        switch (cmd) {
            case this.infoParams.cmd: //获取信息
                if (serviceutil.serviceInfoCallback) {
                    serviceutil.serviceInfoCallback(res);
                }
                break;
            case this.ablityParams.cmd: //获取能力集
                if (serviceutil.abilityCallback) {
                    serviceutil.abilityCallback(res);
                }
                break;
            case this.deviceInfoParams.cmd: //获取设备信息
                if (serviceutil.deviceInfoCallback) {
                    serviceutil.deviceInfoCallback(res);
                }
                break;
            case this.deviceModelParams.cmd: //获取设备型号
                if (serviceutil.deviceModelCallback) {
                    serviceutil.deviceModelCallback(res);
                }
                break;
        }
    },
    // 断开检测服务器连接
    cwStopWebSocket: function () {
        if (serviceutil.websocket) {
            if (serviceutil.websocket.readyState == 1) {
                serviceutil.websocket.close();
            }
            serviceutil.websocket = null;
            return true;
        } else {
            return false;
        }
    },
    // 服务连接出错
    onSocketError: function (evt) {
        serviceutil.logMessage("连接检测服务有问题...");
    },
    //服务连接关闭onSocketClose
    onSocketClose: function (evt) {
        serviceutil.logMessage("服务已断开...");
    },
    // 获取信息
    getServiceInfo: function (callback) {
        console.log("getServiceInfo");
        serviceutil.serviceInfoCallback = callback;
        if (serviceutil.websocket) {
            serviceutil.sendMsg(serviceutil.infoParams);
        } else {
            serviceutil.startWebSocket(function (connectRes) {
                if (connectRes) {
                    serviceutil.sendMsg(serviceutil.infoParams);
                } else {
                    callback("连接失败")
                }
            })
        }
    },

    // 获取能力集
    getServiceAbility: function (callback) {
        console.log("getServiceAbility");
        serviceutil.abilityCallback = callback;
        if (serviceutil.websocket) {
            serviceutil.sendMsg(serviceutil.ablityParams);
        } else {
            serviceutil.startWebSocket(function (connectRes) {
                if (connectRes) {
                    serviceutil.sendMsg(serviceutil.ablityParams);
                } else {
                    callback("连接失败")
                }
            })
        }
    },

    // 获取设备信息
    getDeviceInfo: function (callback) {
        console.log("getDeviceInfo");
        serviceutil.deviceInfoCallback = callback;
        if (serviceutil.websocket) {
            serviceutil.sendMsg(serviceutil.deviceInfoParams);
        } else {
            serviceutil.startWebSocket(function (connectRes) {
                if (connectRes) {
                    serviceutil.sendMsg(serviceutil.deviceInfoParams);
                } else {
                    callback("连接失败")
                }
            })
        }
    },

    // 获取设备型号
    getDeviceModel: function (callback) {
        console.log("getDeviceModel");
        serviceutil.deviceModelCallback = callback;
        if (serviceutil.websocket) {
            serviceutil.sendMsg(serviceutil.deviceModelParams);
        } else {
            serviceutil.startWebSocket(function (connectRes) {
                if (connectRes) {
                    serviceutil.sendMsg(serviceutil.deviceModelParams);
                } else {
                    callback("连接失败")
                }
            })
        }
    },

    // 修改通讯协议
    changeProtocol: function(protocol) {
        serviceutil.websocket = null;
        var head = (protocol == 'wss') ? PROTOCOL_WSS : PROTOCOL_WS;
        var end = (protocol == 'wss') ? serviceWebsocketPortWSS : serviceWebsocketPort;
        serviceutil.wsUrl = head + SERVICE_HOST + end;
    },
};
