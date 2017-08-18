var Global = require('Global'),
    g_tools = Global.g_tools;


cc.Class({
    extends: cc.Component,

    properties: {
        avatar:cc.Sprite,//sprite
        avatars:[cc.SpriteFrame]
    },

    onLoad: function () {
        //this.avatar.spriteFrame = this.avatars[0];
    },

    update: function (dt) {

    },

    changeColor:function(colorId){
        this.colorId = colorId;
        this.avatar.spriteFrame = this.avatars[colorId];
        this.node.opacity = 255;
    },
    changeTweenColor:function(colorId){
        this.colorId = colorId;
        this.avatar.spriteFrame = this.avatars[colorId];
        this.node.opacity = 0;
        g_tools.tween.linear(0,255,(update)=>{
            this.node.opacity = update;
        });
    },
    changeOpacityColor:function(colorId){
        this.colorId = colorId;
        this.avatar.spriteFrame = this.avatars[colorId];
        this.node.opacity =  140;
    },
    resetOpacity:function(){
        this.avatar.spriteFrame = this.avatars[5];
        this.avatar.spriteFrame = this.avatars[this.colorId];
        this.node.opacity = 255;
    }
});
