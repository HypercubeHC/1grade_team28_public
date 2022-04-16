let canvas = document.createElement('canvas');
canvas.id = "MyCanvas";
canvas.width = 1000;
canvas.height = 700;
document.body.appendChild(canvas);
ctx = canvas.getContext("2d");
let best;
let array_of_node = [];
let pi = Math.PI;
let mode;
let it = 0;
let n_population;

function shuffle(array) {//создание перемешанных массивов
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function DistanceFromTwoPoints (arr1, arr2) {
    let dst = Math.sqrt(Math.pow((arr2[0] - arr1[0]), 2) + Math.pow((arr2[1] - arr1[1]), 2));
    return dst;
}

function Population(bag, adjacency_mat) {//класс популяции
    this.len = null;
    this.a = null;//sum
    this.bag = bag;
    this.parents = [];
    this.score = 0;
    this.best = null;
    this.adjacency_mat = adjacency_mat;
    this.fitness = function (chromosome) {
        for(let i = 0; i < chromosome.length - 1; i++) {
            this.a += this.adjacency_mat[chromosome[i]][chromosome[i+1]];
        }
        return this.a;
    }
    this.evaluate = function () {   //оценка особей
        let distances = new Array(n_population);
        for (let i = 0; i < this.bag.length; i++) {
            distances[i] = this.fitness(bag[i]);
            this.a = null;
        }
        this.score = Math.min.apply(null, distances);
        this.best = this.bag[distances.indexOf(this.score)];
        this.parents.push(this.best);
        if(Math.max.apply(null, distances) !== Math.min.apply(null, distances)) {
            let max = Math.max.apply(null, distances);
            for(let i = 0; i < distances.length; i++) {
                distances[i] = Math.abs(distances[i] - max);
            }
        }
        let sum = null;
        for(let i = 0; i < distances.length; i++) {
            sum = sum + distances[i];
        }
        for(let i = 0; i < distances.length; i++) {
          distances[i] = distances[i] / sum;
        }
        return distances;
    }
    this.select = function (k = n_population / 2) {    //выбрать самых лучших
        let fit = this.evaluate();
        while (this.parents.length < k) {
            let idx = getRandomInt(fit.length);
            if(fit[idx] > Math.random()) {
                this.parents.push(this.bag[idx]);
            }
        }
    }
    this.crossover = function (p_cross = 0.7) {//скрещивание
        let children = [];
        let count = this.parents.length; //height
        //console.log(count);
        let size = this.parents[0].length; //width
        for(let i = 0; i < this.bag.length; i++) {
            if(Math.random() > p_cross) {
                children.push(this.parents[getRandomInt(count)]);
            }
            else {
                let index1 = getRandomInt(count);
                let index2 = getRandomInt(count);
                let parent1 = this.parents[index1];
                let parent2 = this.parents[index2];
                index1 = getRandomInt(size);
                index2 = getRandomInt(size);
                while(index1 === index2) {
                    index2 = getRandomInt(size);
                }
                let idx = [index1, index2];
                let start = Math.min.apply(null, idx);
                let end = Math.max.apply(null,idx);
                let child = new Array(size);
                for(let i = start; i <= end; i++) {
                    child[i] = parent1[i];
                }
                let pointer = 0;
                for(let i = 0; i < size; i++) {
                    if(child[i] === undefined) {
                        while(child.indexOf(parent2[pointer]) !== -1) {
                            pointer +=1;
                        }
                        child[i] = parent2[pointer];
                    }
                }
                children.push(child);
            }
        }
        return children;
    }
    this.mutate = function (p_cross = 0.7, p_mut = 0.1) {//мутация
        let next_bag = [];
        let children = this.crossover(p_cross);
        for(let i = 0; i < children.length; i++) {
            if(Math.random() < p_mut) {
                next_bag.push(swap(children[i]));
            }
            else {
                next_bag.push(children[i]);
            }
        }
        return next_bag
    }
}

function init_population(cities, n_population, pop) {//инициализация популяции
    for (let i = 0; i < n_population; i++) {
        let arr1 = [];
        for(let i = 0; i < cities.length; i++) {
            arr1[i] = cities[i];
        }
        shuffle(arr1);
        pop.bag[i] = arr1;
    }
}

function swap (chromosome) {
    let a = getRandomInt(chromosome.length);
    let b = getRandomInt(chromosome.length);
    let temp = chromosome[a];
    chromosome[a] = chromosome[b];
    chromosome[b] = temp;
    return chromosome;
}

function draw_path(path) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < array_of_node.length; i++) {
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "black";
        ctx.fillStyle="black";
        ctx.arc(array_of_node[i][0], array_of_node[i][1], 8, 0, 2*pi, false);
        ctx.stroke();
        ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(array_of_node[path[0]][0], array_of_node[path[0]][1]);
    for(let i = 1; i < path.length; i++) {
        ctx.lineTo(array_of_node[path[i]][0], array_of_node[path[i]][1]);
    }
    ctx.lineWidth = 2;
    ctx.stroke();
}

function genetic_algorithm(adjacency_mat, cities){
    console.log("Алгоритм:");
    let arrayofbag = [];
    let pop = new Population(arrayofbag, adjacency_mat);
    init_population(cities, n_population, pop);
    best = pop.best;
    let score = 100000;
    for (let i=0; i < (n_population * 50); i++) {
        task(i);
    }
    function task(i) {//анимация
        setTimeout(function () {
            pop.select();
            //history.push(pop.score);
            if(i % 10 === 0) {
                console.log("Generation", i, " : ", pop.score);
            }
            if(pop.score < score) {
                best = pop.best;
                score = pop.score;
                draw_path(best);
            }
            let children = pop.mutate();
            pop = new Population(children, pop.adjacency_mat);
            //console.log(best);
        }, 30 * i);
    }

}

function getmatrix(arraynode) {//получает матрицу смежности
    let matrix = new Array(arraynode.length);
    for(let i = 0; i < arraynode.length; i++){
        matrix[i]=new Array(arraynode.length);
    }
    for(let i = 0; i < arraynode.length; i++){
        matrix[i][i] = 0;
    }
    for(let i = 0; i < arraynode.length; i++) { //строка
        for(let j = i + 1; j < arraynode.length; j++) { //столбец
            matrix[i][j] = matrix[j][i] = DistanceFromTwoPoints(arraynode[i], arraynode[j]) //0,1
        }
    }
    return matrix;
}

document.getElementById('MyCanvas')
    .addEventListener('mousedown',event => {
        if(mode === 'create') {
            let rect = document.getElementById('MyCanvas').getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            if(it === 0) {
                it++;
                ctx.beginPath();
                ctx.lineWidth = 7;
                ctx.strokeStyle = "black";
                ctx.fillStyle="black";
                ctx.arc(x, y, 8, 0, 2*pi, false);
                ctx.stroke();
                ctx.fill();
                let xy = [x, y];
                array_of_node.push(xy);
                console.log("x: " + x + " y: " + y);
                console.log(array_of_node);
            }
            if(it > 0 && (array_of_node[it - 1][0] !== x) && (array_of_node[it - 1][1] !== y)) {
                it++;
                ctx.beginPath();
                ctx.lineWidth = 7;
                ctx.strokeStyle = "black";
                ctx.fillStyle="black";
                ctx.arc(x, y, 8, 0, 2*pi, false);
                ctx.stroke();
                ctx.fill();
                let xy = [x, y];
                array_of_node.push(xy);
                console.log("x: " + x + " y: " + y);
                console.log(array_of_node);
            }
        }
        }
    );

document.getElementById('buttons')
    .addEventListener('click', event => {
        if (event.target.className === 'btn-start') {
            mode = 'start';
            console.log('start');
            let ada = getmatrix(array_of_node);
            console.log(ada);
            console.log(ada.length);
            n_population = ada.length * 3;
            let cities = [];
            for(let i = 0; i < ada.length; i++) {
                cities[i] = i;
            }
            genetic_algorithm(ada, cities);
        }
        if (event.target.className === 'btn-create') {
            mode = 'create';
            console.log('Отметьте точки');
        }
        if (event.target.className === 'btn-reset') {
            mode = 'create';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            array_of_node = [];
            it = 0;
        }
    });