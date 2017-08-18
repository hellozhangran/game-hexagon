cc.Class({
    extends: cc.Component,
    properties: {
        prefabItem:cc.Prefab,
        layout:cc.Node,
        mask:cc.Node,
        board:cc.Node,
        duration:1,
        fLayout:cc.Node,
        tabLeft:cc.Node,
        tabRight:cc.Node,
    },

    // use this for initialization
    onLoad:function(){
        this.tabLeft.on(cc.Node.EventType.TOUCH_START, this._onTouchTabLeft, this);
        this.tabRight.on(cc.Node.EventType.TOUCH_START, this._onTouchTabRight, this);
    },

    _onTouchMask:function(e){
        this.touchNodePos = this.board.convertTouchToNodeSpaceAR(e);
        if( this.touchNodePos.x > (this.board.x - this.board.width/2) && this.touchNodePos.x < (this.board.x + this.board.width/2) && this.touchNodePos.y > (this.board.y - this.board.height/2) && this.touchNodePos.y < (this.board.y + this.board.height/2) ){
            return;
        }
        e.stopPropagation();
        console.log('click mask');
        this.hide();
    },

    _onTouchTabLeft:function(){
        console.log('touch left');
        this.fLayout.active = false;
        this.tabRight.children[0].color = new cc.Color(153,153,153,255);
        this.layout.active = true;
        this.tabLeft.children[0].color = new cc.Color(60,60,60,255);
    },

    _onTouchTabRight:function(){
        console.log('touch right');
        this.layout.active = false;
        this.tabLeft.children[0].color = new cc.Color(153,153,153,255);
        this.fLayout.active = true;
        this.tabRight.children[0].color = new cc.Color(60,60,60,255);
    },

    prepare: function () {
        var afterDown = cc.callFunc(this.onDownFinish,this);
        var afterUp = cc.callFunc(this.onUpFinish,this);
        this.easeDown = cc.moveTo(this.duration, cc.p(0, 0)).easing(cc. easeCubicActionOut());
        this.easeUp = cc.moveTo(this.duration, cc.p(0,1000)).easing(cc. easeCubicActionIn());//easeCubicActionIn
        this.actionDown = cc.sequence( cc.spawn(cc.fadeTo(this.duration, 255),  this.easeDown),afterDown );
        this.actionUp = cc.sequence( cc.spawn(cc.fadeTo(this.duration, 0), this.easeUp),afterUp ) ;
        this.mask.on(cc.Node.EventType.TOUCH_START, this._onTouchMask, this);
        cc.eventManager.pauseTarget(this.mask,true);
    },
    init:function(list,friendList){//[{},{}]
        console.log('enter init in popout.js');
        this.prepare();
        console.log('popout.js init',list);
        this.list = [];
        this.friendList = [];
        for(var item in list){
            var prefab = cc.instantiate(this.prefabItem);
            var obj = list[item];
            obj.order = parseInt(item) + 1;
            prefab.getComponent('boardItem').init(obj);
            //this.layout.addChild(prefab);
            this.list.push(prefab);
        }

        for(var item in friendList){
            var prefab = cc.instantiate(this.prefabItem);
            var obj = friendList[item];
            obj.order = parseInt(item) + 1;
            prefab.getComponent('boardItem').init(obj);
            //this.layout.addChild(prefab);
            this.friendList.push(prefab);
        }
        this.layout.active = false;
    },

    fresh:function(list){
        for(var item in list){
            list[item].order = parseInt(item) + 1;
            if(this.list[item]){
                this.list[item].getComponent('boardItem').init(list[item]);
            }else{
                var prefab = cc.instantiate(this.prefabItem);
                prefab.getComponent('boardItem').init(list[item]);
                //this.layout.addChild(prefab);
                this.list.push(prefab);
            }
        }
    },
    show:function(){
        //this.prepare();
        this.board.position = cc.p(0,1000);
        //this.mask.opacity = 0;
        this.node.active = true;
        this.board.runAction(this.actionDown);
        //this.mask.opacity = 50;
        this.mask.runAction(cc.fadeTo(this.duration,50));
        //this.node.setScale(2);
        //this.node.opacity = 0;
        //this.node.runAction(this.actionFadeIn);
    },

    hide:function(){
        //cc.eventManager.pauseTarget(this.node, true);
        //this.node.runAction(this.actionFadeOut);
        //this.node.position = cc.p(1200, 480);
        this.layout.active = false;
        this.layout.removeAllChildren();
        this.fLayout.active = false;
        this.fLayout.removeAllChildren();
        //this.mask.opacity = 0;
        this.board.runAction(this.actionUp);
        this.mask.runAction(cc.fadeTo(this.duration,0));
    },
    test:function(){
        console.log('i am test in popout.js');
    },
    renderLayout:function(){
        for(var prefab in this.list){
            this.layout.addChild(this.list[prefab]);
        }

        for(var prefab in this.friendList){
            this.fLayout.addChild(this.friendList[prefab]);
        }
    },
    onDownFinish:function(){
         //cc.eventManager.resumeTarget(this.node, true);
        this.renderLayout();
        this.layout.active = true;
        cc.eventManager.resumeTarget(this.mask,true);
    },

    onUpFinish:function(){
        this.node.active = false;
        cc.eventManager.pauseTarget(this.mask,true);
    }
});
