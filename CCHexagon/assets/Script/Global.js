// 全局的信息

// 单个六边形相关信息
var g_hexagon = {
    centerPos: {x: 0,y: 0},
    w: 66,//55,
    h: 78,//66,
    space: 7,
    side:28,
    a:1,
    b:2,
}

const g_config = {
    touch_move_space:3,
    shape_touch_up:80,
}

const g_line_right = [
    [{row:0,column:0}, {row:1,column:0}, {row:2,column:0}, {row:3,column:0}, {row:4,column:0},],
    [{row:0,column:1}, {row:1,column:1}, {row:2,column:1}, {row:3,column:1}, {row:4,column:1}, {row:5,column:0}],
    [{row:0,column:2}, {row:1,column:2}, {row:2,column:2}, {row:3,column:2}, {row:4,column:2}, {row:5,column:1}, {row:6,column:0}],
    [{row:0,column:3}, {row:1,column:3}, {row:2,column:3}, {row:3,column:3}, {row:4,column:3}, {row:5,column:2}, {row:6,column:1}, {row:7,column:0}],
    [{row:0,column:4}, {row:1,column:4}, {row:2,column:4}, {row:3,column:4}, {row:4,column:4}, {row:5,column:3}, {row:6,column:2}, {row:7,column:1}, {row:8,column:0}],
    [{row:1,column:5}, {row:2,column:5}, {row:3,column:5}, {row:4,column:5}, {row:5,column:4}, {row:6,column:3}, {row:7,column:2}, {row:8,column:1}],
    [{row:2,column:6}, {row:3,column:6}, {row:4,column:6}, {row:5,column:5}, {row:6,column:4}, {row:7,column:3}, {row:8,column:2}],
    [{row:3,column:7}, {row:4,column:7}, {row:5,column:6}, {row:6,column:5}, {row:7,column:4}, {row:8,column:3}],
    [{row:4,column:8}, {row:5,column:7}, {row:6,column:6}, {row:7,column:5}, {row:8,column:4}]
];

const g_line_left = [
    [{row:4,column:0}, {row:5,column:0}, {row:6,column:0}, {row:7,column:0}, {row:8,column:0}],
    [{row:3,column:0}, {row:4,column:1}, {row:5,column:1}, {row:6,column:1}, {row:7,column:1}, {row:8,column:1}],
    [{row:2,column:0}, {row:3,column:1}, {row:4,column:2}, {row:5,column:2}, {row:6,column:2}, {row:7,column:2}, {row:8,column:2}],
    [{row:1,column:0}, {row:2,column:1}, {row:3,column:2}, {row:4,column:3}, {row:5,column:3}, {row:6,column:3}, {row:7,column:3}, {row:8,column:3}],
    [{row:0,column:0}, {row:1,column:1}, {row:2,column:2}, {row:3,column:3}, {row:4,column:4}, {row:5,column:4}, {row:6,column:4}, {row:7,column:4}, {row:8,column:4}],
    [{row:0,column:1}, {row:1,column:2}, {row:2,column:3}, {row:3,column:4}, {row:4,column:5}, {row:5,column:5}, {row:6,column:5}, {row:7,column:5}],
    [{row:0,column:2}, {row:1,column:3}, {row:2,column:4}, {row:3,column:5}, {row:4,column:6}, {row:5,column:6}, {row:6,column:6}],
    [{row:0,column:3}, {row:1,column:4}, {row:2,column:5}, {row:3,column:6}, {row:4,column:7}, {row:5,column:7}],
    [{row:0,column:4}, {row:1,column:5}, {row:2,column:6}, {row:3,column:7}, {row:4,column:8}]
];

var g_getRelativePos = {
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
    // 计算当前六边形左上方六边形的坐标
    getNextLeftTopPos:function(pos){
        var newPos = {};
        newPos.x = pos.x - (g_hexagon.w + g_hexagon.space) / 2;
        newPos.y = pos.y + Math.sqrt(3) / 2 * (g_hexagon.w + g_hexagon.space);
        return newPos;
    },
    // 计算当前六边形右上方六边形的坐标
    getNextRightTopPos:function(pos){
        var newPos = {};
        newPos.x = pos.x + (g_hexagon.w + g_hexagon.space) / 2;
        newPos.y = pos.y + Math.sqrt(3) / 2 * (g_hexagon.w + g_hexagon.space);
        return newPos;
    },
    getPrePos:function(pos){
        return {
            x:pos.x - (g_hexagon.w + g_hexagon.space),
            y:pos.y
        }
    },
    getAfterPos:function(pos){
        return {
            x:pos.x + g_hexagon.w + g_hexagon.space,
            y:pos.y
        }
    }
}

var tool = {
    getPointsAddress:function(vec1,vec2){
        //return Math.hypot(vec1.x - vec2.x , vec1.y - vec2.y);
        return Math.sqrt( (vec1.x - vec2.x)*(vec1.x - vec2.x) + (vec1.y - vec2.y)*(vec1.y - vec2.y) );
    },
    tween:{
        linear:function(from,to,callback){
            var update = from;
            var ratio = 5;
            (function loop(){
                var raf = requestAnimationFrame(loop);
                update += ratio;
                if(update>to){
                    update = to;
                    cancelAnimationFrame(raf);
                }
                callback(update);
            })();
        }
    },
    test:'1'
}

module.exports = {
    g_hexagon:g_hexagon,
    g_near_pos:g_getRelativePos,
    g_config:g_config,
    g_tools:tool,
    g_line:{
      right:g_line_right,
      left:g_line_left
    }
}
