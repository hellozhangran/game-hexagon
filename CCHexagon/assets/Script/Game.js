var CountUp = require('./CountUp');
var Store = require('./db');
var Global = require('./Global'),
    g_hexagon = Global.g_hexagon,
    g_config = Global.g_config,
    g_tools = Global.g_tools,
    g_line = Global.g_line;

var gameName = 'hexagon';

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
       throw new TypeError('Cannot convert undefined or null to object');
    }
    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

cc.Class({
    extends: cc.Component,
    properties: {
        hexPrefab       : cc.Prefab,
        shapePrefab     : cc.Prefab,
        shapeHolder1    : cc.Node,
        shapeHolder2    : cc.Node,
        shapeHolder3    : cc.Node,
        gameOver        : cc.Node,
        resultPrefab    : cc.Prefab,
        currentScore    : cc.Label,
        addScore        : cc.Label,
        //add rank
        order           : cc.Node,
        prefabOrderItem : cc.Prefab,
        prefabPopout    : cc.Prefab,
        holder          : cc.Node,
        stepCount       : cc.Label,
    },

    // use this for initialization
    onLoad: function() {
        this.initCurrentScore();
        this.initGameOverPopout();
        this.initPlayBoard();
        this.initAllHolder();
        this.initAllHolderTouches();
        this.initRank();
    },
    createSecretToken:function(token,score){
        var scoreStr = ""+score;
        var scoreCode = "";
        var tokenStr = ""+token;
        for(var i in scoreStr){
            console.log(scoreStr.indexOf(i));
            scoreCode += parseInt( scoreStr.substr(i,1) )%5 *2;
        }
        return (scoreCode+tokenStr).substr(0,10);
    },
    test:function(){
        var self = this;
        self.order.active = true;
        self.order.on(cc.Node.EventType.TOUCH_START, self._onTouchStartOrder, self);
    },
    initRank:function(){
        var self = this;
        self.maxScore = 0;
        self.order.active = false;
        if(window.mm && mm.webgame) {
            mm.webgame.getLightGameToken(gameName, function(result) {
                self.getInitList(function(list, otherInfo) {
                    if(list.length <= 0) {
                        return;
                    }
                    //TOD:临时做法
                    setTimeout(function(){
                         self.order.active = true;
                    },500);

                    self.getFriendRank(function(friendList){
                        self.holder.children[0].getComponent('popout').init(list,friendList);
                    });
                    self.order.on(cc.Node.EventType.TOUCH_START, self._onTouchStartOrder, self);
                    self.popout = self.holder.children[0];

                    var sceneType = self.queryString('scene_type');
                    var item = sceneType == '1' ? otherInfo : list[0];
                    if(!item) {
                        self.order.active = false;
                        return;
                    }
                    var prefab = cc.instantiate(self.prefabOrderItem);
                    var avatar = item.avatar;
                    prefab.children[0].children[0].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(avatar, cc.Rect(0,0,50,50));
                    prefab.children[1].getComponent(cc.Label).string = item.score;
                    self.order.addChild(prefab);
                });
            });
        }
    },

    initCurrentScore:function(){
        //如果locaStorage有数据，恢复 当前分数和步数
        if(is_momo7 && Store.stepCount.get()){
            this.stepCount.string = Store.stepCount.get();
        }
        var cScore=0;
        if(is_momo7 && Store.currentScore.get()){
            cScore=parseInt( Store.currentScore.get() );    
        }
        this.currentScoreBase = cScore;
        this.numAnim = new CountUp(this.currentScore, 0, cScore, 0,1);
        this.numAnim.start();
    },
    initGameOverPopout:function(){
        this.gameOver.zIndex = 200;
        var resultPrefab = cc.instantiate(this.resultPrefab);
        resultPrefab.getComponent('resultPrefab').init(this);
        resultPrefab.active = false;
        this.gameOver.addChild(resultPrefab);
        this.gameOverActionDown = cc.sequence( cc.spawn(
            cc.fadeTo(0.5,255), 
            cc.moveTo(1, cc.p(0, 0) ).easing(cc.easeCubicActionOut()) 
         ));
        this.gameOverActionUp = cc.sequence( cc.spawn(
            cc.fadeTo(1,0),
            cc.moveTo(1, cc.p(0,1000)).easing(cc.easeCubicActionOut())
        ));
    },
    //初始化游戏场地，共61个灰色六边形组成。
    initPlayBoard:function(){
        // 共有9行，每行的列数依次为5 6 7 8 9 8 7 6 5
        var lineNum = 9;
        var point0Pos = this.getPoint0Pos();
        var hexBox = new Array(lineNum);
        var storeBox;
        if(Store.hexBox.get())storeBox = Store.hexBox.get();
        for(var i = 0, i_size = hexBox.length; i < i_size; i++){
            var rowNum = lineNum - Math.abs(i - 4);
            hexBox[i] = new Array(rowNum);
            for (var j = 0, j_size = hexBox[i].length; j < j_size; j++) {
                var info = {occupy:0,colorId:5}; //occupy 1：被占； 0：未占； -1：暂时占有。
                if (j == 0 && i == 0) {
                    info.pos = point0Pos;
                }
                if (j == 0 && i > 0) {
                    info.pos = this.getNextLeftBottomPos(hexBox[i-1][0].pos);
                }
                if(j ==0 && i > 4){
                    info.pos = this.getNextRightBottomPos(hexBox[i-1][0].pos);
                }
                if (j > 0) {
                    //与前面的六边形y相同，x相差 w + space
                    var prePos = hexBox[i][j-1].pos;
                    info.pos = {
                        x:prePos.x + g_hexagon.w + g_hexagon.space,
                        y:prePos.y
                    }
                }
                //六个相关方形的hex信息
                info.relation = [
                    {row:i-1, column:i >= 5 ? j : j-1},// i>= 5 column:j
                    {row:i-1, column:i >= 5 ? j+1 : j},  // i>= 5 column:j+1
                    {row:i, column:j+1},
                    {row:i+1, column:i >= 4 ? j : j+1}, // i>= 4 column:j
                    {row:i+1, column:i >= 4 ? j-1 : j}, // i >= 4 column:j-1
                    {row:i, column:j-1}
                ];
                if(is_momo7 && storeBox){
                    info.colorId = parseInt(storeBox[i][j].colorId);
                    info.occupy = parseInt(storeBox[i][j].occupy);
                }
                var hexPrefab = this.createHexItem(info);
                info.item = hexPrefab;
                info.row = i;
                info.column = j;
                Object.defineProperty(info, 'item', {enumerable: false});
                hexBox[i][j] = info;
            }
        }
        this.hexBox = hexBox;
        console.log('allPlayBoard:  ',this.hexBox);
    },
    initAllHolder:function(){
        this.shapeHolder1.name = 'leftHolder';
        this.shapeHolder2.name = 'middleHolder';
        this.shapeHolder3.name = 'rightHolder';

        this.shapeHolder1Pos = this.shapeHolder1.getPosition();
        this.shapeHolder2Pos = this.shapeHolder2.getPosition();
        this.shapeHolder3Pos = this.shapeHolder3.getPosition();

        this.createShapePrefab(this.shapeHolder1);
        this.createShapePrefab(this.shapeHolder2);
        this.createShapePrefab(this.shapeHolder3);
    },
    initAllHolderTouches:function(){
        this.shapeHolder1.on(cc.Node.EventType.TOUCH_START, this._onTouchStartShapeHolder,this);
        this.shapeHolder2.on(cc.Node.EventType.TOUCH_START, this._onTouchStartShapeHolder,this);
        this.shapeHolder3.on(cc.Node.EventType.TOUCH_START, this._onTouchStartShapeHolder,this);

        this.shapeHolder1.on(cc.Node.EventType.TOUCH_MOVE,this._onTouchMoveShapeHolder,this);
        this.shapeHolder2.on(cc.Node.EventType.TOUCH_MOVE,this._onTouchMoveShapeHolder,this);
        this.shapeHolder3.on(cc.Node.EventType.TOUCH_MOVE,this._onTouchMoveShapeHolder,this);

        this.shapeHolder1.on(cc.Node.EventType.TOUCH_END,this._onTouchEndShapeHolder,this);
        this.shapeHolder2.on(cc.Node.EventType.TOUCH_END,this._onTouchEndShapeHolder,this);
        this.shapeHolder3.on(cc.Node.EventType.TOUCH_END,this._onTouchEndShapeHolder,this);
    },
    _onTouchStartShapeHolder:function(e){//#C7E0F1
        if(!this.touchOffset)this.touchOffset={};
        var holderName = e.target.name;
        var self = this;
        var touchPos = this.convertAnchorPosition(e.getLocation());
        switch (holderName){
            case 'leftHolder': {
                self.shapeHolder1.scale = 0.95;
                self.shapeHolder1.zIndex = 100;
                self.touchOffset = {x:touchPos.x-self.shapeHolder1.getPosition().x,y:touchPos.y-self.shapeHolder1.getPosition().y};
                self.upPosition(self.shapeHolder1,touchPos);
            }break;

            case 'middleHolder': {
                self.shapeHolder2.scale = 0.95;
                self.shapeHolder2.zIndex = 100;
                self.touchOffset = {x:touchPos.x-self.shapeHolder2.getPosition().x,y:touchPos.y-self.shapeHolder2.getPosition().y};
                self.upPosition(self.shapeHolder2,touchPos);
            }break;

            case 'rightHolder': {
                self.shapeHolder3.scale = 0.95;
                self.shapeHolder3.zIndex = 100;
                self.touchOffset = {x:touchPos.x-self.shapeHolder3.getPosition().x,y:touchPos.y-self.shapeHolder3.getPosition().y};
                self.upPosition(self.shapeHolder3,touchPos);
            }break;
        }
    },
    _onTouchMoveShapeHolder:function(e){
        //需要限制一下TouchMove的触发频率,移动间距小于2不识别
        if(!this.preMoveTarget){this.preMoveTarget = e.getLocation();}
        if(Math.abs( e.getLocation().x - this.preMoveTarget.x) < g_config.touch_move_space && Math.abs(e.getLocation().y - this.preMoveTarget.y) < g_config.touch_move_space){
            return;
        }
        this.preMoveTarget = e.getLocation();
        var holderName = e.target.name;
        var self = this;
        switch(holderName){
            case 'leftHolder':{
                var pos = self.convertAnchorPosition(e.getLocation());
                    pos = cc.p(pos.x, pos.y+  g_config.shape_touch_up);
                self.shapeHolder1.setPosition(pos);
                self.canSitDown(self.shapeHolder1);
            }break;

            case 'middleHolder':{
                var pos = self.convertAnchorPosition(e.getLocation());
                    pos = cc.p(pos.x,pos.y+g_config.shape_touch_up);
                self.shapeHolder2.setPosition(pos);
                self.canSitDown(self.shapeHolder2);
            }break;

            case 'rightHolder':{
                var pos = self.convertAnchorPosition(e.getLocation());
                    pos = cc.p(pos.x,pos.y+g_config.shape_touch_up);
                self.shapeHolder3.setPosition(pos);
                self.canSitDown(self.shapeHolder3);
            }break;
        }
    },
    _onTouchEndShapeHolder:function(e){
        var holderName = e.target.name;
        var self = this;
        switch(holderName){
            case 'leftHolder':{
                self.doSitDown(self.shapeHolder1,(isDone,hexSats)=>{//hexSats:已经放置好的Hex
                    if(isDone){
                        
                        self.shapeHolder1.active = false;
                        self.shapeHolder1.removeAllChildren();
                        self.createShapePrefab(self.shapeHolder1);
                        self.shapeHolder1.setPosition(self.shapeHolder1Pos);
                        self.shapeHolder1.active = true;
                        console.log('will killAlLineInclude');
                        self.killAllLineInclude(hexSats);
                        self.addStepCount();
                        //判断是否游戏结束
                        if(self.isGameOver()){
                            self.doGameOver(self.currentScoreBase);
                        };
                    }else{
                        self.shapeHolder1.setPosition(self.shapeHolder1Pos);
                        self.shapeHolder1.scale = 0.7;
                    }
                });
            }break;

            case 'middleHolder':{
                self.doSitDown(self.shapeHolder2,(isDone,hexSats)=>{
                    if(isDone){
                        self.shapeHolder2.active = false;
                        self.shapeHolder2.removeAllChildren();
                        self.createShapePrefab(self.shapeHolder2);
                        self.shapeHolder2.setPosition(self.shapeHolder2Pos);
                        self.shapeHolder2.active = true;
                        console.log('will killAlLineInclude hexSats:',hexSats);
                        self.killAllLineInclude(hexSats);
                        self.addStepCount();
                        if(self.isGameOver()){
                            self.doGameOver(self.currentScoreBase);
                        };
                    }else{
                        self.shapeHolder2.setPosition(self.shapeHolder2Pos);
                        self.shapeHolder2.scale = 0.7;
                    }
                });
            }break;

            case 'rightHolder':{
                self.doSitDown(self.shapeHolder3,(isDone,hexSats)=>{
                    if(isDone){
                        self.shapeHolder3.active = false;
                        self.shapeHolder3.removeAllChildren();
                        self.createShapePrefab(self.shapeHolder3);
                        self.shapeHolder3.setPosition(self.shapeHolder3Pos);
                        self.shapeHolder3.active = true;
                        console.log('will killAlLineInclude hexSats:',hexSats);
                        self.killAllLineInclude(hexSats);
                        self.addStepCount();
                        if(self.isGameOver()){
                            self.doGameOver(self.currentScoreBase);
                        };
                    }else{
                        self.shapeHolder3.setPosition(self.shapeHolder3Pos);
                        self.shapeHolder3.scale = 0.7;
                    }
                });
            }break;
        }
    },
    onTouchPlayAgain:function(){
        console.log('do onTouchPlayAgain');
        this.stepCount.string = 0;
        this.resetPlayBoard();
        this.hideGameOver();
    },
    _onTouchStartOrder:function(){
        //cc.eventManager.pauseTarget(this.order, true);
        this.popout.getComponent('popout').show();
    },
    upPosition:function(shapeHolder,touchPos){
        shapeHolder.y = touchPos.y + g_config.shape_touch_up;
    },
    //点击shapeHolder时：触点相对于shapeHolder的位置偏移
    touchOffset:function(touchPos,shapePos){
        return {
            x:touchPos.x-shapePos.x,
            y:touchPos.y-shapePos.y
        }
    },
    showGameOver:function(score){
        var self = this;
        setTimeout(function(){
            var gameOverPrefab = self.gameOver.children[0];
            var mask = gameOverPrefab.children[0];
            var board = gameOverPrefab.children[1];
            board.active = false;
            mask.active = true;
            gameOverPrefab.active = true;
            gameOverPrefab.getComponent('resultPrefab').setScore(score);
            board.position = cc.p(0,1000);
            board.active = true;
            board.runAction(self.gameOverActionDown); 
        },1500);
    },
    hideGameOver:function(){
        var gameOverPrefab = this.gameOver.children[0];
        var mask = gameOverPrefab.children[0];
        var board = gameOverPrefab.children[1];
        board.runAction(this.gameOverActionUp);
        gameOverPrefab.children[0].active = false;
    },
    resetPlayBoard:function(){
        //把棋盘上的点都设成灰色，occupy=0
        for(var i = 0; i < this.hexBox.length; i++){
            for(var j = 0; j < this.hexBox[i].length; j++){
                //只有有一种可能放下的位置，游戏都继续
                if(this.hexBox[i][j].occupy == 1){
                    this.hexBox[i][j].occupy = 0;
                    this.hexBox[i][j].item.getComponent('HexPrefab').changeColor(5);
                    this.hexBox[i][j].colorId = 5;
                }
            }
        }
        //当前分数归零
        this.currentScore.string = '0';
        this.currentScoreBase = 0;
    },
    /**
     * 判断游戏是否结束
     * 逻辑：三种图形，放在所有可能的位置，3*61，所有位置都放不下的时候，游戏结束
     * @return {[type]} [description]
     */
    isGameOver:function(){ 
        for(var i = 0; i < this.hexBox.length; i++){
            for(var j = 0; j < this.hexBox[i].length; j++){
                //只有有一种可能放下的位置，游戏都继续
                if(this.judgeCanSitDown(this.shapeHolder1,{row:i,column:j}))return false;
                if(this.judgeCanSitDown(this.shapeHolder2,{row:i,column:j}))return false;
                if(this.judgeCanSitDown(this.shapeHolder3,{row:i,column:j}))return false;
            }
        }
        return true;
    },
    addStepCount:function(){
        var count = parseInt(this.stepCount.string)+1;
        this.stepCount.string = count;
        Store.hexBox.set(this.hexBox);
        Store.stepCount.set(count);
    },
    doGameOver:function(score){
        var self = this;
        console.log('游戏结束');
        //清空localStorage
        Store.reset();
        self.updateServerScore(score,()=>{
            //TODO:当自己的分数再创新高的时候，刷新一下当前页面的排行
            self.updateOrder();
        });
        self.showGameOver(score);
    },
    createShapePrefab:function(shapeHolder){
        var shapePrefab = cc.instantiate(this.shapePrefab);
        shapePrefab.getComponent('shapePrefab').init();
        shapeHolder.addChild(shapePrefab);
        var boxSize = shapePrefab.getBoundingBoxToWorld();
        shapeHolder.scale = 0.7;
    },

    // 遍历当前@hex三个方向的line，如果occupy==1则清理相应line
    killAllLineInclude:function(Hexs){//结构hex={row:0,column:0}
        this.currentScoreNum = 0;//当前得分的次数，or 连续消除的次数
        this.allNeedKillHexs = [];
        for(var i in Hexs){
            this.killAllLineIncludeOne(Hexs[i]);
        }
        //整个遍历，如果有可消除的行，则所有的可消除块都装入了this.allNeedKillHexs中
        for(var index in this.allNeedKillHexs){
           this.resetOneHexGray(this.allNeedKillHexs[index]);
        }
    },
    killAllLineIncludeOne:function(hex){
        //遍历行
        var rowOccupyNum = 0;
        var rowArray = [];
        for(var i = 0; i < this.hexBox[hex.row].length; i++){
            if(this.hexBox[hex.row][i].occupy === 1){
                rowOccupyNum += 1;
                rowArray.push(this.hexBox[hex.row][i]);
            }
            if(i == this.hexBox[hex.row].length -1){
                if(rowOccupyNum -1 == i){
                    for(var rowIndex in rowArray){
                        //this.resetOneHexGray(rowArray[rowIndex]);
                    }
                    this.allNeedKillHexs = this.allNeedKillHexs.concat(rowArray);
                    console.log('得分：消除了一行');
                    this.currentScoreNum++;
                    this.calcScore(i+1,this.currentScoreNum,(score)=>{
                        this.addScoreAction(score);
                        this.currentScoreBase += score;
                        Store.currentScore.set(this.currentScoreBase);
                        this.numAnim.update(this.currentScoreBase);
                    });

                }
            }
        }

        //遍历'/'
        //先找到当前hex在g_ling.right中的哪一列
        var rightOccupyNum = 0;
        var rightArray = [];
        var right_lines;
        if(hex.row > 4){
            right_lines = g_line.right[hex.column + hex.row - 4];
        }else{
            right_lines = g_line.right[hex.column];
        }
        //console.log('beigin / : ',right_lines);
        for(var rightIndex = 0; rightIndex < right_lines.length; rightIndex++){
            var rightItem = right_lines[rightIndex];
            if(this.hexBox[rightItem.row][rightItem.column].occupy ===1){
              rightOccupyNum += 1;
              rightArray.push(this.hexBox[rightItem.row][rightItem.column]);
            }
            if(rightIndex == right_lines.length -1){
                if(rightOccupyNum - 1 == rightIndex){
                    for(var rIndex in rightArray){
                        //this.resetOneHexGray(rightArray[rIndex]);
                    }
                    this.allNeedKillHexs = this.allNeedKillHexs.concat(rightArray);
                    console.log('得分：消除了一右列');
                    this.currentScoreNum++;
                    this.calcScore(rightIndex+1, this.currentScoreNum,(score)=>{
                        this.addScoreAction(score);
                        this.currentScoreBase += score;
                        Store.currentScore.set(this.currentScoreBase);
                        this.numAnim.update(this.currentScoreBase);
                    });
                }
            }
        }

        //遍历'\'
        //先找到当前hex在g_ling.left中的哪一列
        var leftOccupyNum = 0;
        var leftArray = [];
        var left_lines;
        if(hex.row < 4){
            left_lines = g_line.left[hex.column + 4 - hex.row];
        }else{
            left_lines = g_line.left[hex.column];
        }
        //console.log('beigin \\ : ',left_lines);
        for(var leftIndex=0;leftIndex<left_lines.length;leftIndex++){
            var leftItem = left_lines[leftIndex];
            if(this.hexBox[leftItem.row][leftItem.column].occupy ===1){
              leftOccupyNum += 1;
              leftArray.push(this.hexBox[leftItem.row][leftItem.column]);
            }
            if(leftIndex == left_lines.length -1){
                if(leftOccupyNum - 1 == leftIndex){
                    for(var lIndex in leftArray){
                       // this.resetOneHexGray(leftArray[lIndex]);
                    }
                    this.allNeedKillHexs = this.allNeedKillHexs.concat(leftArray);
                    console.log('得分：消除了一左列');
                    this.currentScoreNum++;
                    this.calcScore(leftIndex+1,this.currentScoreNum,(score)=>{
                        this.addScoreAction(score);
                        this.currentScoreBase += score;
                        Store.currentScore.set(this.currentScoreBase);
                        this.numAnim.update(this.currentScoreBase);
                    });
                }
            }
        }
    },
    addScoreAction:function(num){
        this.addScore.node.y = 360;
        this.addScore.node.opacity = 0;
        this.addScore.string = '+'+num;
        var action1 = cc.fadeIn(0.2);
        var action1_1 = cc.scaleTo(0.2,2);
        var action2 = cc.moveTo(0.5, cc.p(0,400)).easing(cc.easeCubicActionOut());
        var action3 = cc.fadeOut(0.5);
        var sequence = cc.sequence(cc.spawn(action1,action1_1),cc.spawn(action2,action3));
        this.addScore.node.runAction(sequence);

    },
    calcScore:function(num,re,callback){//num：消除的格子数；re：第几次连续消除
        var singleScore = 140 + (num-5)*20;
        var score = singleScore * (1+0.3*(re-1)*(re-1));
        callback && callback(Math.floor(score));
    },
    convertAnchorPosition:function(vec){
        var point = cc.p(vec.x - this.node.width/2 ,vec.y - this.node.height/2);
        return point;
    },
    doSitDown:function(shapeHolder,callback){
        var done = false;
        var hexSats = [];
        for(var i = 0; i < this.hexBox.length; i++){
            for(var j = 0; j < this.hexBox[i].length; j++){
                if(this.hexBox[i][j].occupy == -1){
                    this.hexBox[i][j].occupy = 1;
                    this.hexBox[i][j].item.getComponent('HexPrefab').resetOpacity();
                    hexSats.push(this.hexBox[i][j]);
                    done = true;
                }
            }
        }
        if(done === true)callback && callback(true,hexSats);
        if(done === false)callback && callback(false)
    },
    //只判断该图像在指定点是否可放置
    judgeCanSitDown:function(shapeHolder,pos){//pos:row,column
        var shapePrefab = shapeHolder.children[0].getComponent('shapePrefab');
        if(this.hexBox[pos.row][pos.column].occupy ===1)return false;//如果该位置已经被占了，退出
        if(shapePrefab.relation[0] === -1){//单一shape
            if(this.hexBox[pos.row][pos.column].occupy === 1 ){
                //TODO:已经被占
                return false;
            }else{
                return true;
            }

        }else{
            var matrix1 = this.hexBox[pos.row][pos.column].relation[shapePrefab.relation[0]];//第二个hex的坐标
            var matrix2 = this.hexBox[matrix1.row]&&this.hexBox[matrix1.row][matrix1.column]&&this.hexBox[matrix1.row][matrix1.column].relation[shapePrefab.relation[1]];
            var matrix3 = matrix2 && this.hexBox[matrix2.row]&&this.hexBox[matrix2.row][matrix2.column]&&this.hexBox[matrix2.row][matrix2.column].relation[shapePrefab.relation[2]];

            if(this.hexBox[matrix1.row] && this.hexBox[matrix1.row][matrix1.column] && this.hexBox[matrix1.row][matrix1.column].occupy === 0 &&
               this.hexBox[matrix2.row] && this.hexBox[matrix2.row][matrix2.column] && this.hexBox[matrix2.row][matrix2.column].occupy === 0 &&
               this.hexBox[matrix3.row] && this.hexBox[matrix3.row][matrix3.column] && this.hexBox[matrix3.row][matrix3.column].occupy === 0){
               return true;
           }else{
               return false;
           }
        }
    },
    canSitDown:function(shapeHolder){
        var shapePrefab = shapeHolder.children[0].getComponent('shapePrefab');
        var hexPrefab = shapePrefab.mBlocks[0].item;
        var first = hexPrefab.getNodeToWorldTransformAR();
        var firstPos = this.convertAnchorPosition({x:first.tx,y:first.ty});
        //先确定firstShape在playBoard中，否则退出
        if( firstPos.x < this.hexBox[4][0].pos.x || firstPos.x >  this.hexBox[4][8].pos.x || firstPos.y < this.hexBox[8][0].pos.y || firstPos.y > this.hexBox[0][0].pos.y){
            this.resetAllHexGray();
            return;
        };

        var colorId = hexPrefab.getComponent('HexPrefab').colorId;
        for(var i = 0; i < this.hexBox.length; i++){
            for(var j=0; j < this.hexBox[i].length; j++){
                var pos = this.hexBox[i][j].pos;
                var address = g_tools.getPointsAddress(pos,firstPos);
                if(address < g_hexagon.w/2){
                    if(this.preBingo && this.preBingo.i == i && this.preBingo.j == j){
                        console.log('首位置重复命中！！！');
                        return;
                    }
                 
                    if(this.hexBox[i][j].occupy ===1)return;//如果该位置已经被占了，退出
                       console.log('首位置命中!!!!!');
                    this.preBingo = {i:i,j:j};
                    if(shapePrefab.relation[0] === -1){//单一shape
                        //if(this.hexBox[i][j].occupy === 1)return;
                        this.resetAllHexGray();
                        this.hexBox[i][j].item.getComponent('HexPrefab').changeOpacityColor(colorId);
                        this.hexBox[i][j].colorId = colorId;
                        this.hexBox[i][j].occupy = -1
                    }else{
                        var matrix1 = this.hexBox[i][j].relation[shapePrefab.relation[0]];//第二个hex的坐标
                        var matrix2 = this.hexBox[matrix1.row]&&this.hexBox[matrix1.row][matrix1.column]&&this.hexBox[matrix1.row][matrix1.column].relation[shapePrefab.relation[1]];
                        var matrix3 = matrix2 && this.hexBox[matrix2.row]&&this.hexBox[matrix2.row][matrix2.column]&&this.hexBox[matrix2.row][matrix2.column].relation[shapePrefab.relation[2]];

                        if(this.hexBox[matrix1.row] && this.hexBox[matrix1.row][matrix1.column] && this.hexBox[matrix1.row][matrix1.column].occupy !== 1 &&
                            this.hexBox[matrix2.row] && this.hexBox[matrix2.row][matrix2.column] && this.hexBox[matrix2.row][matrix2.column].occupy !== 1 &&
                            this.hexBox[matrix3.row] && this.hexBox[matrix3.row][matrix3.column] && this.hexBox[matrix3.row][matrix3.column].occupy !== 1){
                            this.resetAllHexGray();
                            this.hexBox[i][j].item.getComponent('HexPrefab').changeOpacityColor(colorId);
                            this.hexBox[matrix1.row][matrix1.column].item.getComponent('HexPrefab').changeOpacityColor(colorId);
                            this.hexBox[matrix2.row][matrix2.column].item.getComponent('HexPrefab').changeOpacityColor(colorId);
                            this.hexBox[matrix3.row][matrix3.column].item.getComponent('HexPrefab').changeOpacityColor(colorId);

                            this.hexBox[i][j].colorId = colorId;
                            this.hexBox[matrix1.row][matrix1.column].colorId = colorId;
                            this.hexBox[matrix2.row][matrix2.column].colorId = colorId;
                            this.hexBox[matrix3.row][matrix3.column].colorId = colorId;

                            this.hexBox[i][j].occupy = -1;
                            this.hexBox[matrix1.row][matrix1.column].occupy = -1;
                            this.hexBox[matrix2.row][matrix2.column].occupy = -1;
                            this.hexBox[matrix3.row][matrix3.column].occupy = -1;
                        }else{
                            this.resetAllHexGray();
                        }
                    }
                }else{}
            }
        }
    },
    /**
     * 把所有occupy：-1的hex块都重置成灰色，且设置occupy=0
     */
    resetAllHexGray:function(){
        this.preBingo = null;
        for(var i = 0; i < this.hexBox.length; i++){
            for(var j = 0; j < this.hexBox[i].length; j++){
                if(this.hexBox[i][j].occupy === -1){
                    this.hexBox[i][j].occupy = 0;
                    this.hexBox[i][j].item.getComponent('HexPrefab').changeColor(5);//color gray
                    this.hexBox[i][j].colorId = 5;
                }
            }
        }
    },
    // 把@hex置灰，并修改相关属性
    resetOneHexGray:function(hex){
        hex.item.getComponent('HexPrefab').changeTweenColor(5);
        hex.colorId = 5;
        hex.occupy = 0;
    },
    /**
     *  关于坐标点的计算，都是基于最中心的那个小六边形来算的，它的坐标是(0,0)
     *  计算出0点的坐标，0点就是第一行的第一个点。
     */
    getPoint0Pos: function() {
        var pos = {};
        pos.x = g_hexagon.centerPos.x - 2 * g_hexagon.w;
        pos.y = g_hexagon.centerPos.y + 2 * Math.sqrt(3) * g_hexagon.w;
        return pos;
    },
    // 计算当前六边形左下方六边形的坐标
    getNextLeftBottomPos:function(pos){
        var newPos = {};
        newPos.x = pos.x - (g_hexagon.w + g_hexagon.space) / 2;
        newPos.y = pos.y - Math.sqrt(3) / 2 * (g_hexagon.w + g_hexagon.space);
        return newPos;
    },
    // 计算当前六边形右下方六边形的坐标
    getNextRightBottomPos:function(pos){
        var newPos = {};
        newPos.x = pos.x + (g_hexagon.w + g_hexagon.space) / 2;
        newPos.y = pos.y - Math.sqrt(3) / 2 * (g_hexagon.w + g_hexagon.space);
        return newPos;
    },

    createHexItem:function(info){
        var newHex = cc.instantiate(this.hexPrefab);
        newHex.x = info.pos.x;
        newHex.y = info.pos.y;
        newHex.getComponent('HexPrefab').changeColor(info.colorId);
        this.node.addChild(newHex);
        return newHex;
    },
    /*
     *初始化排行榜
     *callback有两个参数@listInfo @otherInfo
     *listInfo是一周内的排行，scene==1，只显示双方信息
     *在order显示：1v1显示对方的头像，群：显示最近一周成绩最好的人的信息
     */
    getInitList: function(callback){
        var self = this;
        var scene_id = this.queryString('scene_id') || '320007230';
        var scene_type = this.queryString('scene_type') || 1;
        this.scene_id = scene_id;
        this.scene_type = scene_type;
        if (scene_type == 1) {
            mm.webgame.getLightGameUserScore({gameid: gameName},function(result){
                if(result.ec == 200){
                    var selfInfo = {name: result.name,avatar: result.avatar,score:result.score};
                    var infoList = [];
                    infoList.push(selfInfo);
                    mm.webgame.getLightGameUserScore({gameid: gameName,momoid: scene_id,}, function(resp) {
                        if (resp.ec == 200) {
                            var otherInfo = {name: resp.name,avatar: resp.avatar,score: resp.score};
                            if (resp.score > selfInfo.score) {
                                infoList.unshift(otherInfo);
                            } else {
                                infoList.push(otherInfo);
                            }
                            callback && callback(infoList, otherInfo);
                        } else {
                            callback && callback(infoList, null);
                        }
                    });
                } else {
                    console.log('success', result);
                    callback && callback([]);
                }
            });
        }
        if(scene_type == 2 || scene_type == 4 || scene_type == 16){
            mm.webgame.getLightGameUserRank({
                gameid: gameName,
                group_id: scene_id,
                type:scene_type
            }, function(result){
                if(result.ec == 200){
                    callback && callback(result.rank_info.slice(0,10));
                }else{
                    console.log('error in getLightGameGroupUserRank:',result);
                }
            });
        }
    },
    /*
    *获取好友排行
    */
    getFriendRank:function(callback){
      var scene_id = this.queryString('scene_id') || '320007230';
      var scene_type = this.queryString('scene_type') || 1;
      mm.webgame.getLightGameFriendsUserRank({
          gameid: gameName,
          group_id: scene_id,
          type:scene_type,
      }, function(result) {
          if(result.ec == 200){
              console.log('friendsUserRank 200',result.rank_info);
              callback && callback(result.rank_info);
          }
      });
    },

    /*
     * 更新最高成绩
     */
    updateServerScore:function(score,callback){
        if(!window.mm) return;
        score = parseInt(score);
        console.log('提交成绩！');
        var preScore = parseInt( (score+'').substr(0,3) );
        var vToken = (preScore%5 + preScore + score) * 987;
        //（分数前3位%5  + 分数前3位 + 分数 ）* 987
        mm.webgame.setLightGameUserScore({
            gameid: gameName,
            result: score,
            vtoken:vToken,
            scene_type: this.queryString('scene_type'),
            scene_id: this.queryString('scene_id')
        }, function(result) {
            if(result.ec === 200) {
                console.log('update server score success:',result);
                callback && callback();
            }
        });
    },
    updateOrder: function(){
        var self = this;
        self.getInitList(function(list, otherInfo) {
            if(list.length <= 0) return;
            self.popout.getComponent('popout').fresh(list);
            var sceneType = self.queryString('scene_type');
            var item = sceneType == '1' ? otherInfo : list[0];
            if(!item) return;
            var itemView = self.order.children[1];
            itemView.children[0].children[0].getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item.avatar, cc.Rect(0, 0, 50, 50));
            itemView.children[1].getComponent(cc.Label).string = item.score;
        });
    },
    /*
     *工具方法，获取query object
     */
    queryString:function(name,url){
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
});
