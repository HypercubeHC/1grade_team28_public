class KMeans {

    //
    /*starts = 0;
    array_of_node = [];
    //

    groups = [];
    dots = [];
    clusterNumber = 0;
    entriesNumber = 0;

    flag = false;
    WIDTH = 0;
    HEIGHT = 0;
    svg = null;
    lineg;
    dotg;
    centerg;
    /*constructor(circleNumber, clusterNumber){
        this.initArea();
      //  this.init(circleNumber, clusterNumber);
       // this.draw();
    }*/
    constructor() {
        this.starts = 0;
        this.array_of_node = [];
        this.check = 0;
        //

        this.groups = [];
        this.dots = [];
        this.clusterNumber = 0;
        this.entriesNumber = 0;

        this.flag = false;
        this.WIDTH = 0;
        this.HEIGHT = 0;
        this.svg = null;
        this.lineg;
        this.dotg;
        this.centerg;
    }

    initArea(){
        const that = this;
        this.flag = false;
        //this.WIDTH = d3.select("#kmeans")[0][0].clientWidth - 100; //20
        //this.HEIGHT = Math.max(300, this.WIDTH * .7);
        this.WIDTH = 1720;
        this.HEIGHT = 750;
        this.svg = d3.select("#kmeans svg")
            .attr('width', this.WIDTH)
            .attr('height', this.HEIGHT)
            .style('padding', '5px') //10
            .style('background', '#83abd4')
            .style('cursor', 'pointer')
            .on('click', function() {
                if(kmeans.starts === 1) {
                    while(kmeans.check !== 1) {
                        d3.event.preventDefault();
                        that.step();
                    }
                }
            });

        this.lineg = this.svg.append('g');
        this.dotg = this.svg.append('g');
        this.centerg = this.svg.append('g');
    }

    init(circleNumber, clusterNumber) {
        this.clusterNumber = circleNumber;
        //this.entriesNumber = clusterNumber || 50;
        console.log('инициализация');
        this.initGroups();
        this.entriesNumber = this.array_of_node.length;
        this.initDots();//тут
    }

    initGroups(){
        this.groups = [];
        for (let i = 0; i < this.clusterNumber; i++) {
            let g = {
                id: 'group_'+i,
                dots: [],
                color: 'hsl(' + (i * 360 / this.clusterNumber) + ',100%,50%)',
                center: {
                    x: Math.random() * this.WIDTH,
                    y: Math.random() * this.HEIGHT
                },
                init: {
                    center: {}
                }
            };
            g.init.center = {
                x: g.center.x,
                y: g.center.y
            };
            this.groups.push(g);

        }
        console.log('groups: ', this.groups);
    }

    initDots(){
        this.dots = [];
        this.flag = false;
        for (let i = 0; i < this.entriesNumber; i++) {
            let dot ={
                x: this.array_of_node[i][0],
                y: this.array_of_node[i][1],
                group: undefined
            };
            dot.init = {
                x: dot.x,
                y: dot.y,
                group: dot.group
            };
            this.dots.push(dot);
        }
        console.log('dots: ', this.dots);
    }

    step() {
        if (this.flag) {
            this.moveCenter();
        } else {
            this.updateGroups();
        }
        this.draw();
        this.flag = !this.flag;
    }

    draw() {
        this.drawCircles();

        if (this.dots[0].group) {
            this.drawLines();
        } else {
            this.lineg.selectAll('line').remove();
        }

        let c = this.centerg.selectAll('path').data(this.groups);
        let updateCenters = function(centers) {
            centers
                .attr('transform', function(d) { return "translate(" + d.center.x + "," + d.center.y + ") rotate(45)";})
                .attr('fill', function(d,i) { return d.color; })
                .attr('stroke', '#aabbcc');
        };
        c.exit().remove();
        updateCenters(c.enter()
            .append('path')
            .attr('d', d3.svg.symbol().type('cross'))
            .attr('stroke', '#aabbcc'));
        updateCenters(c
            .transition()
            .duration(500));
    }

    drawCircles(){
        let circles = this.dotg.selectAll('circle').data(this.dots);
        circles.enter().append('circle');
        circles.exit().remove();
        circles
            .transition()
            .duration(1000)
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('fill', function(d) { return d.group ? d.group.color : '#ffffff'; })
            .attr('r', 5);
    }

    drawLines(){
        let l = this.lineg.selectAll('line').data(this.dots);
        let updateLine = function(lines) {

            lines
                .attr('x1', function(d) { return d.x; })
                .attr('y1', function(d) { return d.y; })
                .attr('x2', function(d) { return d.group.center.x; })
                .attr('y2', function(d) { return d.group.center.y; })
                .attr('stroke', function(d) { return d.group.color; });
        };
        (l.enter().append('line'));
        updateLine(l.transition().duration(500));
        l.exit().remove();
    }

    moveCenter() {
        let finished = false;
        this.groups.forEach(function(group, i) {

            finished = true;

            if (group.dots.length == 0) return;

            let x = 0, y = 0;
            group.dots.forEach(function(dot) {
                x += dot.x;
                y += dot.y;
            });

            let oldPos = {x: group.center.x, y: group.center.y};

            group.center = {
                x: x / group.dots.length,
                y: y / group.dots.length
            };
            let newPos = {x: group.center.x, y: group.center.y};

            if (oldPos.x !== newPos.x || oldPos.y !== newPos.y) finished = false;
        });

        if (finished){
            this.check = 1;
            console.log('Done');
        }
    }

    updateGroups() {
        const that = this;
        this.groups.forEach(function(g) { g.dots = []; });
        this.dots.forEach(function(dot) {
            let min = Infinity;
            let group;
            that.groups.forEach(function(g) {
                let d = Math.pow(g.center.x - dot.x, 2) + Math.pow(g.center.y - dot.y, 2);
                if (d < min) {
                    min = d;
                    group = g;
                }
            });
            group.dots.push(dot);
            dot.group = group;
        });
    }


}

let kmeans = new KMeans();
let array_node = [];
let mode = 0;
//kmeans.initArea();
console.log(kmeans.starts);
let iter = 0;
const CANVAS = document.getElementById("canvas");
CANVAS.addEventListener("click", check);

function check(event) {
    if(mode === 0) {
        console.log('нажал');
        var rect = document.getElementById('canvas').getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        if (iter === 0) {
            iter++;
            var xy = [x, y];
            array_node.push(xy);
        }
        if (iter > 0 && (array_node[iter - 1][0] !== x) && (array_node[iter - 1][1] !== y)) {
            iter++;
            var xy = [x, y];
            array_node.push(xy);
        }
        let can = document.getElementById('canvas');
        let ns = "http://www.w3.org/2000/svg";
        let circle = document.createElementNS(ns, 'circle');
        circle.id = 'circles';
        circle.setAttribute('r', 10);
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('fill', 'wheat');
        can.append(circle);
    }
}
function push() {
    console.log('удаление');
    while (document.getElementById('circles') !== null) {
        let circle = document.getElementById('circles');
        console.log(circle);
        circle.remove();
    }
    for(let i = 0; i < array_node.length; i++) {
        kmeans.array_of_node.push(array_node[i]);
    }
    let clust = Number(document.getElementById("val").value);
    kmeans.init(clust, kmeans.array_of_node.length);
    kmeans.draw();
    console.log(kmeans.array_of_node);
    mode = 1;
}
