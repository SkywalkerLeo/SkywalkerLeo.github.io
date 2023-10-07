var containMainItemArr = document.getElementsByClassName("contain_main_item");
var testResultArr = [];
var testResultTextareaArr = document.getElementsByClassName("textarea_test_result");
var testResultT;  // 当前测试项的文本框

/**
 * 测试步骤：0-默认， 1-屏幕， 2-活体摄像头， 3-读证卡， 4-录音， 5-签字， 6-扫码
 */
var testStep = 0;
var testStepMax = 6;
var stepPostion = 0;


/**
 * 记录测试结果
 * @param {*} resCode 
 */
function testResultSubmit(resCode) {
    var result = {
        testStep: testStep,
        resCode: 0,
        message: ''
    };
    if (resCode === 0) {
        //测试通过
    } else {
        //测试不通过
        var testResultMessage = testResultT.value;
        console.log("测试不通过: " + testResultMessage);
        result.resCode = resCode;
        result.message = testResultMessage;
    }

    testResultArr[stepPostion] = result;

    console.log("testResultSubmit", testResultArr);

    // downloadExportFile(JSON.stringify(result), "result", "json");

    nextPage();
}

/**
 * 进入下一项测试
 */
function nextPage() {
    testStep++;

    if (testStep > testStepMax) {
        testStep = 0;
    }
    console.log("testStep: " + testStep);

    stepPostion = testStep > 0 ? (testStep - 1) : 0;

    for (var i = 0; i < containMainItemArr.length; i++) {
        containMainItemArr[i].style.display = (i == testStep) ? "block" : "none";
        testResultT = testResultTextareaArr[stepPostion];
        testResultT.value = "";
    }

    switch (testStep) {
        case 2:
            // openLiveCamera(1, 0);
            readyToCameraTest();
            break;

        case 3:
            startReaderTest(0);
            break;

            case 4:
                startRecordingTest();
                break;

        case 6:
            var barcodeInput = document.getElementById("barcode_con_input");
            barcodeInput.value = "";
            barcodeInput.focus = true;
            break;
    }
}

/**
 * 导出到本地文件
 * @param {*} blob   数据
 * @param {*} fileName   文件名
 * @param {*} fileType   文件后缀名
 */
function downloadExportFile(blob, fileName, fileType) {
    var downloadElement = document.createElement("a");
    var href = blob;
    if (typeof blob == "string") {
        blob = new Blob([blob]);
    }

    downloadElement.href = window.URL.createObjectURL(blob); //创建下载的链接
    downloadElement.download = fileName + "." + fileType; //下载后文件名
    document.body.appendChild(downloadElement);
    downloadElement.click(); //触发点击下载
    document.body.removeChild(downloadElement); //下载完成移除元素
    window.URL.revokeObjectURL(href); //释放掉blob对象

}


/**
 * 屏幕测试 -start
 */

let isFullscreen = false;
let colors = ["red", "green", "blue", "yellow", "purple", "orange"];
let currentIndex = 0;

function toggleFullscreen() {
    const elem = document.documentElement;

    if (!isFullscreen) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        document.getElementById('panel_screen').style.display = 'none';
        elem.onclick = function () { changeColor(); };
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        document.getElementById('panel_screen').style.display = 'block';
        isFullscreen = false;
        currentIndex = 0;
        document.body.style.backgroundColor = 'white'; // 退出全屏后将背景颜色恢复为白色
    }
}

function changeColor() {
    if (isFullscreen) {
        if (currentIndex >= colors.length) {
            toggleFullscreen(); // 如果颜色切换完毕，退出全屏
        } else {
            document.body.style.backgroundColor = colors[currentIndex];
            currentIndex++;
        }
    }
}

/**
 * 屏幕测试 -end
 */


/**
 * 活体摄像头测试 -start
 */

var live_device_select = document.getElementsByClassName("device_select");
var video = document.getElementsByClassName('video_camera');
/**
 * 活体检测预览类型：0-web预览，1-系统弹窗预览
 */
var livePreviewType = 0;
// 双目摄像头
var live_device_select_list = [];
var liveCanvas = document.getElementById('canvas_camera');
var resoluteSpan = document.getElementsByClassName('resolute_span');

var liveCtx;
var cameraMax = 2;
var cameraInfo;
var stream_ = [];
var defaultCameraWidth = [], defaultCameraHeight = [];
var videoSelect = [];
var canvasPanel = document.getElementById('canvas_panel');

// 播放视频回调
function takePictureEvnt(i) {
    document.getElementById('canvas_panel').style.display = 'block';
    liveCanvas.setAttribute("width", defaultCameraWidth[i]);
    liveCanvas.setAttribute("height", defaultCameraHeight[i]);
    liveCtx = liveCanvas.getContext("2d");
    liveCtx.drawImage(video[i], 0, 0, defaultCameraWidth[i], defaultCameraHeight[i]);
}

function getStream(i) {
    clearVideo(i);
    function success(stream) {
        //兼容webkit核心浏览器
        //var CompatibleURL = window.URL || window.webkitURL;
        //将视频流设置为video元素的源
        stream_[i] = stream;
        //video.src = CompatibleURL.createObjectURL(stream);
        video[i].srcObject = stream;
        video[i].play();
    }

    function error(error) {
        console.log('访问用户媒体设备失败' + error);
    }

    var deviceId = cameraInfo[i].camera_name;
    videoSelect.forEach(function (v) {
        if (v.label.indexOf(deviceId) == 0) {
            deviceId = v.deviceId;
        }
    })
    var constraints = {
        audio: true,
        video: {
            width: defaultCameraWidth[i],
            height: defaultCameraHeight[i],
            deviceId: { exact: deviceId }
        }

    };
    resoluteSpan[i].innerHTML = defaultCameraWidth[i] + 'x' + defaultCameraHeight[i];
    getUserMedia(constraints, success, error);
}

//访问用户媒体设备的兼容方法
function getUserMedia(constraints, success, error) {
    if (navigator.mediaDevices.getUserMedia) {
        //最新的标准API
        // console.info("最新的标准API",constraints);
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(success)
            .catch(error);
    } else if (navigator.webkitGetUserMedia) {
        //webkit核心浏览器
        navigator.webkitGetUserMedia(constraints, success, error);
    } else if (navigator.mozGetUserMedia) {
        //firfox浏览器
        navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
        //旧版API
        navigator.getUserMedia(constraints, success, error);
    }
}

// 获取视频设备信息
function getVideoInfo() {
    navigator.mediaDevices.enumerateDevices()
        .then(function (deviceInfos) {
            console.log("deviceInfos", deviceInfos);

            var j = 0;
            for (var i = 0; i < deviceInfos.length; ++i) {
                if (deviceInfos[i].kind === 'videoinput') {
                    videoSelect[j] = deviceInfos[i];
                    j++;
                }
            }
            console.log("videoSelect", videoSelect);

            takePhoto.tpGetVideoInfo(function (retcode) {
                if (retcode.err_code == 0) {
                    cameraInfo = retcode.data;
                    cameraMax = cameraInfo.length;
                    console.log("cameraMax: " + cameraMax);
                    console.log("cameraInfo", cameraInfo);
                    for (var k = 0; k < cameraMax; k++) {
                        live_device_select[0].options[k] = new Option(cameraInfo[k].camera_name, k);
                        live_device_select[1].options[k] = new Option(cameraInfo[k].camera_name, k);
                    }
                    live_device_select[0].value = 0;
                    selectCamera(0, 0);
                    live_device_select[1].value = 1;
                    selectCamera(1, 1);
                } else {
                    testResultT.value += "获取设备信息失败：" + JSON.stringify(retcode) + "\r\n\r\n";
                }
            });

        }).catch(function (error) { testResultT.value += "获取设备失败：" + error + "\r\n\r\n"; });
};

function selectCamera(index, i) {
    var resoluteInfo = cameraInfo[index].resolution_info[0];
    defaultCameraHeight[i] = resoluteInfo.height;
    defaultCameraWidth[i] = resoluteInfo.width;
    getStream(i);
}

function readyToCameraTest() {

    //首次运行引导用户，信任域名
    if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        //调用用户媒体设备, 访问摄像头
        navigator.mediaDevices.enumerateDevices().then(function () { getVideoInfo(); })

    } else {
        alert('不支持访问用户媒体');
    }
}

function clearVideo(i) {
    if (stream_[i] != null) {
        try {
            // stream_.stop(); // if this method doesn't exist, the catch will be executed.
            if (stream_[i]) {
                stream_[i].getTracks().forEach(function (track) {
                    track.stop();
                });

                stream_[i] = null;
            }
        } catch (e) {

            stream_[i].getVideoTracks()[0].stop(); // then stop the first video track of the stream
        }
    }
}

function closeCanvas(){
    canvasPanel.style.display = 'none';
}

/**
 * 活体摄像头测试  -end
 */


/**
 * 读证读卡测试 -start
 */

// 秘钥参数，以下appKey 等密钥信息仅测试可用，随时到期，如须集成到系统上请联系售前技术工程师申请正式密钥信息集成
var appKey = "B2DFC06508BA46BAB4C42836D6CA3BC6";
var appSecret = "88974F519C804BBE8E20FB8C3B4065A5";
var password = "0F8AF5C047D949CCB2708838B322BC87";

var readerTips = document.getElementById("reader_tips");
var failTimesCountReadIDCard = 0;
var successTimesCountReadIDCard = 0;
var failTimesCountReadSimCard = 0;
var successTimesCountReadSimCard = 0;

function startReaderTest(step) {
    document.getElementById("btn_group_reader").style.display = "none";
    if (step == 0) {
        testResultT.value = "";
        readerTips.innerHTML = "请放置身份证在读证区域";
        failTimesCountReadIDCard = 0;
        successTimesCountReadIDCard = 0;

        setTimeout(function () { readIDCard(); }, 3000);
    } else {
        readerTips.innerHTML = "读证结束, 开始测试读接触式IC卡, 请插入接触式IC卡";
        failTimesCountReadSimCard = 0;
        successTimesCountReadSimCard = 0;
        setTimeout(function () { listCardEvent(); }, 3000);
    }
}

function processReadIDCardResult() {
    if (successTimesCountReadIDCard < 1 && failTimesCountReadIDCard < 2) {
        setTimeout(function () {
            testResultT.value = "";
            readIDCard();
        }, 3000);
    } else {
        //完成读证流程，开始读卡流程
        startReaderTest(1);
    }
}

function readIDCard() {

    var startTime = new Date().getTime();
    readCert.rcSetAppParamEx(appKey, appSecret, password, function (retcode) {
        if (retcode.resultFlag == 0) {
            readCert.rcReadCardEx(function (retcode) {
                // console.log("读证返回", retcode);
                if (retcode.resultFlag == 0) {
                    //仅证件信息
                    var costTime = new Date().getTime() - startTime;
                    testResultT.value += "读证：" + JSON.parse(retcode.resultContent).name + "\r\n耗时：" + costTime + " 毫秒\r\n";
                    successTimesCountReadIDCard++;
                } else {
                    testResultT.value += "读证：" + JSON.stringify(retcode) + "\r\n";
                    failTimesCountReadIDCard++;

                }
                processReadIDCardResult();

            });
        } else {
            failTimesCountReadIDCard++;
            processReadIDCardResult();
        }
    });
}

function processReadSimCardResult() {
    if (successTimesCountReadSimCard < 1 && failTimesCountReadSimCard < 2) {
        setTimeout(function () {
            listCardEvent();
        }, 3000);
    } else {
        //完成读卡流程
        readerTips.innerHTML = "读证读卡测试结束";
        document.getElementById("btn_group_reader").style.display = "block";
    }
}

function listCardEvent() {
    readCard.rdListCard(function (retcode) {
        if (retcode.err_code == 0) {
            if (retcode.data) {
                this.CardName = retcode.data;
                connectCardEvent();
            } else {
                testResultT.value += "获取读卡设备：获取不到设备名字" + "\r\n";
                failTimesCountReadSimCard++;
                processReadSimCardResult();
            }
        } else {
            testResultT.value += "获取读卡设备：" + JSON.stringify(retcode) + "\r\n";
            failTimesCountReadSimCard++;
            processReadSimCardResult();
        }
        testResultT.scrollTop = testResultT.scrollHeight;
    });
}

//连接卡
function connectCardEvent() {
    readCard.rdConnectCard(function (retcode) {
        // console.log("链接卡", retcode);
        if (retcode.err_code == 0) {
            transmitCardEvent(0);
        } else {
            testResultT.value += "连接卡：" + JSON.stringify(retcode) + "\r\n";
            failTimesCountReadSimCard++;
            processReadSimCardResult();
        }
        testResultT.scrollTop = testResultT.scrollHeight;
    });
}

//发送APDU
function transmitCardEvent(index) {
    var apduData = ["A0A40000023F00", "A0A40000022FE2", "A0B000000A"];
    var Apdu = apduData[index];
    readCard.rdTransmitCard(Apdu, this.CardName, function (retcode) {
        // console.log("发送APDU", i, retcode);
        if (retcode.err_code == 0) {
            index = index + 1;
            if (index == apduData.length) {
                var cardRet = trim(retcode.data); //去掉空格
                if (cardRet.length != "24") {
                    testResultT.value += ("读取的卡号格式不对：" + cardRet);
                    failTimesCountReadSimCard++;
                    disconnectCardEvent(); //报错后要断开，否则再连会失败
                    return;
                }
                if (cardRet.substr(20, 4) != "9000") {
                    testResultT.value += ("读卡失败，返回码：" + cardRet.substr(20, 4));
                    failTimesCountReadSimCard++;
                    disconnectCardEvent(); //报错后要断开，否则再连会失败
                    return;
                }
                cardRet = cardRet.substr(0, 20);
                var cardNum = dealCardNum(cardRet);
                testResultT.value += "卡号1：" + cardNum + "\r\n";
                successTimesCountReadSimCard++;
                disconnectCardEvent();
            } else {
                transmitCardEvent(index);
            }
        } else {
            testResultT.value += "发送APDU：" + JSON.stringify(retcode) + "\r\n";
            testResultT.scrollTop = testResultT.scrollHeight;
            failTimesCountReadSimCard++;
            disconnectCardEvent();
        }
    });
}

//断开卡
function disconnectCardEvent() {
    readCard.rdDisconnectCard(function (retcode) {
        // console.log("断开卡", retcode);
        // cardtextarea.value += "断开卡：" + JSON.stringify(retcode) + "\r\n";
        // testResultT.scrollTop = testResultT.scrollHeight;
    });
    processReadSimCardResult();
}

function trim(str) {
    return str.replace(/\s+/g, "");
}

function dealCardNum(cardStr) {
    var cardLength = cardStr.length;
    var cardNum = "";
    for (var i = 0; i < cardLength; i++) {
        if (i % 2 == 0) {
            cardNum += cardStr.charAt(i + 1);
        } else {
            cardNum += cardStr.charAt(i - 1);
        }
    }
    return cardNum;
}

/**
 * 读证读卡测试 -end
 */


/**
 * 录音测试 -start
 */

var mediaRecorder;
var audioChunks = [];
var audioPlayer = document.getElementById('audio-player');
var startRecordingButton = document.getElementById('start-recording');
var stopRecordingButton = document.getElementById('stop-recording');
var audioContainer = document.getElementById('audio-container');

function startRecordingTest(){
    audioPlayer.src = "./assets/ringing.wav";
    audioPlayer.startPlay();
}


async function startRecording() {
    try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            var audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioPlayer.src = URL.createObjectURL(audioBlob);
            audioContainer.style.display = 'block';
        };

        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
    } catch (error) {
        console.error('无法获取录音设备:', error);
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
    }
}

/**
 * 录音测试 -end
 */


/**
 * 签字测试 -start
 */



/**
 * 签字测试 -end
 */


/**
 * 扫码测试 -start
 */

var barcodeBrochureStr = "asdfghjkl1234567890-.+=";

function barcodeInput(event) {
    if (event.keyCode == 13) {
        var inputStr = document.getElementById("barcode_con_input").value;
        inputStr = trim(inputStr);
        inputStr = inputStr.replace("\r\n", "");
        if (inputStr == barcodeBrochureStr) {
            testResultT.value = "扫码正确";
            // testResultT.value = "扫码正确 \r\n\r\n样例数据: " + barcodeBrochureStr + "\r\n\r\n扫描数据: " + inputStr;
        } else {
            testResultT.value = "扫码比对不一致 \r\n\r\n样例数据: " + barcodeBrochureStr + "\r\n\r\n扫描数据: " + inputStr;
        }
    } else {

    }
}

/**
 * 扫码测试 -end
 */