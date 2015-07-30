/**
 * Created by leewoongjae on 15. 7. 6..
 */
var Application = (function () {
    "use strict";

    var $ = global.window.$;

    var viewController = null;
    var Lock = null;

    var gui = require("nw.gui");
    var win = gui.Window.get();

    var isDebug = true;

    var userCountInCameraCount = 0;
    var isOn = null;
    var stopFrame = 10;
    var isReady = true;
    var isFirstUser = -1;
    var isFirstUserLock = -1;

    var isFirstUserInMusic = -1;
    var isFirstUserInPhoto = -1;
    var isFirstUserInThermo = -1;

    var volume = 0.5;

    var Users = [
        {
            tracking:-1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        },
        {
            tracking: -1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        },
        {
            tracking: -1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        },
        {
            tracking:-1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        },
        {
            tracking: -1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        },
        {
            tracking: -1,
            triggerState: -1,
            isRight: null,
            vtouch: null,
            vtouch_s: null,
            vtouch_m: null,
            vtouch_p: null,
            vtouch_t: null,
            vtouchs: null
        }
    ];

    /*
     * 스페이스 관련
     */
    var FILE_NAME = "./2woongjae.json";     // 스페이스 파일 경로 [ root/space.json ]
    var space = {
        kinect:{
            position:{x:0,y:0,z:0},
            angle:{x:0,y:0,z:0}
        },
        objects:[]
    };

    var fs = require("fs");
    var vtouch = require("vtouch");

    var getViewController = function () {

        return viewController;

    };

    var run = function () {

        viewController = require("view-controller");
        
        Lock = require("Lock");
        Lock.show();
        Lock.tv_on();

        win.enterFullscreen();
        win.showDevTools();

        var Music = require("View/Music");

        viewController.pushView(new Music());

        space = JSON.parse(fs.readFileSync(FILE_NAME));

        vtouch.hit(space, function(_vtouch, _info) {

            if (_vtouch === null) console.log("과연 있는가");

            checkVTouch(_vtouch);

        });

        vtouch.listen(50416, function(isRunning) {

            if (!isRunning) alert("포트에 문제가 있음.");

        });

    };

    var cancel = function(_id) {

        var str = "";

        for (var i = 0; i < 6; i++) {

            if (_id == i) str = str + 1;
            else str = str + 0;

            if (i == 5) vtouch.cancel(str);

        }

    };

    var trigger = function(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY) {

        if (Lock.isLocked()) Lock.trigger(vtouch, isLOCKHIT, isLOCKAREA);
        else viewController.getCurrentView().trigger(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY);

    };

    var getLock = function() {

        return lock;

    };

    var checkVTouch = function (vtouch) {

        var isLOCKHIT = -1;
        var isLOCKAREA = -1;
        var isDISPLAY = -1;

        // 영역 구분 처리
        for (var i = 0; i < 6; i++) {

            if (vtouch[i].isTracking) {

                // 시작 - 유저의 현재 트리거 스테이트 계산
                if (vtouch[i].trigger == "D") { // D

                    if (Users[i].triggerState == -1) {

                        Users[i].triggerState = 0;
                        Users[i].isDownCount = 1;

                    } else if (Users[i].triggerState == 0) {

                        Users[i].isDownCount++;

                    }

                } else if (vtouch[i].trigger == "U") { // U

                    if (Users[i].triggerState == 0) {

                        Users[i].triggerState = 1;

                    }

                } else if (vtouch[i].trigger == "NU") { // NU


                } else { // N

                    Users[i].triggerState = -1;
                    Users[i].isDownCount = 0;

                }
                // 끝 - 유저의 현재 트리거 스테이트 계산

                if (Users[i].tracking == -1) { // 없다.

                    Users[i].tracking = 0;
                    console.log("Users " + i + " 이 카메라에 새로 등장함.");

                } else if (Users[i].tracking == 0) { // *** 락된 사용자

                    if (Lock.isLocked()) {

                        if ((vtouch[i].right.isHit || vtouch[i].left.isHit) && (vtouch[i].right.id == "DISPLAY" || vtouch[i].left.id == "DISPLAY")) {

                            if (isLockArea(vtouch[i])) {

                                isLOCKAREA = i;

                            }

                            isLOCKHIT = i;

                        }

                    } else {

                        if ((vtouch[i].right.isHit || vtouch[i].left.isHit) && (vtouch[i].right.id == "DISPLAY" || vtouch[i].left.id == "DISPLAY")) {

                            if (isLockAreaInUse(vtouch[i])) {

                                isLOCKAREA = i;

                            }

                            isLOCKHIT = i;

                        }

                    }

                } else if (Users[i].tracking == 1) { // *** 언락된 사용자

                    if (Users[i].isRight === null) console.log("언락된 사용자가 'Users[i].isRight === null' 코드 오류");

                    // 각 스페이스 별로 주도자 설정
                    var touch = (Users[i].isRight) ? vtouch[i].right : vtouch[i].left;

                    if (touch.isHit) {

                        if (touch.id == "DISPLAY" || touch.id == "L" || touch.id == "R") isDISPLAY = i;

                    }

                }

            } else {

                if (Users[i].tracking != -1) {

                    Users[i].tracking = -1;
                    Users[i].triggerState = -1;
                    Users[i].isRight = null;
                    Users[i].isDownCount = 0;

                    console.log("Users " + i + " 이 카메라에서 사라짐.");

                }

            }

        }

        trigger(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY);

    /*

        var isLOCKHIT = -1;
        var isLOCKAREA = -1;
        var isDISPLAY = -1;

        // 영역 구분 처리
        for (var i = 0; i < 6; i++) {

            if (vtouch[i].isTracking) {

                // 시작 - 유저의 현재 트리거 스테이트 계산
                if (vtouch[i].vision_state == "S") { // D

                    Users[i].triggerState = 0;
                    Users[i].isDownCount = 1;

                } else if (vtouch[i].vision_state == "C") { // U

                    if (Users[i].triggerState == 0) {

                        Users[i].triggerState = 1;

                    }

                } else if (vtouch[i].vision_state == "D") { // NU

                    if (Users[i].triggerState == -1) {

                        Users[i].triggerState = -1;
                        Users[i].isDownCount = 0;

                    } else if (Users[i].triggerState == 0) {

                        Users[i].isDownCount++;

                    }

                } else if (vtouch[i].vision_state == "N") { // NU

                    if (Users[i].triggerState == -1) {

                        Users[i].triggerState = -1;
                        Users[i].isDownCount = 0;

                    } else if (Users[i].triggerState == 0) {

                        Users[i].isDownCount++;

                    }

                }
                // 끝 - 유저의 현재 트리거 스테이트 계산

                if (Users[i].tracking == -1) { // 없다.

                    Users[i].tracking = 0;
                    console.log("Users " + i + " 이 카메라에 새로 등장함.");

                } else if (Users[i].tracking == 0) { // *** 락된 사용자

                    if (Lock.isLocked()) {

                        if ((vtouch[i].right.isHit || vtouch[i].left.isHit) && (vtouch[i].right.id == "DISPLAY" || vtouch[i].left.id == "DISPLAY")) {

                            if (isLockArea(vtouch[i])) {

                                isLOCKAREA = i;

                            }

                            isLOCKHIT = i;

                        }

                    } else {

                        if ((vtouch[i].right.isHit || vtouch[i].left.isHit) && (vtouch[i].right.id == "DISPLAY" || vtouch[i].left.id == "DISPLAY")) {

                            if (isLockAreaInUse(vtouch[i])) {

                                isLOCKAREA = i;

                            }

                            isLOCKHIT = i;

                        }

                    }

                } else if (Users[i].tracking == 1) { // *** 언락된 사용자


                    if (Users[i].isRight === null) console.log("언락된 사용자가 'Users[i].isRight === null' 코드 오류");

                    // 각 스페이스 별로 주도자 설정
                    var touch = (Users[i].isRight) ? vtouch[i].right : vtouch[i].left;

                    if (touch.isHit) {

                        if (touch.id == "DISPLAY" || touch.id == "L" || touch.id == "R") isDISPLAY = i;

                    }

                }

            } else {

                if (Users[i].tracking != -1) {

                    Users[i].tracking = -1;
                    Users[i].triggerState = -1;
                    Users[i].isRight = null;
                    Users[i].isDownCount = 0;

                    console.log("Users " + i + " 이 카메라에서 사라짐.");

                }

            }

        }

        trigger(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY);
    */
    };

    var getIsRight = function (vtouch) {

        if (vtouch.right.isHit && vtouch.left.isHit) {

            if (vtouch.right.id == "DISPLAY" && vtouch.left.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var left = getScreenPoint(vtouch.left.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 200 && right.y < 540 + 340);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 200 && left.y < 540 + 340);

                if (isR && isL) {

                    console.log("우세안 위치로 비교 right : " + Math.abs(right.x - 960) + ", left : " + Math.abs(left.x - 960));

                    if (Math.abs(right.x - 960) <= Math.abs(left.x - 960)) {

                        return true;

                    } else {

                        return false;

                    }

                } else if (isR) {

                    return true;

                } else if (isL) {

                    return false;

                }

            } else if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 200 && right.y < 540 + 340);

                if (isR) {

                    return true;

                }

            } else if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 200 && left.y < 540 + 340);

                if (isL) {

                    return false;

                }

            }

        } else if (vtouch.right.isHit) {

            if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 200 && right.y < 540 + 340);

                if (isR) {

                    return true;

                }

            }

        } else if (vtouch.left.isHit) {

            if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);

                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 200 && left.y < 540 + 340);

                if (isL) {

                    return false;

                }

            }

        }

        return true;

    };

    var isLockArea = function (vtouch) {

        var i = vtouch.id;

        if (vtouch === undefined) return;
        if (vtouch === null) return;
        if (!vtouch.isTracking) return;

        if (vtouch.right.isHit && vtouch.left.isHit) {

            if (vtouch.right.id == "DISPLAY" && vtouch.left.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var left = getScreenPoint(vtouch.left.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 400 && right.y < 540 + 340);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 400 && left.y < 540 + 340);

                if (isR && isL) {

                    if (Math.abs(right.x - 960) <= Math.abs(left.x - 960)) {

                        return true;

                    } else {

                        return true;

                    }

                } else if (isR) {

                    return true;

                } else if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 400 && right.y < 540 + 340);

                if (isR) {

                    return true;

                } else {

                    return false;

                }

            } else if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 400 && left.y < 540 + 340);

                if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;

            }

        } else if (vtouch.right.isHit) {

            if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 540 - 400 && right.y < 540 + 340);

                if (isR) {

                    return true;

                } else {

                    return false;

                }

            }

        } else if (vtouch.left.isHit) {

            if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);

                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 540 - 400 && left.y < 540 + 340);

                if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;

            }

        } else {

            return false;

        }

        return false;

    };


    var isLockAreaInUse = function (vtouch) {

        var i = vtouch.id;

        if (vtouch === undefined) return;
        if (vtouch === null) return;
        if (!vtouch.isTracking) return;

        if (vtouch.right.isHit && vtouch.left.isHit) {

            if (vtouch.right.id == "DISPLAY" && vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var left = getScreenPoint(vtouch.left.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 520 && right.y < 1080);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 520 && left.y < 1080);

                if (isR && isL) {

                    if (Math.abs(right.x - 960) <= Math.abs(left.x - 960)) {

                        return true;

                    } else {

                        return true;

                    }

                } else if (isR) {

                    return true;

                } else if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);
                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 520 && right.y < 1080);

                if (isR) {

                    return true;

                } else {

                    return false;

                }

            } else if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);
                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 520 && left.y < 1080);

                if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;

            }

        } else if (vtouch.right.isHit) {

            if (vtouch.right.id == "DISPLAY") {

                var right = getScreenPoint(vtouch.right.point);

                var isR = (right.x > 960 - 300 && right.x < 960 + 300 && right.y > 520 && right.y < 1080);

                if (isR) {

                    return true;

                } else {

                    return false;

                }

            }

        } else if (vtouch.left.isHit) {

            if (vtouch.left.id == "DISPLAY") {

                var left = getScreenPoint(vtouch.left.point);

                var isL = (left.x > 960 - 300 && left.x < 960 + 300 && left.y > 520 && left.y < 1080);

                if (isL) {

                    return true;

                } else {

                    return false;

                }

            } else {

                return false;

            }

        } else {

            return false;

        }

        return false;

    };

    var trigger_unlock = function (vtouch, isLOCKAREA) {

        if (isFirstUserLock > -1) {

            if (vtouch[isFirstUserLock].trigger == "U") { // 그런 인간이 있다면?? 락 풀리고 페이지 이동.

                Users[isFirstUserLock].isRight = getIsRight(Users[isFirstUserLock].vtouch); // 우세안 설정
                Users[isFirstUserLock].tracking = 1; // 언락 상태
                Users[isFirstUserLock].vtouch = null;

                if (Users[isFirstUserLock].isRight) console.log("우안");
                else console.log("좌안");

                isFirstUserLock = -1;
                isReady = false; // 잠시 락을 위한 변수

                Notification.Lock.normalLock();
                Notification.Lock.upLock();

                setTimeout(function () {

                    isReady = true;

                }, 200);

                return; // 이벤트 종료

            } // 그런 인간이 아닌 사람의 업은 의미없다.

            if (vtouch[isFirstUserLock].trigger == "NU") {

                Users[isFirstUserLock].isRight = null;
                Users[isFirstUserLock].vtouch = null;

                isFirstUser = -1;

                Notification.Lock.normalLock();

                return; // 이벤트 종료

            }

            if (vtouch[isFirstUserLock].trigger == "N") {

                Users[isFirstUserLock].isRight = null;
                Users[isFirstUserLock].vtouch = null;

                isFirstUserLock = -1;

                Notification.Lock.normalLock();

                return; // 이벤트 종료

            }

            if (isFirstUserLock > -1) { // 원래 다운한 사람이 있음.

                if (vtouch[isFirstUserLock].trigger == "D") { // 원래 다운한 사람이 계속 다운하고 있음.

                    Notification.Lock.downLock();

                    return;

                } // 다운을 안한건 위에서 최상위로 처리

            }

        }

        if (isLOCKAREA > -1) { // 한명 이상이 언락 버튼에 손을 가져다 댔음

            var isFirst = -1;

            for (var i = 0; i < 6; i++) {

                if (Users[i].tracking == 0 && Users[i].triggerState == 0 && Users[i].isDownCount == 1) {

                    if (isLockAreaInUse(vtouch[i])) isFirst = i;

                }

            }

            if (isFirst > -1) { // 첫 다운이 있으면 우선권에 저장.

                isFirstUserLock = isFirst;
                Users[isFirstUserLock].vtouch = vtouch[isFirstUserLock];
                Notification.Lock.downLock();

            } else { // 첫 다운이 없음.

                isFirstUserLock = -1;
                Notification.Lock.normalLock();

            }

        }

    };

    var getUsers = function() {

        return Users;

    };

    var getScreenPoint = function (_point) {

        var x = Math.round(_point.x * 1920);
        var y = Math.round(_point.y * 1080);

        var point = { 'x': x, 'y': y };

        return point;

    };

    var setVolume = function (_upAndDown) {

        if (_upAndDown == "up") volume = (volume + 0.1 <= 1) ? volume + 0.1 : 1;
        else if (_upAndDown == "down") volume = (volume - 0.1 >= 0) ? volume - 0.1 : 0;

        Notification.Volume.setVolume(volume);

    };

    var getVolume = function (_upAndDown) {

        return volume;

    };

    var reset_select = function () {

        $(".select").fadeOut();

    };

    var reload = function() {

        vtouch.close(function() {

            win.reloadDev();

        });

    };

    var toggle = function() {

        viewController.getCurrentView().toggle();

    };

    var left = function() {

        viewController.getCurrentView().left("C");


    };

    var right = function() {

        viewController.getCurrentView().right("C");

    };

    return {

        run: run,

        getViewController: getViewController,

        cancel:cancel,

        trigger:trigger,

        getLock:getLock,

        getUsers:getUsers,

        isReady:isReady,

        isFirstUser:isFirstUser,

        isLockArea:isLockArea,

        getIsRight:getIsRight,

        trigger_unlock:trigger_unlock,

        getScreenPoint:getScreenPoint,

        setVolume:setVolume,

        getVolume:getVolume,

        reload:reload,

        toggle:toggle,

        left:left,

        right:right

    };

}());

global.getApplication = function () {

    return Application;

};