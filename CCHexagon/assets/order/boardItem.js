cc.Class({
    extends: cc.Component,

    properties: {
        order:cc.Label,
        avatar:cc.Sprite,
        nickName:cc.Label,
        grade:cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function(params){
        this.order.string = params.order;
        if(params.order > 3){
            this.order.node.color = cc.Color.GRAY;
        }
        this.avatar.spriteFrame = new cc.SpriteFrame(params.avatar,cc.Rect(0,0,50,50));
        this.nickName.string = this.get6Words(params.name);
        this.grade.string = params.score;
    },

    get6Words:function(val){
        //转义val中的特殊字符
        var elem = document.createElement('textarea');
        elem.innerHTML = val;
        val = elem.value;
        var last = '';
        if(val.length > 6){
            last = '...';
        }

        var total_charactor = 12;
        var len = 0;
        for(var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            if(a.match(/[^\x00-\xff]/ig) != null){
              len += 2;
            }else{
              len += 1;
            }

            if(len>total_charactor){
                return val.substr(0,i) + last;
            }else if(len == total_charactor){
                return val.substr(0,i+1) + last;
            }
        }
        if(len<total_charactor){
            return val + last;
        }
    },
});
