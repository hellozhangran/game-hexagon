cc.Class({
    extends: cc.Component,

    properties: {
        title:cc.Node,
        score:cc.Node,
        btnPlay:cc.Node,
    },

    // use this for initialization
    onLoad: function () {},
    init:function(game){
        console.log('resultPrefab init');
        this.game = game;
        this.btnPlay.on(cc.Node.EventType.TOUCH_START, this._onTouchPlayAgain,this);
    },
    setScore:function(score){
        console.log('set Score');
        this.score.getComponent(cc.Label).string = score;
    },
    _onTouchPlayAgain:function(){
        console.log('_onTouchPlayAgain');
        this.game.onTouchPlayAgain();
        //this.game.
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
