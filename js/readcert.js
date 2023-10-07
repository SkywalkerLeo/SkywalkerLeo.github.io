var readCert = {
  //SAM读证
  rcOpenCertDevice: function (callback) {
    if (cardutil.certWsStatus) {
      cardutil.wsReadIntegratedCard(function (openCallback) {
        // console.log('wsReadIntegratedCard', openCallback)
        callback(openCallback);
      });
    } else {
      readCert.rcReconnect("rcOpenCertDevice", function (resp) {
        callback(resp);
      });
    }
  },
  //Sdt读证
  rcSdtCertDevice: function (callback) {
    if (cardutil.certWsStatus) {
      cardutil.wsSdtCard(function (openCallback) {
        // console.log("wsSdtCard", openCallback);
        callback(openCallback);
      });
    } else {
      readCert.rcReconnect("rcSdtCertDevice", function (resp) {
        callback(resp);
      });
    }
  },
  //获取秘钥
  rcSetAppParamEx: function (
    appKey,
    appSecret,
    password,
    rcSetAppParamExCallback
  ) {
    if (cardutil.certWsStatus) {
      //   console.log(appKey, appSecret, password);
      cardutil.setAppParamEx(
        appKey,
        appSecret,
        password,
        function (openCallback) {
          //   console.log("setAppParamEx", openCallback);
          rcSetAppParamExCallback(openCallback);
        }
      );
    } else {
      cardutil.startWebSocket(function (res) {
        // console.log("读证读卡ws链接状态1111", res);
        if (res) {
          cardutil.certWsStatus = true;
          readCert.rcSetAppParamEx(
            appKey,
            appSecret,
            password,
            rcSetAppParamExCallback
          );
        } else {
          cardutil.certWsStatus = false;
          var retcode = {
            err_code: -1,
            err_msg: "ws连接失败，查看服务是否启动！！！",
            data: "",
          };
          rcSetAppParamExCallback(retcode);
        }
      });
    }
  },
  //读证
  rcReadCardEx: function (rcReadCardExCallback) {
    if (cardutil.certWsStatus) {
      cardutil.readCardEx(function (openCallback) {
        // console.log("readCardEx", openCallback);
        rcReadCardExCallback(openCallback);
      });
    } else {
      readCert.rcReconnect("rcReadCardEx", function (resp) {
        callback(resp);
      });
    }
  },

  //获取设备型号
  rcGetDevModel: function (rcGetDevModelCallback) {
    if (cardutil.certWsStatus) {
      cardutil.getDevModel(function (openCallback) {
        console.log("rcGetDevModel", openCallback);
        rcGetDevModelCallback(openCallback);
      });
    } else {
      readCert.rcReconnect("rcGetDevModel", function (resp) {
        rcGetDevModelCallback(resp);
      });
    }
  },
  rcReconnect: function (params, rcReconnectCallback) {
    cardutil.startWebSocket(function (res) {
      //   console.log("读证读卡ws链接状态1111", res);
      if (res) {
        cardutil.certWsStatus = true;
        if (params == "rcOpenCertDevice") {
          readCert.rcOpenCertDevice(rcReconnectCallback);
        }
        if (params == "rcReadCardEx") {
          readCert.rcReadCardEx(rcReconnectCallback);
        }
        if (params == "rcSdtCertDevice") {
          readCert.rcSdtCertDevice(rcReconnectCallback);
        }
        if (params == "rcGetDevModel") {
          readCert.rcGetDevModel(rcReconnectCallback);
        }
      } else {
        cardutil.certWsStatus = false;
        var retcode = {
          err_code: -1,
          err_msg: "ws连接失败，查看服务是否启动！！！",
          data: "",
        };
        rcReconnectCallback(retcode);
      }
    });
  },
};
