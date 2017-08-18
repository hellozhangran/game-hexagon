const local = localStorage;
const Store = {
    stepCount:{
        get:function(){
            if(local.stepCount)return local.stepCount;
        },
        set:function(num){
            local.stepCount = num;
        },
    },
    currentScore:{
        get:function(){
            if(local.currentScore)return local.currentScore;
        },
        set:function(num){
            local.currentScore = num;
        }
    },
    hexBox:{
        get:function(){
            if(local.hexBox){
                return JSON.parse(local.hexBox);
            }else{return null;}
        },
        set:function(obj){
            var copy = Object.assign({},obj);
            local.hexBox = JSON.stringify(copy);
        }
    },
    reset:function(){
        local.clear();
    }
} 

module.exports = Store;