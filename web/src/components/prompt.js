const Prompt = {
    userError:"请输入正确的用户名",  //提示语
    passwordError:"密码输入不正确",
    verificationCode:"验证码错误",
    verificationStatus:["success","warning","error","validating"], //输入框验证错误样式
    checkPhone:(phone)=>{  //验证手机号码
        if(!(/^1[345789]\d{9}$/.test(phone))){
            return false;
        }
        return true;
    },
    checkTel:(tel)=>{ //验证固定电话号码
        if(!/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(tel)){
            return false;
        }
        return true;
    },
    checkUserId:(userId)=>{ //身份证验证
        if(!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(userId))){
            return false;
        }
        return true;
    },
    isNumber:(number)=>{ //数字验证
        if(!(/^-?\d+$/).test(number)){
            return false;
        }
        return true;
    },
    setCookie:(name, value, day)=>{
        if(day !== 0){     //当设置的时间等于0时，不设置expires属性，cookie在浏览器关闭后删除
        var expires = day * 24 * 60 * 60 * 1000;
        var date = new Date(+new Date()+expires);
            document.cookie = name + "=" + escape(value) + ";expires=" + date.toUTCString();
          }else{
            document.cookie = name + "=" + escape(value);
          }
    }
};
export default Prompt;