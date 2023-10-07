var sign = {
  status: "",
  signData: "",
  signFileType: "",
  signUrl:"",
  evaluateSignParams:"",
  //获取设备在线状态
  sGetSignStatus: function (sGetSignStatuscallback) {
    if (signutil.signWsStatus) {
      signutil.getDeviceStatus(function (res) {
        // console.log("获取设备在线状态回调", res);
        var retcode = {
          err_code: res.result,
          err_msg: res.message,
          data: "",
        };
        sGetSignStatuscallback(retcode);
      });
    } else {
      sign.sReconnect("sGetSignStatus", function (resp) {
        sGetSignStatuscallback(resp);
      });
    }
  },

  //打开设备
  sSignOpen: function (sign_status, sign_data, ssignOpencallback) {
    param = {
      signData:sign_data,
      signFileType:this.signFileType,
      signUrl:this.signUrl,
    }

    sign.status= sign_status;
    sign.signData = sign_data;
    sign.signFileType = this.signFileType;
    sign.signUrl = this.signUrl;


    if (signutil.signWsStatus) {
      signutil.openDevice(sign_status, param, function (res) {
        // console.log("打开签名回调", res);
        res.err_code = res.result;
        if (res.cmd == "open_device") {
          //获取设备信息
          signutil.getDeviceInfo(function (res) {
            // console.log("签名获取设备信息的返回", res);
            var retcode = {
              cmd: res.cmd,
              err_code: res.result,
              err_msg: res.message,
              resolution: res.resolution,
              data: res,
            };
            ssignOpencallback(retcode);
          });
        }
        ssignOpencallback(res);
      });
    } else {
      sign.sReconnect("sSignOpen", function (resp) {
        ssignOpencallback(resp);
      });
    }
  },
  sGetCoordinate: function (sGoSignEventCallback) {
    if (signutil.signWsStatus) {
      // 连接签字通道
      signutil.startWebSocketSc(
        function (connectSignCallback) {
          // console.log("连接签字通道连接状态", connectSignCallback);
        },
        function (res) {
          var data = JSON.parse(res.data);
          // console.log('签字坐标返回', data)
          var recote = {
            err_code: data.result,
            err_msg: data.message,
            data: data.resultContent,
          };
          sGoSignEventCallback(recote);
        }
      );
    } else {
      sign.sReconnect("sGetCoordinate", function (resp) {
        sGoSignEventCallback(resp);
      });
    }
  },

  sEvaluateSign: function (params, evaluateSignCallback) {
    sign.evaluateSignParams = params;
    if (signutil.signWsStatus) {       
      signutil.evaluateSign(params, function (resp) {
        console.log("evaluateSignCallback", resp);
        var retcode = {
          err_code: resp.result,
          err_msg: resp.message,
        };
        evaluateSignCallback(retcode);
      });
    } else {
      sign.sReconnect("sEvaluateSign", function (resp) {
        evaluateSignCallback(resp);
      });
    }
  },

  // 确认签名获取图片
  sSignFile: function (sSignFilecallback) {
    if (signutil.signWsStatus) {
      signutil.signConfirm(function (res) {
        // console.log("获取签名图片", res);
        var retcode = {
          err_code: res.result,
          err_msg: res.message,
          data: res.sign_pic_data,
        };
        sSignFilecallback(retcode);
      });
    } else {
      sign.sReconnect("sSignFile", function (resp) {
        sSignFilecallback(resp);
      });
    }
  },
  // 重签清空画板
  sResetSign: function (sResetSigncallback) {
    if (signutil.signWsStatus) {
      signutil.revivedSign(function (res) {
        // console.log("重签清空画板的回调", res);
        var retcode = {
          err_code: res.result,
          err_msg: res.message,
          data: "",
        };
        sResetSigncallback(retcode);
      });
    } else {
      sign.sReconnect("sResetSign", function (resp) {
        sResetSigncallback(resp);
      });
    }
  },
  //取消签名
  sCloseSign: function (sCloseSigncallback) {
    if (signutil.signWsStatus) {
      signutil.signCancel(function (res) {
        // console.log("取消签名的回调", res);
        var retcode = {
          err_code: res.result,
          err_msg: res.message,
          data: "",
        };
        sCloseSigncallback(retcode);
      });
    } else {
      sign.sReconnect("sCloseSign", function (resp) {
        sCloseSigncallback(resp);
      });
    }
  },
  //取消签名
  sCloseDevice: function (sCloseDevicecallback) {
    if (signutil.signWsStatus) {
      signutil.signClose(function (res) {
        // console.log("关闭设备", res);
        var retcode = {
          err_code: res.result,
          err_msg: res.message,
          data: "",
        };
        sCloseDevicecallback(retcode);
      });
    } else {
      sign.sReconnect("sCloseDevice", function (resp) {
        sCloseDevicecallback(resp);
      });
    }
  },
  sReconnect: function (params, sReconnectCallback) {
    // 连接ws
    signutil.startWebSocket(function (res) {
      // console.log("签名ws链接状态1111", res);
      if (res) {
        signutil.signWsStatus = true;
        if (params == "sGetSignStatus") {
          sign.sGetSignStatus(sReconnectCallback);
        }
        if (params == "sSignOpen") {
          sign.sSignOpen(sign.status, sign.signData, sReconnectCallback);
        }
        if (params == "sGetCoordinate") {
          sign.sGetCoordinate(sReconnectCallback);
        }
        if (params == "sSignFile") {
          sign.sSignFile(sReconnectCallback);
        }
        if (params == "sResetSign") {
          sign.sResetSign(sReconnectCallback);
        }
        if (params == "sCloseSign") {
          sign.sCloseSign(sReconnectCallback);
        }
        if (params == "sCloseDevice") {
          sign.sCloseDevice(sReconnectCallback);
        }
        if (params == "sEvaluateSign")
        {
          sign.sEvaluateSign(sign.evaluateSignParams,sReconnectCallback);
        }
      } else {
        signutil.signWsStatus = false;
        var retcode = {
          err_code: -1,
          err_msg: "ws连接失败，查看服务是否启动！！！",
          data: "",
        };
        sReconnectCallback(retcode);
      }
    });
  },
};
