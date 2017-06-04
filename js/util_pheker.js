(function($,w){

    //全局变量
    var vars = {
        languages:["c/c++","java","php","js","python","ruby"],//语言
        ids:["txt_right","txt_error"],//ids:正确实例,错误实例
        tools:[],   //工具区文本:语言,常量
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
            }
        },
        func:{
            toArrByIndex : toArrByIndex,
            generateRegArrAtIndex : generateRegArrAtIndex,
            uniqueStr : uniqueStr,
            contains : contains,
            assembleRegArr : assembleRegArr,
            filterMetaCharacterInRightRegArr : filterMetaCharacterInRightRegArr,
            escapeMetaCharacter : escapeMetaCharacter,
            noRepeat : noRepeat,
            isArr : isArr
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
        return ret;
    }

    //生成指定索引位置的正则数组
    function generateRegArrAtIndex(uniqueArr){
        var regArrAtIndex = uniqueArr;
        regArrAtIndex = escapeMetaCharacter(regArrAtIndex);
        uniqueArr.forEach(function(v,i,arr){
            var metacharacter = "";
            if(vars.judgeType.isDigit(v)){
                metacharacter = "\\d";
            }else if(vars.judgeType.isLetter(v)){
                metacharacter = "[a-zA-Z]";
            }else if(vars.judgeType.isRegexMetaCharacter(v)){
                metacharacter = "[\\.\\*\\+\\?\\[\\]\\(\\)\\{\\}\\\\\\-]";
            }else if(vars.judgeType.isOther(v)){
                metacharacter = v;
            }
            // console.log("reg_metacharacter:"+metacharacter);
            if(!contains(regArrAtIndex,metacharacter)){
                regArrAtIndex.push(metacharacter);
            }
        });
        return regArrAtIndex;
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
