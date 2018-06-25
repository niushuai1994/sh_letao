
// 实现进度条功能 (给ajax请求加), 注意需要给所以的ajax都加
// 发送ajax开启进度条, ajax结束,关闭进度条

// 第一个ajax发送时,开启进度条
$(document).ajaxStart(function (){
  NProgress.start();
})

// 所以的ajax请求完成时调用, 关闭进度条
$(document).ajaxStop(function (){

  // 模拟网络延迟
  setTimeout(function (){
    NProgress.done();
  }, 500);
});

