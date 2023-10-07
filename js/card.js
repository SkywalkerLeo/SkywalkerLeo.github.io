var readCard = {
    //获取设备
    rdListCard: function (rdListCardcallback) {
        if (cardutil.certWsStatus) {
            cardutil.wsListCard(function (openCallback) {
                // console.log('获取设备回调', openCallback)
                // if (openCallback.err_code == 0) {
                //     readCard.rdConnectCard(rdListCardcallback);
                // }
                rdListCardcallback(openCallback);
            });
        } else {
            readCard.rdReconnect('rdListCard', function (resp) {
                rdListCardcallback(resp);
            });
        }
    },
    //连接卡
    rdConnectCard: function (rdConnectCardcallback) {
        if (cardutil.certWsStatus) {
            cardutil.wsConnectCard(function (resp) {
                // console.log('连接卡回调', resp)
                rdConnectCardcallback(resp);
            });
        } else {
            readCard.rdReconnect('rdConnectCard', function (resp) {
                rdConnectCardcallback(resp);
            });
        }
    },
    //发送APDU
    rdTransmitCard: function (Apdu, CardName, rdTransmitCard) {
        if (cardutil.certWsStatus) {
            cardutil.wsTransmitCard(Apdu, CardName, function (openCallback) {
                // console.log('发送APDU回调', openCallback)
                rdTransmitCard(openCallback);
            });
        } else {
            // 连接ws
            cardutil.startWebSocket(function (res) {
                console.log('读证读卡ws链接状态1111', res)
                if (res) {
                    cardutil.certWsStatus = true;
                    readCard.rdTransmitCard(Apdu, CardName, rdTransmitCard);
                } else {
                    cardutil.certWsStatus = false;
                    var retcode = {
                        err_code: -1,
                        err_msg: 'ws连接失败，查看服务是否启动！！！',
                        data: ''
                    }
                    rdTransmitCard(retcode);
                }
            });
        }
    },
    //断开卡
    rdDisconnectCard: function (rdDisconnectCardcallback) {
        if (cardutil.certWsStatus) {
            cardutil.wsDisconnectCard(function (openCallback) {
                // console.log('断开卡回调', openCallback)
                rdDisconnectCardcallback(openCallback);
            })
        } else {
            readCard.rdReconnect('rdDisconnectCard', function (resp) {
                rdDisconnectCardcallback(resp);
            });
        }
    },
    rdReconnect: function (params, rdReconnectCallback) {
        // 连接ws
        cardutil.startWebSocket(function (res) {
            console.log('读证读卡ws链接状态1111', res)
            if (res) {
                cardutil.certWsStatus = true;
                if (params == 'rdListCard') {
                    readCard.rdListCard(rdReconnectCallback);
                }
                if (params == 'rdConnectCard') {
                    readCard.rdConnectCard(rdReconnectCallback);
                }
                if (params == 'rdDisconnectCard') {
                    readCard.rdDisconnectCard(rdReconnectCallback);
                }
            } else {
                cardutil.certWsStatus = false;
                var retcode = {
                    err_code: -1,
                    err_msg: 'ws连接失败，查看服务是否启动！！！',
                    data: ''
                }
                rdReconnectCallback(retcode);
            }
        });
    },
};