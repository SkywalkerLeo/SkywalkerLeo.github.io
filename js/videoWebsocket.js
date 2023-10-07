var clientId = "1234567890";
var videoutil = {
    videoWsStatus: false,
    // 主通道，用于打开设备、关闭设备等
    websocket: null,
    wsUrl: PROTOCOL_DEFAULT + SERVICE_HOST + videoWebsocketPort,
    connectCallback: null,
    // 用于视频图片返回数据的通道
    websocketSc: null,
    wsUrlSc: PROTOCOL_DEFAULT + SERVICE_HOST + videoWebsocketSourcePort,
    WebSocketScCallback: null,
    //拍照设备信息
    videoDeviceParams: {
        cmd: "get_camera_info",
        client_id: clientId,
    },
    //打开视频
    singleVideoCheckParams: {
        cmd: "playvideo",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
        video_frame_w: "",
        video_frame_h: "",
        play_rotate_angle: 0,
        recv_video_port: 34257,
    },
    //静态边缘检测
    edgeParams: {
        cmd: "show_static_edge",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        statuCode: 1,
        camera_path: "",
        message: "",
    },
    //拍照
    takeCutPicParams: {
        cmd: "take_pic",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
        rotate_angle: 0,
        pic_type: 1,
        is_save_local_file: 0,
        mask_text: "",
        is_compress: 0,
        compress_size: 200,
        margins: 0,
        is_cut: 0,
    },
    //关闭视频
    stopvideoParams: {
        cmd: "stopvideo",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
    },
    //条码检测
    barcodeParams: {
        cmd: "read_qr_code",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        image_data: "",
        image_type: "jpg",
    },
    //OCR
    ocrTextParams: {
        cmd: "optical_character_certificates",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        image_data: "",
        image_type: "jpg",
        ocr_type: 0,
    },
    ocrTextParamsOnline: {
        cmd: "optical_character_certificates_online",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        image_data: "",
        image_type: "jpg",
        ocr_type: 0,
    },
    combinePDFParams: {
        cmd: "compose_pdf",
        client_id: clientId,
        return_file_type: 0,
        save_file_path: "D:/1.pdf",
        pic_file_type: 0,
        pic_file_list: "",
        pic_datas: [],
    },
    recordVideoParams: {
        cmd: "",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
        file_path: "",
        audio_file_path: "",
        left_channel_file_path: "",
        right_channel_file_path: "",
    },
    isOpenStaticEdgeParams: {
        cmd: "show_static_edge",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
        show_num: 1,
        statuCode: 0,
    },
    configVideoRotateAngleParams: {
        cmd: "set_rotate_angle",
        camera_type: 0,
        camera_index: -1,
        camera_name: "",
        client_id: clientId,
        camera_path: "",
        rotate_angle: 0,
    },
    deviceInfoCallback: null, //获取设备信息
    singleVideoCheckCallback: null, //打开视频
    startEdgeCheckCallback: null, //静态边缘
    takeCutPicCallback: null, //拍照
    videoConnectCallback: null, //拍照连接回调
    //34257的链接回调
    startWebSocketCallback: null,
    playVideoCallback: null,
    stopVideoCallback: null, //停止拍照
    picFileUploadCallback: null, //文件上传
    barcodeCallback: null, //条码识别回调
    ocrTextCallback: null, //ORC识别回调
    startRecordVideoCallback: null,
    stopRecordVideoCallback: null,
    combinePDFCheckCallback: null,
    isOpenStaticEdgeCallback: null,
    configVideoRotateAngleCallback: null,

    logMessage: function (message) {
        if (typeof window.onHandleMessage !== "undefined")
            window.onHandleMessage(message);
        else console.log(message);
    },
    // 连接主通道的websocket
    startWebSocket: function (callback) {
        videoutil.connectCallback = callback;
        if ("WebSocket" in window) {
            videoutil.websocket = new WebSocket(videoutil.wsUrl);
        } else if ("MozWebSocket" in window) {
            videoutil.websocket = new MozWebSocket(videoutil.wsUrl);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        videoutil.websocket.binaryType = "arraybuffer";
        videoutil.websocket.onopen = function () {
            console.log("Connected 主通道的URL: ", videoutil.wsUrl);
            if (videoutil.websocket.readyState == 1) {
                console.log("链接成功");
                videoutil.connectCallback(true);
            }
        };
        videoutil.websocket.onmessage = function (evt) {
            videoutil.wsMessage(evt);
        };
        videoutil.websocket.onclose = function (evt) {
            if (videoutil.websocket.readyState == 3) {
                console.log("链接关闭", evt);
                videoutil.connectCallback(false);
            }
        };
        videoutil.websocket.onerror = function (evt) {
            if (videoutil.websocket.readyState == 3) {
                console.log("链接报错", evt);
                videoutil.connectCallback(false);
            }
        };
    },
    // 连接34257通道的websocket
    startWebSocketSc: function (callback1, callback2) {
        WebSocketScCallback = callback1;
        videoutil.getCoordinateCallback = callback2;
        if ("WebSocket" in window) {
            videoutil.websocketSc = new WebSocket(videoutil.wsUrlSc);
        } else if ("MozWebSocket" in window) {
            videoutil.websocketSc = new MozWebSocket(videoutil.wsUrlSc);
        } else {
            window.alert("浏览器不支持WebSocket");
            return;
        }
        videoutil.websocketSc.binaryType = "arraybuffer";
        videoutil.websocketSc.onopen = function () {
            console.log("Connected 34257端口: ", videoutil.wsUrlSc);
            if (videoutil.websocketSc.readyState == 1) {
                console.log("34257端口链接成功");
                WebSocketScCallback(true);
            }
        };
        videoutil.websocketSc.onmessage = function (evt) {
            videoutil.wsMessageSc(evt);
        };
        videoutil.websocketSc.onclose = videoutil.onSocketClose;
        videoutil.websocketSc.onerror = videoutil.onSocketError;
    },
    // 发送信息
    sendMsg: function (param) {
        // console.log('发送信息', videoutil.websocket, param)
        if (videoutil.websocket && param) {
            videoutil.websocket.send(JSON.stringify(param));
        }
    },
    // websocket主通道的数据返回
    wsMessage: function (res) {
        // console.log('主通道的返回', res)
        var res = JSON.parse(res.data);
        var cmd = res.cmd;
        switch (cmd) {
            case "get_camera_info": //获取设备信息
                videoutil.deviceInfoCallback(res);
                break;
            case "play_video_status": //打开视频
                if (videoutil.singleVideoCheckCallback) {
                    videoutil.singleVideoCheckCallback(res);
                }
                break;
            case "show_static_edge": //静态边缘
                if (videoutil.startEdgeCheckCallback) {
                    videoutil.startEdgeCheckCallback(res);
                }
                break;
            case "take_pic":
                videoutil.takeCutPicCallback(res);
                break;
            case "stopvideo": //停止拍照
                videoutil.stopVideoCallback(res);
                break;
            case "read_qr_code": //条码识别
                videoutil.barcodeCallback(res);
                break;
            case "pic_file_upload": //文件上传
                videoutil.picFileUploadCallback(res);
                break;
            case "optical_character_certificates":
                videoutil.ocrTextCallback(res);
                break;
            case "optical_character_certificates_online":
                videoutil.ocrTextCallback(res);
                break;
            case "compose_pdf": //pdf合成
                videoutil.combinePDFCheckCallback(res);
                break;
            case "start_video_record": //开始录像
                if (videoutil.startRecordVideoCallback) {
                    videoutil.startRecordVideoCallback(res);
                }
                break;
            case "stop_video_record": //停止录像
                if (videoutil.stopRecordVideoCallback) {
                    videoutil.stopRecordVideoCallback(res);
                }
                break;
        }
    },
    // 视频通道的数据返回
    wsMessageSc: function (res) {
        // console.log('视频通道的数据返回', res)
        videoutil.getCoordinateCallback(res);
    },
    // 断开检测服务器连接
    cwStopWebSocket: function () {
        if (videoutil.websocket || videoutil.websocketSc) {
            if (
                videoutil.websocket.readyState == 1 ||
                videoutil.websocketSc.readyState == 1
            )
                videoutil.websocket.close();
            videoutil.websocketSc.close();
            videoutil.websocket = null;
            videoutil.websocketSc = null;
            return true;
        } else {
            return false;
        }
    },
    // 服务连接出错
    onSocketError: function (evt) {
        videoutil.logMessage("连接检测服务有问题...");
    },
    //服务连接关闭onSocketClose
    onSocketClose: function (evt) {
        // websocket = null;
        videoutil.websocketSc = null;
        videoutil.logMessage("服务已断开...");
    },
    // 获取设备信息
    getDeviceInfo: function (callback) {
        videoutil.deviceInfoCallback = callback;
        videoutil.sendMsg(videoutil.videoDeviceParams);
    },
    // 打开视频
    singleVideoCheck: function (param, callback) {
        // console.log("ws打开视频参数", param.play_rotate_angle);
        videoutil.singleVideoCheckCallback = callback;
        videoutil.singleVideoCheckParams.camera_type = param.camera_type;
        videoutil.singleVideoCheckParams.camera_index = param.camera_index;
        videoutil.singleVideoCheckParams.camera_name = param.camera_name;
        videoutil.singleVideoCheckParams.camera_path = param.camera_path;
        videoutil.singleVideoCheckParams.video_frame_w = parseInt(
            param.video_frame_w
        );
        videoutil.singleVideoCheckParams.video_frame_h = parseInt(
            param.video_frame_h
        );
        videoutil.singleVideoCheckParams.play_rotate_angle =
            param.play_rotate_angle;

        videoutil.sendMsg(videoutil.singleVideoCheckParams);
    },
    // 开启静态边缘检测
    startEdgeCheck: function (param, callback) {
        videoutil.singleVideoCheckCallback = callback;
        videoutil.edgeParams.camera_type = param.camera_type;
        videoutil.edgeParams.camera_index = param.camera_index;
        videoutil.edgeParams.camera_name = param.camera_name;
        videoutil.edgeParams.camera_path = param.camera_path;
        videoutil.edgeParams.statuCode = 1;
        videoutil.sendMsg(videoutil.edgeParams);
        videoutil.startEdgeCheckCallback = callback;
    },
    // 关闭静态边缘检测
    stopEdgeCheck: function (param, callback) {
        videoutil.singleVideoCheckCallback = callback;
        videoutil.edgeParams.camera_type = param.camera_type;
        videoutil.edgeParams.camera_index = param.camera_index;
        videoutil.edgeParams.camera_name = param.camera_name;
        videoutil.edgeParams.camera_path = param.camera_path;
        videoutil.edgeParams.statuCode = 0;
        videoutil.sendMsg(videoutil.edgeParams);
        videoutil.startEdgeCheckCallback = callback;
    },
    // 停止摄像头
    stopVideo: function (param, callback) {
        videoutil.stopVideoCallback = callback;

        videoutil.stopvideoParams.camera_type = param.camera_type;
        videoutil.stopvideoParams.camera_index = param.camera_index;
        videoutil.stopvideoParams.camera_name = param.camera_name;
        videoutil.stopvideoParams.camera_path = param.camera_path;
        videoutil.sendMsg(videoutil.stopvideoParams);
    },
    // 拍照
    takeCutPic: function (param, callback) {
        videoutil.takeCutPicCallback = callback;
        videoutil.takeCutPicParams.camera_type = param.camera_type;
        videoutil.takeCutPicParams.camera_index = param.camera_index;
        videoutil.takeCutPicParams.camera_name = param.camera_name;
        videoutil.takeCutPicParams.camera_path = param.camera_path;
        videoutil.takeCutPicParams.rotate_angle = param.rotate_angle;
        videoutil.takeCutPicParams.is_cut = param.is_cut;
        videoutil.takeCutPicParams.mask_text = param.mask_text;
        videoutil.takeCutPicParams.pic_type = param.pic_type;
        videoutil.takeCutPicParams.is_save_local_file = param.is_save_local_file;
        videoutil.takeCutPicParams.is_compress = param.is_compress;
        videoutil.takeCutPicParams.compress_size = (param.compress_size && param.compress_size > 0) ? param.compress_size : 200;
        videoutil.takeCutPicParams.margins = (param.margins && param.margins > 0) ? param.margins : 0;

        videoutil.sendMsg(videoutil.takeCutPicParams);
    },
    // 识别条码
    barcode: function (param, callback) {
        videoutil.barcodeCallback = callback;
        videoutil.barcodeParams.camera_type = param.camera_type;
        videoutil.barcodeParams.camera_index = param.camera_index;
        videoutil.barcodeParams.camera_name = param.camera_name;
        videoutil.barcodeParams.image_data = param.image_data;
        videoutil.barcodeParams.image_type = param.image_type;
        videoutil.barcodeCallback = callback;
        videoutil.sendMsg(videoutil.barcodeParams);
    },
    // 本地OCR
    ocrText: function (param, callback) {
        videoutil.ocrTextCallback = callback;
        videoutil.ocrTextParams.camera_type = param.camera_type;
        videoutil.ocrTextParams.camera_index = param.camera_index;
        videoutil.ocrTextParams.camera_name = param.camera_name;
        videoutil.ocrTextParams.image_data = param.image_data;
        videoutil.ocrTextParams.image_type = param.image_type;
        videoutil.ocrTextParams.ocr_type = param.ocr_type;
        videoutil.ocrTextCallback = callback;
        videoutil.sendMsg(videoutil.ocrTextParams);
    },
    // 在线识别OCR
    ocrTextOnline: function (param, callback) {
        videoutil.ocrTextCallback = callback;
        videoutil.ocrTextParamsOnline.camera_type = param.camera_type;
        videoutil.ocrTextParamsOnline.camera_index = param.camera_index;
        videoutil.ocrTextParamsOnline.camera_name = param.camera_name;
        videoutil.ocrTextParamsOnline.image_data = param.image_data;
        videoutil.ocrTextParamsOnline.image_type = param.image_type;
        videoutil.ocrTextParamsOnline.ocr_type = param.ocr_type;
        videoutil.ocrTextCallback = callback;
        videoutil.sendMsg(videoutil.ocrTextParamsOnline);
    },
    //   合成pdf
    combinePDFCheck: function (data, callback) {
        videoutil.combinePDFCheckCallback = callback;
        videoutil.combinePDFParams.pic_datas = data;
        videoutil.sendMsg(videoutil.combinePDFParams);
    },

    //开始录像
    startRecordVideo: function (param, callback) {
        if (callback && typeof callback === 'function') {
            videoutil.startRecordVideoCallback = callback;
        }
        videoutil.recordVideoParams.cmd = "start_video_record";
        videoutil.recordVideoParams.camera_type = param.camera_type;
        videoutil.recordVideoParams.camera_index = param.camera_index;
        videoutil.recordVideoParams.camera_name = param.camera_name;
        videoutil.recordVideoParams.camera_path = param.camera_path;
        videoutil.recordVideoParams.file_path = param.file_path;
        videoutil.recordVideoParams.audio_file_path = param.audio_file_path;
        videoutil.recordVideoParams.left_channel_file_path = param.left_channel_file_path;
        videoutil.recordVideoParams.right_channel_file_path = param.right_channel_file_path;
        videoutil.sendMsg(videoutil.recordVideoParams);
    },

    //停止录像
    stopRecordVideo: function (param, callback) {
        if (callback && typeof callback === 'function') {
            videoutil.stopRecordVideoCallback = callback;
        }
        videoutil.recordVideoParams.cmd = "stop_video_record";
        videoutil.recordVideoParams.camera_type = param.camera_type;
        videoutil.recordVideoParams.camera_index = param.camera_index;
        videoutil.recordVideoParams.camera_name = param.camera_name;
        videoutil.recordVideoParams.camera_path = param.camera_path;
        videoutil.sendMsg(videoutil.recordVideoParams);
    },

    // 修改通讯协议
    changeProtocol: function (protocol) {
        videoutil.websocket = null;
        videoutil.videoWsStatus = false;
        var head = (protocol == 'wss') ? PROTOCOL_WSS : PROTOCOL_WS;
        var end = (protocol == 'wss') ? videoWebsocketPortWSS : videoWebsocketPort;
        var end_sc = (protocol == 'wss') ? videoWebsocketSourcePortWSS : videoWebsocketSourcePort;

        videoutil.wsUrl = head + SERVICE_HOST + end;
        videoutil.wsUrlSc = head + SERVICE_HOST + end_sc;
    },

    //设置是否开启静态边缘检测  statuCode:1为开启，0为关闭
    isOpenStaticEdge: function (param, callback) {
        videoutil.isOpenStaticEdgeCallback = callback;
        videoutil.isOpenStaticEdgeParams.camera_type = param.camera_type;
        videoutil.isOpenStaticEdgeParams.camera_index = param.camera_index;
        videoutil.isOpenStaticEdgeParams.camera_name = param.camera_name;
        videoutil.isOpenStaticEdgeParams.camera_path = param.camera_path;
        videoutil.isOpenStaticEdgeParams.statuCode = param.statuCode;


        videoutil.sendMsg(videoutil.isOpenStaticEdgeParams);
    },

    //设置视频旋转角度  rotate_angle: 0-不做旋转 1-旋转90度 2-旋转180度 3-旋转270度
    configVideoRotateAngle: function (param, callback) {
        videoutil.configVideoRotateAngleCallback = callback;
        videoutil.configVideoRotateAngleParams.camera_type = param.camera_type;
        videoutil.configVideoRotateAngleParams.camera_index = param.camera_index;
        videoutil.configVideoRotateAngleParams.camera_name = param.camera_name;
        videoutil.configVideoRotateAngleParams.camera_path = param.camera_path;
        videoutil.configVideoRotateAngleParams.rotate_angle = param.rotate_angle;


        videoutil.sendMsg(videoutil.configVideoRotateAngleParams);
    },
};
