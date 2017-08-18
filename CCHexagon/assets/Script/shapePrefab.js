var Global = require('Global');
var g_near_pos = Global.g_near_pos;
var g_hexagon = Global.g_hexagon;
cc.Class({
    extends: cc.Component,

    properties: {
        hexPrefab:cc.Prefab,
        mBlocks:null,
    },

    onLoad: function () {
        this.active = true;
    },

    init:function(){
        //mBlocks 存放着当前图形的每个小图的坐标和每个hexPrefab
        this.mBlocks = new Array(4);
        this.relation = new Array(3);
        //随机产生一种图形,编号 0~24 共25中，其中 0 号为单一的六边形，其余的都是有4个六边形组成
        var shapeNum = Math.floor(Math.random() * 100 ) % 22;//0~21
        this.createRandomShape(shapeNum==21?0:shapeNum);
        console.log('random shape id : ',shapeNum);
    },

    update: function (dt) {

    },
    createHexItem:function(pos,colorId){
        var newHex = cc.instantiate(this.hexPrefab);
        newHex.getComponent('HexPrefab').changeColor(colorId);
        newHex.x = pos.x;
        newHex.y = pos.y;
        this.node.addChild(newHex);
        return newHex;
    },
    drawFourShapes:function(pos0,pos1,pos2,pos3,colorId){
        var hex0 = this.createHexItem(pos0,colorId);
        var hex1 = this.createHexItem(pos1,colorId);
        var hex2 = this.createHexItem(pos2,colorId);
        var hex3 = this.createHexItem(pos3,colorId);
        this.mBlocks[0] = {hexPrefabPos:pos0,item:hex0};
        this.mBlocks[1] = {hexPrefabPos:pos1,item:hex1};
        this.mBlocks[2] = {hexPrefabPos:pos2,item:hex2};
        this.mBlocks[3] = {hexPrefabPos:pos3,item:hex3};
    },
    createRandomShape:function(shapeNum){
        //取一个随机颜色, 0 ~ 4
        var self = this;
        var colorNum = Math.floor( Math.random() * 10 ) % 5;
        var wOffset =  g_hexagon.w / Math.sqrt(2);

        switch (shapeNum){
            case 0 :{//单一六边形
                var hex1 = self.createHexItem({x:0,y:0},colorNum);
                self.relation[0] = -1;
                self.mBlocks[0] = {
                    hexPrefabPos:{x:0,y:0},
                    item:hex1,
                }
            }break;
            case 1 :{//一
                var pos0 = {x:- g_hexagon.w*1.5,y:0},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                this.relation[0] = 2;
                this.relation[1] = 2;
                this.relation[2] = 2;
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
            }break;
            case 2 :{//第2种
                var pos0 = {x: - 1.5 * g_hexagon.w/Math.sqrt(2),y:1.5 * g_hexagon.w/Math.sqrt(2)},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getNextRightBottomPos(pos2);
                this.relation[0] = 3;
                this.relation[1] = 3;
                this.relation[2] = 3;
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
            }break;
            case 3 :{//第3种
                var offset = 1.5*g_hexagon.w/Math.sqrt(2);
                var pos0 = {x:-offset,y:-offset},
                    pos1 = g_near_pos.getNextRightTopPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 1;
                this.relation[1] = 1;
                this.relation[2] = 1;
            }break;
            case 4 :{//第4种
                var pos0 = {x:-0.5 * wOffset,y:0.5 * wOffset},
                    pos1 = g_near_pos.getNextLeftBottomPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 4;
                this.relation[1] = 2;
                this.relation[2] = 1;
            }break;

            case 5 :{
                var pos0 = {x: -g_hexagon.w, y:g_hexagon.h/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getNextLeftTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 2;
                this.relation[2] = 0;
            }break;
            case 6 :{
                var pos0 = {x: 0, y: (g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextLeftBottomPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 4;
                this.relation[1] = 3;
                this.relation[2] = 1;
            }break;

            case 7 :{
                var pos0 = {x:-g_hexagon.w, y:g_hexagon.h/2},
                    pos1 = g_near_pos.getNextLeftBottomPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 4;
                this.relation[1] = 2;
                this.relation[2] = 2;
            }break;
            case 8 :{
                var pos0 = {x:-g_hexagon.w,y:g_hexagon.h/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 1;
                this.relation[2] = 2;
            }break;

            case 9 :{
                var pos0 = {x:-g_hexagon.w,y:-g_hexagon.h/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getNextRightBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 1;
                this.relation[2] = 3;
            }break;

            case 10 :{
                var pos0 = {x:-g_hexagon.w/2,y:g_hexagon.h/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 3;
                this.relation[2] = 1;
            }break;

            case 11:{
                var pos0 = {x:-g_hexagon.w,y:0},
                    pos1 = g_near_pos.getNextRightTopPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getNextRightBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 1;
                this.relation[1] = 3;
                this.relation[2] = 3;
            }break;

            case 12 :{
                var pos0 = {x:-g_hexagon.w/2,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextLeftBottomPos(pos1),
                    pos3 = g_near_pos.getNextRightBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 4;
                this.relation[2] = 3;
            }break;

            case 13 :{
                var pos0 = {x:-g_hexagon.w/2,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getNextLeftBottomPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 4;
                this.relation[2] = 2;
            }break;

            case 14 :{
                var pos0 = {x:-g_hexagon.w,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getNextLeftBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 2;
                this.relation[2] = 4;
            }break;

            case 15 :{
                var pos0 = {x:-g_hexagon.w/2,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextLeftBottomPos(pos1),
                    pos3 = g_near_pos.getNextLeftBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 4;
                this.relation[2] = 4;
            }break;

            case 16 :{
                var pos0 = {x:g_hexagon.w/2,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getPrePos(pos1),
                    pos3 = g_near_pos.getNextLeftBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 5;
                this.relation[2] = 4;
            }break;

            case 17 :{
                var pos0 = {x:-g_hexagon.w/2,y:0},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 1;
                this.relation[2] = 1;
            }break;

            case 18 :{
                var pos0 = {x:-g_hexagon.w/2,y:-(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextLeftTopPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 0;
                this.relation[2] = 1;
            }break;

            case 19 :{
                var pos0 = {x:-g_hexagon.w,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getNextLeftBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 3;
                this.relation[2] = 4;
            }break;

            case 20 :{
                var pos0 = {x:-g_hexagon.w,y:-(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getAfterPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getNextLeftTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 2;
                this.relation[1] = 1;
                this.relation[2] = 0;
            }break;

            case 21 :{
                var pos0 = {x:-g_hexagon.w,y:g_hexagon.h/2},
                    pos1 = g_near_pos.getNextRightBottomPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getNextRightTopPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 3;
                this.relation[1] = 2;
                this.relation[2] = 1;
            }break;

            case 22:{
                var pos0 = {x:-g_hexagon.w/2,y:(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextLeftBottomPos(pos0),
                    pos2 = g_near_pos.getNextRightBottomPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 4;
                this.relation[1] = 3;
                this.relation[2] = 2;
            }break;

            case 23 :{
                var pos0 = {x:-g_hexagon.w/2,y:-(g_hexagon.h + g_hexagon.side)/2},
                    pos1 = g_near_pos.getNextLeftTopPos(pos0),
                    pos2 = g_near_pos.getNextRightTopPos(pos1),
                    pos3 = g_near_pos.getAfterPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 0;
                this.relation[1] = 1;
                this.relation[2] = 2;
            }break;

            case 24 :{
                var pos0 = {x:-g_hexagon.w,y:-g_hexagon.h/2},
                    pos1 = g_near_pos.getNextRightTopPos(pos0),
                    pos2 = g_near_pos.getAfterPos(pos1),
                    pos3 = g_near_pos.getNextRightBottomPos(pos2);
                self.drawFourShapes(pos0,pos1,pos2,pos3,colorNum);
                this.relation[0] = 1;
                this.relation[1] = 2;
                this.relation[2] = 3;
            }break;
        }

    }


});
