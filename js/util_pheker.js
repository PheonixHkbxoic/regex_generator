(function($,w){

    //全局变量
    var vars = {
        languages:["c/c++","java","php","js","python","ruby"],//语言
        ids:["txt_right","txt_error"],//ids:正确实例,错误实例
        metaregtype:{
          itemdigit:"\\d",
          itemlower:"a-z",
          itemupper:"A-Z",
          itemmeta:"\\^\\$\\[\\]\\{\\}\\(\\)\\.\\*\\+\\\\<>\\/\\?",
          itemspace:"\\s",
          itemother:"^\\da-zA-Z\\s^$\\[\\]{}()\\.*+\\\\<>\\/\\?",
          itemall:"\\s\\S"
        },
        tools:{
            language:"c/c++",
            iswanna:"我想要",
            regselecttype:{//选中的正则类型
               itemdigit:"",
               itemlower:"",
               itemupper:"",
               itemmeta:"",
               itemspace:"",
               itemother:"",
               itemall:""
            },
            constants:"",
            lookaround:{

            }

        },
        txts:[],    //文本:正确实例,错误实例,生成的正则实例
        regexs:[],  //生成的正则
        judgeType:{
            isDigit:function(character){            //是否是数字
                return /\d/.test(character)?true:false;
            },
            isLowerCase:function(character){        //是否是小写字母
                return /[a-z]/.test(character)?true:false;
            },
            isUpperCase:function(character){        //是否是大写字母
                return /[A-Z]/.test(character)?true:false;
            },
            isLetter:function(character){
                return this.isLowerCase(character)||this.isUpperCase(character);
            },
            isRegexMetaCharacter:function(character){//是否是正则元字符
                return /[\.\*\+\?\[\]\(\)\{\}\-\\]/.test(character)?true:false;
            },
            isOther:function(character){
                return !(this.isDigit(character)
                    ||this.isLetter(character)
                    ||this.isRegexMetaCharacter(character));
            },
            getType:function(character){
                if(this.isDigit(character)){
                    return "number";
                }else if(this.isLetter(character)){
                    return "letter";
                }else if(this.isLowerCase(character)){
                    return "lower";
                }else if(this.isUpperCase(character)){
                    return "upper";
                }else if(this.isRegexMetaCharacter(character)){
                    return "meta";
                }else if(this.isOther(character)){
                    return "other";
                }
            },
            getReg:function(character){
                if(this.isDigit(character)){
                    return "\\d+";
                }else if(this.isLetter(character)){
                    return "[a-zA-Z]+";
                }else if(this.isLowerCase(character)){
                    return "[a-z]+";
                }else if(this.isUpperCase(character)){
                    return "[A-Z]+";
                }else if(this.isRegexMetaCharacter(character)){
                    return "[\\.\\*\\+\\?\\[\\]\\(\\)\\{\\}\\-\\\\]+";
                }else if(this.isOther(character)){
                    return "[^\\da-zA-Z\\.\\*\\+\\?\\[\\]\\(\\)\\{\\}\\-\\\\]+";
                }
            }
        },
        func:{
            toArrByType:toArrByType,
            uniqueStr : uniqueStr,
            contains : contains,
            assembleRegArr : assembleRegArr,
            filterMetaCharacterInRightRegArr : filterMetaCharacterInRightRegArr,
            escapeMetaCharacter : escapeMetaCharacter,
            noRepeat : noRepeat,
            isArr : isArr,
            resizeTextarea:resizeTextarea,
            getregselecttype:getregselecttype
        },
        nav:{
            agt:navigator.userAgent.toLowerCase(),
            is_op:function(){
                return (this.agt.indexOf("opera") != -1);
            },
            is_ie:function(){
                return (this.agt.indexOf("msie") != -1) && document.all && !is_op;
            }
        }

    }


    //将字符数组=>按照索引生成数组
    function toArrByIndex(arrs){
        var maxLen = 0;
        arrs.forEach(function(v,i,rer){
            maxLen = maxLen<v.length?v.length:maxLen;
        });
        var ret = new Array(maxLen);
        for(var i=0;i<arrs.length;i++){
            var item = arrs[i].split("");
            item.forEach(function(v,j,rer){
                var old = ret[j]?ret[j]:"";
                ret[j] = old+(v?v:"");
            });
        }
//      console.log(toArrByType(arrs));

        return ret;
    }

    //将正则字符串数组转换为按类别分类的正则数组     ["abc","ab123"] => [["[a-z]*"],["[a-z]","\d*"]]
    function toArrByType(arrs){
        var typeArrs = [];
        var typeLen = 0;//索引类型数,即类型列数,如:abc123 则列数为2, 但这个是所有列数中的最大列数
        var arr = [];
        arrs.forEach(function(v,j,ar){
            //[["ad", "123", "##"], ["a-zA-Z", "\d", "[^\da-zA-Z\.\*\+\?\[\]\(\)\{\}\-\\]"]]
            //[["qdd"], ["a-zA-Z"]]
            //==> [["ad","qdd","a-zA-Z"],["123","\d"],["##","[^\da-zA-Z\.\*\+\?\[\]\(\)\{\}\-\\]"]
            var tmp = str2ArrByType(v);
            if(tmp) {
                console.log("实例"+(j+1)+"分解中...");
                console.log(tmp);
                var len = tmp[0].length;
                typeLen = typeLen>len?typeLen:len;
                arr.push(tmp);
            }
        });

        //按索引分
        for (var i = 0; i < typeLen; i++) {//索引
        	var typeArr = [];
            for(var j=0;j<arr.length;j++){
        	    var regArr = arr[j];
//      	    console.log(regArr[0][i]);
                if((typeof(regArr[0][i])!= "undefined")&&!contains(typeArr,regArr[0][i])){
                    typeArr.push(regArr[0][i]);
                }
                if((typeof(regArr[0][i])!= "undefined")&&!contains(typeArr,regArr[1][i])){
                    typeArr.push(regArr[1][i]);
                }
            }
            console.log("按类型索引"+(i+1)+"重新分组中...");
            console.log(typeArr);
            typeArrs.push(typeArr);
        }



        return typeArrs;
    }

    //将字符串 转换为  按类别分类的正则数组      "ab123" =>  ["[a-z]","\d*"]
    function str2ArrByType(str){
        if(str=="") return;
        var retConstantArr = [];
        var retRegArr = [];
        var strArr = str.split("");
        var lastTyp = "";
        strArr.forEach(function(v,j,arr){
            var vType = vars.judgeType.getType(v);
            var vReg = vars.judgeType.getReg(v);
            if(j==0){
                retConstantArr.push(v);
                lastTyp = vType;
                retRegArr.push(vReg);
            }else{
                if(lastTyp!=vType){
                    lastTyp = vType;
                    retConstantArr.push(v);
                    retRegArr.push(vReg);
                }else{
                    retConstantArr[retConstantArr.length-1] += v;
                }
            }
        });
        return [retConstantArr,retRegArr];
    }


    //字符串去重
    function uniqueStr(str){
        var newArr=[];
        var arr = str.split("");
        arr.forEach(function(v,j,arrrrr){
            if(!contains(newArr,v)){
                newArr.push(v);
            }
        });
        return newArr.join("");
    }

    //数组是否包含某个元素
    function contains(arr,v) {
      for (i in arr) {
        if (arr[i] == v) return true;
      }
      return false;
    }

    //组合正则数组
    function assembleRegArr(regArr){
        console.log("装配分组中...");
        var assembledArr = [];
        regArr.forEach(function(v,i,arr){
            var typeArr = v;
            if(i==0){
                assembledArr = typeArr;
            }else{
                var tempArr = [];
                assembledArr.forEach(function(v1,i1,arr1){
                    typeArr.forEach(function(v2,i2,arr2){
                        tempArr.push(v1+v2+"");
                    });
                });
                assembledArr = tempArr;
            }

        });
        console.log(assembledArr);
        console.log("装配完成!");
        return assembledArr;
    }

    //过滤掉含有元字符的数组
    function filterMetaCharacterInRightRegArr(regArr){
        return regArr.filter(function(v,i,arr){
            return !v.match(/[\.\*\+\?\[\]\(\)\{\}\\\-]/g);
        });
    }
    //转义元字符或元字符数组
    function escapeMetaCharacter(regArr){
        if(isArr(regArr)){
            regArr = regArr.map(function(v,i,arr){
                return v.replace(/([\.\*\+\?\[\]\(\)\{\}\\\-])/g,"\\$1");
            });
        }else{
            regArr = regArr.replace(/([\.\*\+\?\[\]\(\)\{\}\\\-])/g,"\\$");
        }
        return regArr;
    }

    //合并重复组合 不包括\\
    function noRepeat(optimizedArr){
        optimizedArr = optimizedArr.map(function(v,i,arr){
            return v.replace(/([^\\]([^\\]))\2+/g,"$1+")        //dd非\dd类型
                    .replace(/(\\[^\\]){2,}/g, "\\$1+")         //\d\d类型 似乎无法去掉
                    .replace(/(\[a-zA-Z\]){2,}/mg, "$1+");      //[a-zA-Z\] 好像也不行
        });
        return optimizedArr;
    }
    //判断是否是数组
    function isArr(arr){
        return Object.prototype.toString.call(arr) === '[object Array]';
    }

    //获取选中的正则类型
    function getregselecttype(regselecttype){
        var ret = "";
        for(var k in regselecttype){
            ret += regselecttype[k];
        }
        return "["+ret+"]*";
    }

    //重置textarea
    //<textarea style="overflow: hidden;  font-family: Verdana,Arial; font-style: normal;  font-size: 13px; line-height: normal; " rows="4" cols="30" onfocus="javascript:ResizeTextarea(this,4);" onclick="javascript:ResizeTextarea(this,4);" onkeyup="javascript:ResizeTextarea(this,4);"></textarea>
    function resizeTextarea(a,row){
        if(!a){return}
        if(!row) row=5;
        var b=a.value.split("\n");
        var c=this.nav.is_ie?1:0;
        c+=b.length;
        var d=a.cols;
        if(d<=20){d=40}
        for(var e=0;e<b.length;e++){
            if(b[e].length>=d){
                c+=Math.ceil(b[e].length/d)
            }
        }
        c=Math.max(c,row);
        if(c!=a.rows){
            a.rows=c;
        }
    }


    $ = vars;
    $.extend = function(destination, source) { // 一个静态方法表示继承, 目标对象将拥有源对象的所有属性和方法
        for (var property in source) {
            destination[property] = source[property];   // 利用动态语言的特性, 通过赋值动态添加属性与方法
        }
        return destination;   // 返回扩展后的对象
    }
    $.extend($,$.func);
    w.pheker = pheker = $;
})(pheker={},window)
