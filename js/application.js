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
    var FILE_NAME = "./space.json";     // 스페이스 파일 경로 [ root/space.json ]
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

        //Lock.hide();

        win.enterFullscreen();
        win.showDevTools();

        var Music = require("View/Music");

        viewController.pushView(new Music());

        space = JSON.parse(fs.readFileSync(FILE_NAME));

        vtouch.hit(space, function(_vtouch, _info) {

            if (_vtouch === null) console.log("과연 있는가");

            checkUser(_info);

            checkVTouch(_vtouch);

        });

        vtouch.listen(50416, function(isStart) {



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

    var pushView = function(_view) {

        viewController.pushView(_view);

    };

    var popView = function() {

        viewController.popView();

    };

    var trigger = function(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY, isHUE1, isHUE2, isPHOTO, isTHERMO, isMUSIC) {

        if (Lock.isLocked()) {

            Lock.trigger(vtouch, isLOCKHIT, isLOCKAREA);

        } else {

            if (isHUE1 > -1) trigger_hue1(vtouch, isHUE1);
            if (isHUE2 > -1) trigger_hue2(vtouch, isHUE2);
            if (isMUSIC > -1) trigger_music(vtouch, isMUSIC);

            if (isPHOTO > -1) trigger_photo(vtouch, isPHOTO);
            if (isTHERMO > -1) trigger_thermo(vtouch, isTHERMO);

            viewController.getCurrentView().trigger(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY, isHUE1, isHUE2, isPHOTO, isTHERMO, isMUSIC);

            if (isLOCKAREA > -1) trigger_unlock(vtouch, isLOCKAREA);

        }

    };

    var getLock = function() {

        return lock;

    };

    var checkUser = function (_info) {

        if (isOn === null) { // # 처음 프로그램이 실행되어 있으면, isOn 이 null

            if (_info.userCountInCamera > 0) {

                console.log("처음이다. 켜져랏!");
                tvOn();

            }

        } else if (isOn) { // # 켜진 상태

            if (_info.userCountInCamera < 1) userCountInCameraCount++;

            if (userCountInCameraCount > stopFrame) {

                console.log("사람없다. 꺼져랏!");
                tvOff();

            }

        } else if (!isOn) {

            if (_info.userCountInCamera > 0) {

                console.log("사람왔다. 켜져랏!");
                tvOn();

            }

        }

    };

    // private tv 끄기
    var tvOff = function () {

        // 전등 끄기
        //Switch.turnOff();

        Users = [
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null }
        ];

        // Data
        userCountInCameraCount = stopFrame;
        isOn = false;

        Lock.show(function() {

            Lock.tv_on();
            //Lock.showBtn();

            viewController.popViewToRoot();
            viewController.getCurrentView().index = 1;
            viewController.getCurrentView().updateView(0);
            Hue.turnOnAll();

        });

    };

    // private tv 켜기
    var tvOn = function () {

        // 검은 화면에서 TV 로고와 언락 버튼 띄우기
        Lock.show();
        Lock.tv_on();
        //Lock.showBtn();

        // 데이타 바인딩
        userCountInCameraCount = 0;
        isOn = true;
        Hue.turnOnAll();

    };

    var checkVTouch = function (vtouch) {

        var isLOCKHIT = -1;
        var isLOCKAREA = -1;
        var isDISPLAY = -1;
        var isHUE1 = -1;
        var isHUE2 = -1;
        var isPHOTO = -1;
        var isTHERMO = -1;
        var isMUSIC = -1;

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

                        if (touch.id == "DISPLAY" || touch.id == "L" || touch.id == "TL" || touch.id == "T" || touch.id == "TR" || touch.id == "R" || touch.id == "BR" || touch.id == "B" || touch.id == "BL") {
                            // 화면
                            isDISPLAY = i;

                        } else if (touch.id == "HUE1") isHUE1 = i;
                        else if (touch.id == "HUE2") isHUE2 = i;
                        else if (touch.id == "PHOTO") {
                            // 포토
                            isPHOTO = i;

                        } else if (touch.id == "THERMO") {
                            // 온도계
                            isTHERMO = i;

                        } else if (touch.id == "MUSIC") {
                            // 뮤직
                            isMUSIC = i;

                        }

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

        if (isLOCKHIT > -1 && !Lock.isLocked()) Notification.Lock.show();

        trigger(vtouch, isLOCKHIT, isLOCKAREA, isDISPLAY, isHUE1, isHUE2, isPHOTO, isTHERMO, isMUSIC);

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

    var trigger_music = function (vtouch, isMUSIC) {

        if (isFirstUserInMusic > -1) {

            if (Users[isFirstUserInMusic].vtouch_m === undefined) return;
            if (Users[isFirstUserInMusic].vtouch_m === null) return;

            // 우선권을 가지고 있는 넘이 업을 하는 케이스,
            // 그렇치 않으면 소용이 없어
            if (vtouch[isFirstUserInMusic].trigger == "U") { // 그런 인간이 있다면?? 락 풀리고 페이지 이동.

                var touch = Users[isFirstUserInMusic].vtouch_m;

                if (touch.id == "MUSIC") m.switch("U");

                isFirstUserInMusic = -1;

            } else if (vtouch[isFirstUserInMusic].trigger == "NU") {

                isFirstUserInMusic = -1;

            } else if (vtouch[isFirstUserInMusic].trigger == "N") {

                isFirstUserInMusic = -1;

            } else if (vtouch[isFirstUserInMusic].trigger == "D") {

                var touch = Users[isFirstUserInMusic].vtouch_m;

                if (touch.id == "MUSIC") m.switch("D");

            }

        }

        if (isMUSIC > -1) {

            var isFirst = -1;

            for (var i = 0; i < 6; i++) {

                if (Users[i].tracking == 1 && Users[i].triggerState == 0 && Users[i].isDownCount == 1) {

                    var touch = (Users[i].isRight) ? vtouch[i].right : vtouch[i].left;

                    if (touch.isHit) {

                        if (touch.id == "MUSIC") isFirst = i;

                    }

                }

            }

            if (isFirst > -1) { // 첫 다운이 있으면 우선권에 저장.

                isFirstUserInMusic = isFirst;

                var touch = (Users[isFirstUserInMusic].isRight) ? vtouch[isFirstUserInMusic].right : vtouch[isFirstUserInMusic].left;

                if (touch.isHit) {

                    Users[isFirstUserInMusic].vtouch_m = {};
                    Users[isFirstUserInMusic].vtouch_m.id = touch.id;
                    Users[isFirstUserInMusic].vtouch_m.point = {};
                    Users[isFirstUserInMusic].vtouch_m.point.x = touch.point.x;
                    Users[isFirstUserInMusic].vtouch_m.point.y = touch.point.y;

                    if (touch.id == "MUSIC") m.switch("D");


                }

            }

        }

    };

    var trigger_photo = function (vtouch, isPHOTO) {

        if (isFirstUserInPhoto > -1) {

            if (Users[isFirstUserInPhoto].vtouch_p === undefined) return;
            if (Users[isFirstUserInPhoto].vtouch_p === null) return;

            // 우선권을 가지고 있는 넘이 업을 하는 케이스,
            // 그렇치 않으면 소용이 없어
            if (vtouch[isFirstUserInPhoto].trigger == "U") { // 그런 인간이 있다면?? 락 풀리고 페이지 이동.

                var touch = Users[isFirstUserInPhoto].vtouch_p;

                if (touch.id == "PHOTO") {

                    var PhotoList = require("View/PhotoList");
                    viewController.popViewToRoot();
                    pushView(new PhotoList());

                }

                isFirstUserInPhoto = -1;

            } else if (vtouch[isFirstUserInPhoto].trigger == "NU") {

                isFirstUserInPhoto = -1;

            } else if (vtouch[isFirstUserInPhoto].trigger == "N") {

                isFirstUserInPhoto = -1;

            } else if (vtouch[isFirstUserInPhoto].trigger == "D") {

                var touch = Users[isFirstUserInPhoto].vtouch_p;

            }

        }

        if (isPHOTO > -1) {

            var isFirst = -1;

            for (var i = 0; i < 6; i++) {

                if (Users[i].tracking == 1 && Users[i].triggerState == 0 && Users[i].isDownCount == 1) {

                    var touch = (Users[i].isRight) ? vtouch[i].right : vtouch[i].left;

                    if (touch.isHit) {

                        if (touch.id == "PHOTO") isFirst = i;

                    }

                }

            }

            if (isFirst > -1) { // 첫 다운이 있으면 우선권에 저장.

                isFirstUserInPhoto = isFirst;

                var touch = (Users[isFirstUserInPhoto].isRight) ? vtouch[isFirstUserInPhoto].right : vtouch[isFirstUserInPhoto].left;

                if (touch.isHit) {

                    Users[isFirstUserInPhoto].vtouch_p = {};
                    Users[isFirstUserInPhoto].vtouch_p.id = touch.id;
                    Users[isFirstUserInPhoto].vtouch_p.point = {};
                    Users[isFirstUserInPhoto].vtouch_p.point.x = touch.point.x;
                    Users[isFirstUserInPhoto].vtouch_p.point.y = touch.point.y;

                }

            }

        }

    };

    var trigger_thermo = function (vtouch, isTHERMO) {

        if (isFirstUserInThermo > -1) {

            if (Users[isFirstUserInThermo].vtouch_t === undefined) return;
            if (Users[isFirstUserInThermo].vtouch_t === null) return;

            // 우선권을 가지고 있는 넘이 업을 하는 케이스,
            // 그렇치 않으면 소용이 없어
            if (vtouch[isFirstUserInThermo].trigger == "U") { // 그런 인간이 있다면?? 락 풀리고 페이지 이동.

                var touch = Users[isFirstUserInThermo].vtouch_t;

                if (touch.id == "THERMO") {

                    var Thermo = require("View/Thermo");
                    viewController.popViewToRoot();
                    pushView(new Thermo());

                }

                isFirstUserInThermo = -1;

            } else if (vtouch[isFirstUserInThermo].trigger == "NU") {

                isFirstUserInThermo = -1;

            } else if (vtouch[isFirstUserInThermo].trigger == "N") {

                isFirstUserInThermo = -1;

            } else if (vtouch[isFirstUserInThermo].trigger == "D") {

                var touch = Users[isFirstUserInThermo].vtouch_t;

            }

        }

        if (isTHERMO > -1) {

            var isFirst = -1;

            for (var i = 0; i < 6; i++) {

                if (Users[i].tracking == 1 && Users[i].triggerState == 0 && Users[i].isDownCount == 1) {

                    var touch = (Users[i].isRight) ? vtouch[i].right : vtouch[i].left;

                    if (touch.isHit) {

                        if (touch.id == "THERMO") isFirst = i;

                    }

                }

            }

            if (isFirst > -1) { // 첫 다운이 있으면 우선권에 저장.

                isFirstUserInThermo = isFirst;

                var touch = (Users[isFirstUserInThermo].isRight) ? vtouch[isFirstUserInThermo].right : vtouch[isFirstUserInThermo].left;

                if (touch.isHit) {

                    Users[isFirstUserInThermo].vtouch_t = {};
                    Users[isFirstUserInThermo].vtouch_t.id = touch.id;
                    Users[isFirstUserInThermo].vtouch_t.point = {};
                    Users[isFirstUserInThermo].vtouch_t.point.x = touch.point.x;
                    Users[isFirstUserInThermo].vtouch_t.point.y = touch.point.y;

                }

            }

        }

    };

    var setVolume = function (_upAndDown) {

        if (_upAndDown == "up") volume = (volume + 0.1 <= 1) ? volume + 0.1 : 1;
        else if (_upAndDown == "down") volume = (volume - 0.1 >= 0) ? volume - 0.1 : 0;

        Notification.Volume.setVolume(volume);

    };

    var getVolume = function (_upAndDown) {

        return volume;

    };

    var power = function () {

        Users = [
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null },
            { tracking: -1, triggerState: -1, isRight: null, vtouch: null, vtouchs: null }
        ];

        Lock.show(function() {

            Lock.tv_on();
            //Lock.showBtn();

            viewController.popViewToRoot();
            viewController.getCurrentView().index = 1;
            viewController.getCurrentView().updateView(0);
            Hue.turnOnAll();

        });

    };

    var home = function () {

        viewController.popViewToRoot();

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

        pushView:pushView,

        popView:popView,

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

        power:power,

        reload:reload,

        home:home,

        trigger_music:trigger_music,

        trigger_photo:trigger_photo,

        trigger_thermo:trigger_thermo,

        toggle:toggle,

        left:left,

        right:right

    };

}());

global.getApplication = function () {

    return Application;

};