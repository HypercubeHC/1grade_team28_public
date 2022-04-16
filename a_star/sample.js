const FIELD_SIZE = 1;
const TRACTORS_NUMBER = 4;
let ctx;
let cols, rows;
let grid = new Array(cols);
let openSet = [];
let closedSet = [];
let start;
let end;
let w, h;
let path = [];
var chk = 0;
let mode;

function generatMaze (columnsNumber, rowsNumber, tractorsNumber = 1) {//функция генерации лабиринта
    const map = []
    const tractors = []

    for (let y = 0; y < rowsNumber; y++) {
        const row = []

        for (let x = 0; x < columnsNumber; x++) {
            row.push('wall')
        }

        map.push(row)
    }

    const startX = getRandomFrom(Array(columnsNumber).fill(0).map((item, index) => index).filter(x => isEven(x)))
    const startY = getRandomFrom(Array(rowsNumber).fill(0).map((item, index) => index).filter(x => isEven(x)))

    for (let i = 0; i < tractorsNumber; i++) {
        tractors.push({ x: startX, y: startY })
    }

    setField(startX, startY, 'space')

    while (!isMaze()) {
        moveTractors()
    }

    return map

    function getField (x, y) {
        if (x < 0 || x >= columnsNumber || y < 0 || y >= rowsNumber) {
            return null
        }

        return map[y][x]
    }

    function setField (x, y, value) {
        if (x < 0 || x >= columnsNumber || y < 0 || y >= rowsNumber) {
            return null
        }

        map[y][x] = value
    }

    function getRandomFrom (array) {
        const index = Math.floor(Math.random() * array.length)
        return array[index]
    }

    function isEven (n) {
        return n % 2 === 0
    }

    function isMaze () {
        for (let x = 0; x < columnsNumber; x++) {
            for (let y = 0; y < rowsNumber; y++) {
                if (isEven(x) && isEven(y) && getField(x, y) === 'wall') {
                    return false
                }
            }
        }

        return true
    }

    function moveTractors () {
        for (const tractor of tractors) {
            const directs = []

            if (tractor.x > 0) {
                directs.push('left')
            }

            if (tractor.x < columnsNumber - 2) {
                directs.push('right')
            }

            if (tractor.y > 0) {
                directs.push('up')
            }

            if (tractor.y < rowsNumber - 2) {
                directs.push('down')
            }

            const direct = getRandomFrom(directs)

            switch (direct) {
                case 'left':
                    if (getField(tractor.x - 2, tractor.y) === 'wall') {
                        setField(tractor.x - 1, tractor.y, 'space')
                        setField(tractor.x - 2, tractor.y, 'space')
                    }
                    tractor.x -= 2
                    break
                case 'right':
                    if (getField(tractor.x + 2, tractor.y) === 'wall') {
                        setField(tractor.x + 1, tractor.y, 'space')
                        setField(tractor.x + 2, tractor.y, 'space')
                    }
                    tractor.x += 2
                    break
                case 'up':
                    if (getField(tractor.x, tractor.y - 2) === 'wall') {
                        setField(tractor.x, tractor.y - 1, 'space')
                        setField(tractor.x, tractor.y - 2, 'space')
                    }
                    tractor.y -= 2
                    break
                case 'down':
                    if (getField(tractor.x, tractor.y + 2) === 'wall') {
                        setField(tractor.x, tractor.y + 1, 'space')
                        setField(tractor.x, tractor.y + 2, 'space')
                    }
                    tractor.y += 2
                    break
            }
        }
    }
}

function removeFromArray(arr, elt) {
    for(let i = arr.length - 1; i>= 0; i--) {
        if(arr[i] == elt) {
            arr.splice(i,1);
        }
    }
}

function dist (x1, y1, x2, y2) {
    let dst = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    return dst;
}

function heuristic(a, b) {
    //let d = dist(a.i, a.j, b.i, b.j); //евклидово
    let d = Math.abs(a.i - b.i) + Math.abs(a.j-b.j);
    return d;
}

function Cell(i, j) {//класс в котором хранится информация о каждой клетке сетки
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.wall = false;

    this.show = function (col) {
        let elem = document.querySelector('[i="'+this.i+'"][j="'+this.j+'"]');
        if(col === "open") {
            elem.className = 'node_open';
        }
        if (col === "close") {
            elem.className = 'node_closed';
        }
        if(col === "path") {
            elem.className = 'node_path';
        }
        if(col === "complete_path") {
            elem.className = 'path_complete';
        }
    }

    this.addNeighbors = function(grid) {
        let i = this.i;
        let j = this.j;
        if (i < cols -  1) {
            this.neighbors.push(grid[i + 1][j]);
        }
        if(i > 0){
            this.neighbors.push(grid[i - 1][j]);
        }
        if (j < rows - 1) {
            this.neighbors.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.neighbors.push(grid[i][j - 1]);
        }

        //diagonals
        /*if (i > 0 && j > 0) {
            this.neighbors.push(grid[i - 1][j - 1]);
        }
        if (i < cols - 1 && j > 0) {
            this.neighbors.push(grid[i + 1][j - 1]);
        }
        if (i > 0 && j < rows - 1) {
            this.neighbors.push(grid[i - 1][j + 1]);
        }
        if (i < cols - 1 && j < rows - 1) {
            this.neighbors.push(grid[i + 1][j + 1]);
        }*/

    }
}

function create(){
    cols = rows =  Number(document.getElementById("val").value);
    console.log(cols);
    console.log(rows);
    let container = document.getElementById('container');
    container.style.gridTemplateColumns = "repeat(" + cols + ", 20px)";
    container.style.gridTemplateRows = "repeat(" + rows + ", 20px)";
    for(let i = 0; i < cols; i++) {
        for(let j = 0; j < rows; j++) {
            let node = document.createElement('div');
            node.className = 'node_node';
            node.id = 'node_' + ((i*10)+(j+1));
            node.setAttribute('I', i);
            node.setAttribute('J', j);
            container.appendChild(node);
        }
    }
    const map = generatMaze(cols, rows, TRACTORS_NUMBER)

    function getField (x, y) {
        if (x < 0 || x >= cols || y < 0 || y >= rows) {
            return null
        }

        return map[y][x]
    }

    function drawMap () {
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (getField(x, y) === 'wall') {
                    let wall = document.querySelector('[i="'+x+'"][j="'+y+'"]');
                    wall.className = "node_wall";
                    console.log("wall");
                }
            }
            console.log("=>");
        }
    }

    drawMap();

}

function pathfinding() {
    for(let i = 0; i < cols;i++){
        grid[i]=new Array(rows);
    }

    for(let i = 0; i < cols;i++){
        for(let j = 0; j < rows;j++) {
            grid[i][j] = new Cell(i, j);
        }
    }

    for(let i = 0; i < cols;i++){
        for(let j = 0; j < rows;j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    let st = document.getElementsByClassName("node_start");
    let i1 = st[0].getAttribute('i');
    let j1 = st[0].getAttribute('j');
    console.log(i1);
    console.log(j1);
    start = grid[i1][j1];
    start.wall = false;
    let en = document.getElementsByClassName("node_end");
    let i2 = en[0].getAttribute('i');
    let j2 = en[0].getAttribute('j');
    console.log(i2);
    console.log(j2);
    end = grid[i2][j2];
    end.wall = false;
    let walls = document.getElementsByClassName("node_wall");
    console.log(walls.length);
    for (let i = 0; i < walls.length; i++) {
        let x = walls[i].getAttribute('i');
        let y = walls[i].getAttribute('j');
        grid[x][y].wall = true;
        console.log(grid[x][y]);
    }
    openSet.push(start);
    let allcells = cols*rows;
    console.log("run");
    for (let i=0; i<allcells; i++) {
        if(chk === 1) {
            break;
        }
        task(i);
        // draw();
    }
    function task(i) {  //animation
        setTimeout(function () {
            draw();
        }, 100 * i);
    }
}

function draw(){//алгоритм поиска пути
    if(openSet.length > 0) {
        let winner = 0;
        for (let i = 0; i < openSet.length; i++) {
            if(openSet[i].f < openSet[winner].f) {
                winner = i;
            }
        }
        let current =  openSet[winner];
        path = [];
        let temp = current;
        path.push(temp);
        while (temp.previous) {
            path.push(temp.previous);
            temp = temp.previous;
        }
        if (current === end) {
            for(let i = 0; i < path.length; i++) {
                path[i].show("path");
            }
            let pathc = document.getElementsByClassName('path_complete');
            for (let i = 0; i < pathc.length; i++) {
                pathc[i].className = 'node_closed';
            }
            chk = 1;
            return;
        }
        removeFromArray(openSet, current);
        closedSet.push(current);

        let neighbors = current.neighbors;
        for(let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            if(!closedSet.includes(neighbor) && !neighbor.wall) {
                console.log(neighbor);
                let tempG = current.g + 1;


                let newPath = false;
                if (openSet.includes(neighbor)) {
                    if(tempG < neighbor.g) {
                        neighbor.g = tempG;
                        newPath = true;
                    }
                } else{
                    neighbor.g = tempG;
                    newPath = true;
                    openSet.push(neighbor);
                }
                if(newPath){
                    neighbor.h = heuristic(neighbor, end);            //heuristic
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.previous = current;
                }
            }
        }
    } else {
        console.log("no solution");
        for(let i = 0; i < closedSet.length; i++) {
            closedSet[i].show("close");
        }
        chk = 1;
        return;
    }

    for(let i = 0; i < openSet.length; i++) {
        openSet[i].show("open");
    }

    for(let i = 0; i < closedSet.length; i++) {
        closedSet[i].show("close");
    }

    for(let i = 0; i < path.length; i++) {
        path[i].show("complete_path");
        console.log("drawing");
    }
}

document.getElementById('buttons')
    .addEventListener('click', event => {
        if (event.target.className === 'btn-create') {
            console.log('create');
            create();
        }
        if (event.target.className === 'wall-create') {
            console.log('wall');
            mode = 'wall';
        }
        if (event.target.className === 'start-create') {
            console.log('start');
            mode = 'start';
        }
        if (event.target.className === 'end-create') {
            console.log('end');
            mode = 'end';
        }
        if(event.target.className === 'path-create') {
            console.log('start finding path');
            pathfinding();
        }
    });

document.getElementById('container')
    .addEventListener('mousedown', event => {
        if (mode === 'wall') {
            if((event.target.className === 'node_node') && (event.target.id !== 'container')){
                event.target.className = "node_wall";
            }
            else {
                if (event.target.id !== 'container') {
                    event.target.className = "node_node";
                }
            }
        }
        if (mode === 'start') {
            if(((event.target.className === 'node_wall')||(event.target.className === 'node_node')) && (event.target.id !== 'container')){
                let start = document.getElementsByClassName('node_start');
                if (start.length > 0)
                    start[0].className = "node_node";
                event.target.className = "node_start";
                let i = event.target.getAttribute('i');
                let j = event.target.getAttribute('j');
            }
            else {
                if (event.target.id !== 'container') {
                    event.target.className = "node_node";
                }
            }
        }
        if (mode === 'end') {
            if(((event.target.className === 'node_wall')||(event.target.className === 'node_node')) && (event.target.id !== 'container')){
                let end = document.getElementsByClassName('node_end');
                if (end.length > 0)
                    end[0].className = "node_node";
                event.target.className = "node_end";
                let i = event.target.getAttribute('i');
                let j = event.target.getAttribute('j');
            }
            else {
                if (event.target.id !== 'container') {
                    event.target.className = "node_node";
                }
            }
        }
    });