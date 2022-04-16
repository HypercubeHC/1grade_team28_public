
let world;

const is_debug = true;

var cell_size = 9;
var grid_w = 80;
var grid_h = 80;
var nest_x = 40;
var nest_y = 40;

var all_ants = 25;
var all_food = 15;
// TODO: implement capacity - step 1 - for all; step 2 - individual
var food_quantity = Infinity;
var all_walls = 15;
var wall_size = 100;

const delivery_state = "Delivery";
const collector_mode = "Scavenger";

const default_values = {
    'foodcapLabel': food_quantity,
    'foodamtLabel': all_food,
    'antdamtLabel': all_ants,
    'wallamtLabel': all_walls
};

function debugPrint(text){
    if (is_debug == true)
        console.log(text)
}

function settings(){
    document.getElementsByClassName('settings')[0].hidden = !document.getElementsByClassName('settings')[0].hidden;
}

function findLabels() {
    const labels = Array.from(document.getElementsByTagName('label'));
    debugPrint(labels)
    labels.forEach((element) => {
        if (element.innerHTML == ''){
            setLabelValue(element.id, default_values[element.id]);
            debugPrint(element.id);
        }
    })
   
}

//функции для слайдеров, изменение значения
function setLabelValue(label_id, value){
    value == Infinity ? value = '&infin;' : value = value
    document.getElementById(label_id).innerHTML = value
}

function updateFoodCap(value){
    value < 500 ? new_value = value : new_value = Infinity;
    debugPrint('Food capacity: ' + food_quantity + ' -> ' + value + '(set to ) '+ new_value);
    food_quantity = new_value;
    setLabelValue('foodcapLabel', new_value);
}

function updateFoodAmt(value){
    setLabelValue('foodamtLabel', value)
    debugPrint('Food amount: ' + all_food + ' -> '+ value)
    all_food = value;
}

function updateAntAmt(value){
    setLabelValue('antdamtLabel', value)
    debugPrint('Ant amount: ' + all_ants + ' -> '+ value)
    all_ants = value;
}

function updateWallAmt(value){
    setLabelValue('wallamtLabel', value)
    debugPrint('Food: ' + all_walls + ' -> '+ value)
    all_walls = value;
}

//запуск
function setup() {
    findLabels();
    const canvas = createCanvas(grid_w * cell_size, grid_h * cell_size);
    canvas.parent("canvas-container");
    document.getElementById("canvas-container").style.width =
        grid_w * cell_size + "px";
    document.getElementById("canvas-container").style.height =
        grid_h * cell_size + "px";
    frameRate(15);
    colorMode(HSB);
    background(20, 100, 0);
    strokeWeight(0);
    world = create_world();
    world.render();
}

//отрисовка
function draw() {
    world.update();
    world.render();
}

//функции для кнопок
const fast_speed = () => {
    frameRate(30);
};
const slow_speed = () => {
    frameRate(5);
};
const normal_speed = () => {
    frameRate(15);
};
const start_stop = () => {
    if (isLooping())
        noLoop();
    else
        loop();
};
const reset_simulation = () => {
    world = create_world();
};

// создание объкта класса
const create_world = () => {
    let new_world;
    do
        new_world = new World();
    while (new_world.adj_pos[new_world.nest.position.x][new_world.nest.position.y]
        .length === 0);
    return new_world;
};
