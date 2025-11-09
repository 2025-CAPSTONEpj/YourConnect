//1초마다
let id = setInterval(function () {
    console.log("출력합니다.");
}, 1000);

//3초 후에
setTimeout(function () {
    //타이머를 제거합니다
    clearInterval(id);
}, 3000);