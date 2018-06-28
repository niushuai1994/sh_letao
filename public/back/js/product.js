/**
 * Created by niushuai on 2018/6/28.
 */


$(function() {

  var currentPage = 1;
  var pageSize = 2;
  // 定义一个数组,专门用于存储所有上传的图片地址
  var picArr = [];

  // 1 一进入页面就进行渲染
  render();

  function render(){
    $.ajax({
      type: 'get',
      url: '/product/queryProductDetailList',
      data: {
        page: currentPage,
        pageSize: pageSize
      },
      dataType: 'json',
      success: function (info) {
        //console.log(info);
        var htmlStr = template("productTpl", info);

        $('tbody').html(htmlStr);

        // 分页初始化
        $('#paginator').bootstrapPaginator({
          bootstrapMajorVersion: 3,
          totalPages:Math.ceil(info.total / info.size),
          currentPage:info.page,
          // 控件大小
          size:"mini",

          // 配置按钮的显示文字
          itemTexts: function(type, page, current){
            switch(type) {
              case "first":
                return "首页";
              case "prev":
                return "上一页";
              case "next":
                return "下一页";
              case "last":
                return "尾页";
              case "page":
                return page;
            }
          },

          // 配置每个按钮的title
          tooltipTitles: function(type, page, current){
            switch(type) {
              case "first":
                return "首页";
              case "prev":
                return "上一页";
              case "next":
                return "下一页";
              case "last":
                return "尾页";
              case "page":
                return "前往第" + page + "页";
            }
          },

          // 使用bootstrap 的提示框
          useBootstrapTooltip: true,

          onPageClicked: function(a, b, c, page){
            // 更新当前页
            currentPage = page;
              // 重新渲染
            render();
          }
        })
      }
    })
  }


  // 2 点击添加商品显示模态框
  $('#addBtn').click(function() {
    $('#addModal').modal('show');

    // 请求所有二级分类数据,进行渲染下拉菜单
    $.ajax({
      type:'get',
      url:"/category/querySecondCategoryPaging",
      data: {
        page: 1,
        pageSize: 100
      },
      dataType: 'json',
      success: function (info){
        //console.log(info);
        var htmlStr = template('dropdownTpl', info);
        $('.dropdown-menu').html(htmlStr);
      }
    })
  });


  // 3 通过事件委托,给每个a添加点击事件
  $('.dropdown-menu').on('click', 'a', function (){
    // 设置文本
    var txt = $(this).text();
    console.log(txt);
    $('.dropdownTxt').text(txt);

    // 将 id 设置到隐藏域中
    var id = $(this).data('id');
    $('[name="brandId"]').val(id);

    // 手动重置隐藏域校验状态
    $('#form').data('bootstrapValidator').updateStatus("brandId", "VALID");
  });

 // 4 进行图片上传初始化
  // 文件上传说明 上传三张图片

  $('#fileupload').fileupload({
    // 配置返回的数据类型
    dataType:'json',
    // 配置图片上传成功后台的回调函数
    done: function (e, data){
      console.log(data.result);
      var picUrl = data.result.picAddr;
      // 每次上传成功,将图片地址和图片名称的对象,推到picArr 数组的最前面 和图片结构同步
      picArr.unshift(data.result);

      // 根据图片地址进行图片预览
      $('#imgBox').prepend('<img src="' + picUrl + '"width="100" height="100">');

      // 如果长度大于,就应该删除
      if(picArr.length > 3){
        // 图片数组要删除最后一个,(最在添加的那个)
        picArr.pop();
        // 图片结构也要删除最后一个图片
        $('#imgBox img:last-of-type').remove();
      }


      // 如果picArr 数组长度等于3 就说明当前用户已经上传满了3张图片
      // 需要手动重置图片校验状态为 成功VALID 状态
      if(picArr.length === 3) {
        $('#form').data('bootstrapValidator').updateStatus("picStatus", "VALID");
      }
      console.log(picArr);
    }
  });

  // 5 通过表单验证插件,实现表单校验

  $('#form').bootstrapValidator({
    // 配置

    excluded: [],
    // 配置图标
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',  // 校验成功
      invalid: 'glyphicon glyphicon-remove',  // 校验失败
      validating: 'glyphicon glyphicon-refresh' //校验中
    },

    // 配置校验字段
    fields: {
      brandId:{
        validators:{
          notEmpty:{
            message: "请选择二级分类"
          }
        }
      },
      proName: {
        validators:{
          notEmpty: {
            message: "请输入商品名称"
          }
        }
      },
      proDesc: {
        validators:{
          notEmpty: {
            message: "请输入商品描述"
          }
        }
      },
      num: {
        validators:{
          notEmpty: {
            message: "请输入商品库存"
          },
          // 正则校验
          regexp: {
            regexp: /^[1-9]\d*$/,
              message:'商品库存必须是非零开头的数字'
            }
          }
        },
      // 尺码校验
      size: {
        validators:{
          notEmpty: {
            message: "请输入商品尺码"
          },
          // 正则校验
          regexp: {
            regexp: /^\d{2}-\d{2}$/,
            message: '商品尺码必须是 xx-xx 的格式, 例如32-40'
          }
        }
      },
      oldPrice: {
        validators:{
          notEmpty: {
            message: "请输入商品原价"
          }
        }
      },
      price: {
        validators:{
          notEmpty: {
            message: "请输入商品现价"
          }
        }
      },
      picStatus: {
        validators:{
          notEmpty: {
            message: "请上传了 3 张"
          }
        }
      }
    }
  });


  // 6 注册表单校验成功事件,阻止默认的提交,通过ajax提交
  $('#form').on('success.form.bv', function (e){
    e.preventDefault();

    console.log($('#form').serialize());
    var paramsStr = $('#form').serialize(); // 获取表单中的数据

    //还需要拼接图片的地址和名称
    paramsStr += "&picAddr1=" + picArr[0].picAddr + "&picName1=" + picArr[0].picName;
    paramsStr += "&picAddr1=" + picArr[1].picAddr + "&picName1=" + picArr[1].picName;
    paramsStr += "&picAddr1=" + picArr[2].picAddr + "&picName1=" + picArr[2].picName;

    $.ajax({
      type: 'post',
      url:'/product/addProduct',
      data: paramsStr,
      dataType: 'json',
      success: function(info){
        console.log(info);
        if(info.success){
          // 隐藏模态框
          $('#addModal').modal('hide');
          // 重置表单内容
          $('#form').data('bootstrapValidator').resetForm(true);
          // 重新渲染第一页
          currentPage = 1;
          render();

          // 手动重置文本
          $('#dropdownTxt').text('请选择二级分类');

          // 手动重置图片
          $('#imgBox img').remove();
        }
      }
    })
  })
});