var takePhoto = {
    videoParams: {
        camera_type: 0,
        camera_index: 0,
        camera_name: "",
        camera_path: "",
        video_frame_w: 0,
        video_frame_h: 0,
        rotate_angle: 0,
        play_rotate_angle: 0,
        pic_type: 0,
        is_save_local_file: 0,
        mask_text: "",
        margins: 30,
        is_cut:0,
    },
    picData: [],
    cameraInfo: [],
    cutStatus: 0, ////0代表裁切，1代表不裁切
    //获取设备信息
    tpGetVideoInfo: function (tpGetVideoInfocallback) {
        if (videoutil.videoWsStatus) {
            videoutil.getDeviceInfo(function (res) {
                // console.log('获取设备信息返回', res)
                if (res.statuCode == 0) {
                    takePhoto.cameraInfo = res.camera_info;
                    // console.log('sfsdfe sd s ', takePhoto.cameraInfo)
                }
                var recote = {
                    err_code: res.statuCode,
                    err_msg: res.message,
                    data: res.camera_info,
                };
                tpGetVideoInfocallback(recote);
            });
        } else {
            takePhoto.tpReconnect("tpGetVideoInfo", function (resp) {
                tpGetVideoInfocallback(resp);
            });
        }
    },
    //合成pdf
    tpcombinePDFCheck: function (picData, tpcombinePDFCheckcallback) {
        takePhoto.picData = picData;
        if (videoutil.videoWsStatus) {
            videoutil.combinePDFCheck(takePhoto.picData, function (res) {
                tpcombinePDFCheckcallback(res);
            });
        } else {
            takePhoto.tpReconnect("tpcombinePDFCheck", function (resp) {
                tpcombinePDFCheckcallback(resp);
            });
        }
    },
    tpMasterOpenVideo: function (
        videoParams,
        cutStatus,
        tpMasterOpenVideocallback
    ) {
        //打开视频
        takePhoto.cutStatus = cutStatus;
        takePhoto.videoParams.camera_type = videoParams.camera_type;
        takePhoto.videoParams.video_frame_w = videoParams.video_frame_w;
        takePhoto.videoParams.video_frame_h = videoParams.video_frame_h;
        var cameraInfo = takePhoto.cameraInfo;
        for (var i = 0; i < cameraInfo.length; i++) {
            if (cameraInfo[i].camera_type == videoParams.camera_type) {
                var resIndex = i;
                takePhoto.videoParams.camera_index = cameraInfo[resIndex].device_index;
                takePhoto.videoParams.camera_name = cameraInfo[resIndex].camera_name;
                takePhoto.videoParams.camera_path = cameraInfo[resIndex].camera_path;
                break;
            }
        }
        // console.log("打开视频videoParams", takePhoto.videoParams);
        if (videoutil.videoWsStatus) {
            // console.log('1111', takePhoto.videoParams)
            videoutil.singleVideoCheck(
                takePhoto.videoParams,
                function (singleVideoCheckCallback) {
                    // console.log("打开视频的回调", singleVideoCheckCallback);
                    if (
                        singleVideoCheckCallback &&
                        singleVideoCheckCallback.statuCode == 0
                    ) {
                        videoutil.startWebSocketSc(
                            function (startWebSocketCallback) {
                                // console.log("34257ws连接回调", startWebSocketCallback);
                                if (!startWebSocketCallback) {
                                    var recote = {
                                        err_code: -1,
                                        err_msg: "34257ws连接关闭",
                                        data: "",
                                    };
                                } else {
                                    if (takePhoto.cutStatus == 0) {
                                        // 主头开启静态边缘检测
                                        // console.log("摄像头", takePhoto.videoParams.camera_type);
                                        if (takePhoto.videoParams.camera_type == 0) {
                                            videoutil.startEdgeCheck(
                                                takePhoto.videoParams,
                                                function (resp) {
                                                    // console.log("打开静态边缘的回调", resp);
                                                }
                                            );
                                        }
                                    }
                                }
                            },
                            function (playVideoCallback) {
                                // console.log('视频返回', playVideoCallback)
                                var recote = {
                                    err_code: 0,
                                    err_msg: "打开视频成功",
                                    data: playVideoCallback.data,
                                };
                                tpMasterOpenVideocallback(recote);
                            }
                        );
                    } else {
                        var recote = {
                            err_code: singleVideoCheckCallback.statuCode,
                            err_msg: singleVideoCheckCallback.message,
                            data: "",
                        };
                        tpMasterOpenVideocallback(recote);
                    }
                }
            );
        } else {
            // 连接ws
            videoutil.startWebSocket(function (res) {
                // console.log("打开视频ws链接状态1111", res);
                if (res) {
                    videoutil.videoWsStatus = true;
                    takePhoto.tpMasterOpenVideo(
                        takePhoto.videoParams,
                        tpMasterOpenVideocallback
                    );
                } else {
                    videoutil.videoWsStatus = false;
                    var retcode = {
                        err_code: -1,
                        err_msg: "ws连接失败，查看服务是否启动！！！",
                        data: "",
                    };
                    tpMasterOpenVideocallback(retcode);
                }
            });
        }
    },
    //主头拍照
    tpMasterTakePhoto: function (text, is_compress, compress_size, margins, rotate_angle, is_cut, tpMasterTakePhotocallback) {
        takePhoto.videoParams.mask_text = text;
        takePhoto.videoParams.is_compress = is_compress;
        takePhoto.videoParams.compress_size = compress_size;
        takePhoto.videoParams.margins = margins;
        takePhoto.videoParams.rotate_angle = rotate_angle;
        takePhoto.videoParams.is_cut = is_cut;

        if (videoutil.videoWsStatus) {
            videoutil.takeCutPic(takePhoto.videoParams, function (openCallback) {
                // console.log("拍照", openCallback);
                var recote = {
                    err_code: openCallback.statuCode,
                    err_msg: openCallback.message,
                    data: "",
                };
                if (openCallback.statuCode == 0) {
                    recote.data = openCallback.pic_data_arr[0].pic_data;
                }
                tpMasterTakePhotocallback(recote);
            });
        } else {
            takePhoto.tpReconnect("tpMasterTakePhoto", function (resp) {
                tpMasterTakePhotocallback(resp);
            });
        }
    },
    //副头拍照
    tpslaveTakePhoto: function (text, is_compress, compress_size, margins, rotate_angle, is_cut, tpslaveTakePhotocallback) {
        takePhoto.videoParams.mask_text = text;
        takePhoto.videoParams.is_compress = is_compress;
        takePhoto.videoParams.compress_size = compress_size;
        takePhoto.videoParams.margins = margins;
        takePhoto.videoParams.rotate_angle = rotate_angle;
        takePhoto.videoParams.is_cut = is_cut;

        if (videoutil.videoWsStatus) {
            videoutil.takeCutPic(takePhoto.videoParams, function (openCallback) {
                // console.log("拍照", openCallback);
                var recote = {
                    err_code: openCallback.statuCode,
                    err_msg: openCallback.message,
                    data: "",
                };
                if (openCallback.statuCode == 0) {
                    recote.data = openCallback.pic_data_arr[0].pic_data;
                }
                tpslaveTakePhotocallback(recote);
            });
        } else {
            takePhoto.tpReconnect("tpslaveTakePhoto", function (resp) {
                tpslaveTakePhotocallback(resp);
            });
        }
    },
    //旋转角度
    tpRoteAngle: function (rotate_angle) {
        // console.log("角度", rotate_angle);
        switch (parseInt(rotate_angle)) {
            case 0:
                rotate_angle = 0;
                break;
            case 90:
                rotate_angle = 1;
                break;
            case 180:
                rotate_angle = 2;
                break;
            case 270:
                rotate_angle = 3;
                break;
        }
        //takePhoto.videoParams.rotate_angle = rotate_angle;
        takePhoto.videoParams.play_rotate_angle = parseInt(rotate_angle);
    },
    //文件格式
    tpPicType: function (pic_type) {
        // console.log("格式", pic_type);
        takePhoto.videoParams.pic_type = pic_type;
    },
    tpCloseVideo: function (tpCloseVideoCallback) {
        if (videoutil.videoWsStatus) {
            if (takePhoto.cutStatus == 0) {
                videoutil.stopEdgeCheck(takePhoto.videoParams);
            }
            videoutil.stopVideo(takePhoto.videoParams, function (res) {
                // console.log("关闭视频回调", res);
                if (res.statuCode == 0) {
                    if (videoutil.websocketSc) {
                        videoutil.websocketSc.close();
                    }
                }
                var recote = {
                    err_code: res.statuCode,
                    err_msg: res.message,
                };
                tpCloseVideoCallback(recote);
            });
        } else {
            takePhoto.tpReconnect("tpCloseVideo", function (resp) {
                tpCloseVideoCallback(resp);
            });
        }
    },
    tpReconnect: function (params, tpReconnectCallback) {
        // 连接ws
        videoutil.startWebSocket(function (res) {
            console.log("相机ws链接状态1111", res);
            if (res) {
                videoutil.videoWsStatus = true;
                if (params == "tpGetVideoInfo") {
                    takePhoto.tpGetVideoInfo(tpReconnectCallback);
                }
                // if (params == 'tpMasterOpenVideo') {
                //     takePhoto.tpMasterOpenVideo(tpReconnectCallback);
                // }
                if (params == "tpMasterTakePhoto") {
                    takePhoto.tpMasterTakePhoto(tpReconnectCallback);
                }
                if (params == "tpslaveTakePhoto") {
                    takePhoto.tpslaveTakePhoto(tpReconnectCallback);
                }
                if (params == "tpCloseVideo") {
                    takePhoto.tpCloseVideo(tpReconnectCallback);
                }
                if (params == "tpcombinePDFCheck") {
                    takePhoto.tpcombinePDFCheck(takePhoto.picData, tpReconnectCallback);
                }
            } else {
                videoutil.videoWsStatus = false;
                var retcode = {
                    err_code: -1,
                    err_msg: "ws连接失败，查看服务是否启动！！！",
                    data: "",
                };
                tpReconnectCallback(retcode);
            }
        });
    },

    scanBarcodeFromPhoto: function (params, barcodeCallback) {
        // console.log("识别条码", videoutil.videoWsStatus);
        if (videoutil.videoWsStatus) {
            videoutil.barcode(params, function (resp) {
                // console.log("识别条码", resp);
                barcodeCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("scanBarcodeFromPhoto", function (resp) {
                barcodeCallback(resp);
            });
        }
    },
    ocrTextFromPhoto: function (params, ocrTextCallback) {
        // console.log("Photo", videoutil.videoWsStatus);
        if (videoutil.videoWsStatus) {
            videoutil.ocrText(params, function (resp) {
                // console.log("OCR", resp);
                ocrTextCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("ocrTextFromPhoto", function (resp) {
                ocrTextCallback(resp);
            });
        }
    },
    ocrTextFromPhotoOnline: function (params, ocrTextCallback) {
        // console.log("Online", videoutil.videoWsStatus);
        if (videoutil.videoWsStatus) {
            videoutil.ocrTextOnline(params, function (resp) {
                // console.log("OCR-Online", resp);
                ocrTextCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("ocrTextFromPhotoOnline", function (resp) {
                ocrTextCallback(resp);
            });
        }
    },

    startRecord: function (params, startRecordCallback) {
        // console.log("startRecord", videoutil.videoWsStatus);
        params.camera_name = takePhoto.videoParams.camera_name;
        params.camera_index = takePhoto.videoParams.camera_index;
        params.camera_path = takePhoto.videoParams.camera_path;
        if (videoutil.videoWsStatus) {
            videoutil.startRecordVideo(params, startRecordCallback);
        } else {
            takePhoto.tpReconnect("startRecord", startRecordCallback);
        }
    },

    stopRecord: function (params, stopRecordCallback) {
        // console.log("stopRecord", videoutil.videoWsStatus);
        params.camera_name = takePhoto.videoParams.camera_name;
        params.camera_index = takePhoto.videoParams.camera_index;
        params.camera_path = takePhoto.videoParams.camera_path;
        if (videoutil.videoWsStatus) {
            videoutil.stopRecordVideo(params, function (resp) {
                // console.log("stopRecord", resp);
                stopRecordCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("stopRecord", function (resp) {
                stopRecordCallback(resp);
            });
        }
    },

    isOpenStaticEdge: function (params, isOpenStaticEdgeCallback) {
        params.camera_name = takePhoto.videoParams.camera_name;
        params.camera_index = takePhoto.videoParams.camera_index;
        params.camera_path = takePhoto.videoParams.camera_path;

        if (videoutil.videoWsStatus) {
            videoutil.isOpenStaticEdge(params, function (resp) {
                isOpenStaticEdgeCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("isOpenStaticEdge", function (resp) {
                isOpenStaticEdgeCallback(resp);
            });
        }
    },

    configVideoRotateAngle: function (params, configVideoRotateAngleCallback) {
        params.camera_name = takePhoto.videoParams.camera_name;
        params.camera_index = takePhoto.videoParams.camera_index;
        params.camera_path = takePhoto.videoParams.camera_path;

        if (videoutil.videoWsStatus) {
            videoutil.configVideoRotateAngle(params, function (resp) {
                configVideoRotateAngleCallback(resp);
            });
        } else {
            takePhoto.tpReconnect("configVideoRotateAngle", function (resp) {
                configVideoRotateAngleCallback(resp);
            });
        }
    },
};
