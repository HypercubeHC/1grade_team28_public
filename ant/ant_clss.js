//вспомогательные константы позиций
const get_cell = (position) => world.grid[position.x][position.y];
const get_adj_cell_pos = (position) => world.adj_pos[position.x][position.y];
const is_same_position = (pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y;

class World {
    constructor(init_values = {
        //объявляем параметры
        grid_x_pos: grid_w,
        grid_y_pos: grid_h,
        wall_count: all_walls,
        ants: all_ants,
        nest_x_pos: nest_x,
        nest_y_pos: nest_y,
        food: all_food,
    }) {
        //инициализация мира и объектов в нем
        const { grid_x_pos, grid_y_pos, wall_count, ants, nest_x_pos, nest_y_pos, food } = init_values;
        this.grid_x_pos = grid_x_pos;
        this.grid_y_pos = grid_y_pos;
        this.grid = this.init_grid();
        this.nest = this.init_nest(nest_x_pos, nest_y_pos);
        this.adj_pos = this.get_adj_positions();
        this.add_walls(wall_count);
        if (food)
            this.init_food(food);
        this.adj_pos = this.get_adj_positions();
        this.ants = this.init_ants(ants);
        this.render_all_once();
    }
    init_grid() {
        //инициализация сетки
        const grid = [];
        for (let x = 0; x < this.grid_x_pos; x++) {
            grid.push([]);
            for (let y = 0; y < this.grid_y_pos; y++)
                grid[x][y] = new Cell(x, y);
        }
        return grid;
    }
    // добавляение стен в рандомном порядке с учетом размера стен, минуя гнездо
    add_walls(quantity) {
        while (quantity--) {
            let x = Math.floor(Math.random() * this.grid_x_pos);
            let y = Math.floor(Math.random() * this.grid_y_pos);
            let expansions = wall_size;
            do {
                this.grid[x][y].create_wall(this);
                this.adj_pos[x][y].forEach((position) => {
                    if (this.grid[position.x][position.y].type !== "Nest")
                        this.grid[position.x][position.y] = new Wall(position.x, position.y);
                }, this);
                let next_pos = random(this.adj_pos[x][y]);
                x = next_pos.x;
                y = next_pos.y;
            } while (expansions--);
        }
    }
    get_adj_positions() {
        const adj_pos = [];
        for (let x = 0; x < this.grid_x_pos; x++) {
            adj_pos.push([]);
            for (let y = 0; y < this.grid_y_pos; y++) {
                const neighbours = this.get_Neighbours(x, y);
                adj_pos[x][y] = [];
                neighbours.forEach((position) => {
                    try {
                        const cell = this.grid[position.x][position.y];
                        if (cell.type !== "Wall")
                            adj_pos[x][y].push(position);
                    }
                    catch (error) {
                        if (!(error instanceof TypeError))
                            throw error;
                    }
                }, this);
            }
        }
        return adj_pos;
    }
    get_Neighbours(x, y) {
        return [
            //функция p5
            createVector(x - 1, y - 1),
            createVector(x, y - 1),
            createVector(x + 1, y - 1),
            createVector(x - 1, y),
            createVector(x + 1, y),
            createVector(x - 1, y + 1),
            createVector(x, y + 1),
            createVector(x + 1, y + 1),
        ];
    }
    init_nest(nest_x_pos, nest_y_pos) {
        const nest = new Nest(nest_x_pos, nest_y_pos);
        this.grid[nest_x_pos][nest_y_pos] = nest;
        return nest;
    }
    init_ants(ants) {
        const ants_array = [];
        for (; ants;)
            for (; ants; ants--)
                ants_array.push(new Ant(this.nest.position.x, this.nest.position.y));
        return ants_array;
    }
    //set food
    init_food(food) {
        while (food--) {
            const x = Math.floor(Math.random() * this.grid_x_pos);
            const y = Math.floor(Math.random() * this.grid_y_pos);
            if (!(x === this.nest.position.x && y === this.nest.position.y || this.grid[x][y].type === "Wall"))
                this.grid[x][y] = new Food(x, y);
            else
                food++;
        }
    }
    print_steps(to_print = "nest") {
        if (to_print === "nest") {
            // console.log("Distance from nest");
            for (let y = 0; y < this.grid_y_pos; y++) {
                let distance = "";
                for (let x = 0; x < this.grid_x_pos; x++)
                    if (x === this.nest.position.x && y === this.nest.position.y)
                        distance += "x|";
                    else
                        distance +=
                            this.grid[x][y].type === "Wall"
                                ? "o|"
                                : this.grid[x][y].nest_distance ===
                                Number.MAX_SAFE_INTEGER
                                    ? "-|"
                                    : this.grid[x][y].nest_distance + "|";
                console.log(distance);
            }
        }
        else {
            // console.log("Distance from food sources");
            for (let y = 0; y < this.grid_y_pos; y++) {
                let distance = "";
                for (let x = 0; x < this.grid_x_pos; x++)
                    if (x === this.nest.position.x && y === this.nest.position.y)
                        distance += "x|";
                    else
                        distance +=
                            this.grid[x][y].type === "Wall"
                                ? "o|"
                                : this.grid[x][y].food_distance === -1
                                    ? "-|"
                                    : this.grid[x][y].food_distance + "|";
                console.log(distance);
            }
        }
    }
    update() {
        for (let x = 0; x < this.grid_x_pos; x++)
            for (let y = 0; y < this.grid_y_pos; y++)
                this.grid[x][y].update();
        this.ants.forEach((ant) => ant.update());
    }
    render_all_once() {
        for (let x = 0; x < this.grid_x_pos; x++)
            for (let y = 0; y < this.grid_y_pos; y++)
                this.grid[x][y].render();
    }
    //отрисовка объектов
    render() {
        for (let x = 0; x < this.grid_x_pos; x++)
            for (let y = 0; y < this.grid_y_pos; y++)
                if (this.grid[x][y].type !== "Wall")
                    this.grid[x][y].render();
        this.ants.forEach((ant) => ant.render());
        this.nest.render();
    }
}
class Wall {
    constructor(x, y) {
        this.position = createVector(x, y); //функция p5
        this.size = cell_size;
        this.type = "Wall";
    }
    //размещение объектов на сетке
    create_wall(world) {
        if (!(this.position.x === world.nest.position.x &&
            this.position.y === world.nest.position.y))
            world.grid[this.position.x][this.position.y] = new Wall(this.position.x, this.position.y);
    }
    //обновление
    update() { }
    render() {
        //fill заполянет цветом стены, в данном случае серый
        fill(240, 0, 75);
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
}
class Ant extends Wall {
    constructor(x, y) {
        super(x, y);
        this.type = "Ant";
        this.state = collector_mode;
        this.steps_from_nest = 0;
        this.steps_from_food = -1;
        this.erase = false;
        this.prev_position = createVector(-1, -1);
    }
    update() {
        //регулярное обновление муравья на каждом обновлении мира
        if (world.grid[this.position.x][this.position.y].type === "Nest")
            this.reached_nest();
        if (world.grid[this.position.x][this.position.y].type === "Food")
            this.reached_food();
        get_cell(this.position).step_on_cell();
        this.steps_from_nest++;
        if (this.steps_from_food >= 0)
            this.steps_from_food++;
        let new_pos;
        if (this.state === collector_mode) {
            if (this.is_close_to_nest() ||
                !(new_pos = this.get_min_distance_to_food()) ||
                is_same_position(new_pos, this.prev_position))
                do
                    new_pos = this.random_walking();
                while (
                    get_adj_cell_pos(this.position).length !== 1 &&
                    is_same_position(new_pos, this.prev_position));
        }

        else {
            new_pos = this.get_min_nest_distance_to_cell();
            if (this.erase)
                get_cell(this.position).erase_food_trail();
        }
        if (this.is_diagonal(new_pos)) {
            this.steps_from_nest++;
            if (this.steps_from_food >= 0)
                this.steps_from_food++;
        }

        this.save_old_position();
        this.update_position(new_pos);
        if (this.state === collector_mode)
            this.update_nest_distance();
        else if (this.steps_from_food !== -1)
            get_cell(this.position).set_food_distance(this.steps_from_food);

    }
    //поиск кратчайшего пути
    get_min_distance_to_food() {
        const init_distance = get_cell(this.position).food_distance === -1
            ? Number.MAX_SAFE_INTEGER
            : get_cell(this.position).food_distance;
        const new_pos = world.adj_pos[this.position.x][this.position.y].reduce((food_pos, next_pos) => {
            if (world.grid[next_pos.x][next_pos.y].food_distance === -1)
                return food_pos;
            if (world.grid[food_pos.x][food_pos.y].food_distance === -1)
                return next_pos;
            if (world.grid[food_pos.x][food_pos.y].food_distance !== -1 &&
                world.grid[next_pos.x][next_pos.y].food_distance <
                world.grid[food_pos.x][food_pos.y].food_distance)
                return next_pos;
            return food_pos;
        });
        if (get_cell(new_pos).food_distance >= init_distance)
            return undefined;
        if (world.grid[new_pos.x][new_pos.y].food_distance !== -1)
            return new_pos;
        return undefined;
    }
    //поиск кратчайшего пути
    get_min_nest_distance_to_cell() {
        return world.adj_pos[this.position.x][this.position.y].reduce((min_pos, next_pos) => {
            if (world.grid[next_pos.x][next_pos.y].nest_distance <
                world.grid[min_pos.x][min_pos.y].nest_distance)
                return next_pos;
            return min_pos;
        });
    }
    //имитация поведения муравья
    random_walking() {
        return random(world.adj_pos[this.position.x][this.position.y]);
    }
    is_close_to_nest() {
        return is_same_position(this.position, world.nest.position);
    }
    //муравей оставляет феромоны
    start_erase_food_trail() {
        this.erase = true;
    }

    //функции управления состоянием
    save_old_position() {
        this.prev_position.x = this.position.x;
        this.prev_position.y = this.position.y;
    }
    update_position(new_pos) {
        this.position.x = new_pos.x;
        this.position.y = new_pos.y;
    }
    update_nest_distance() {
        if (this.steps_from_nest > get_cell(this.position).nest_distance)
            this.steps_from_nest = get_cell(this.position).nest_distance;
        else
            get_cell(this.position).set_cells_nest_distance(this.steps_from_nest);
    }
    is_diagonal(new_pos) {
        return !(this.position.x === new_pos.x || this.position.y === new_pos.y);
    }
    //функция поведения, когда найдена еда
    reached_food() {
        this.steps_from_food = 0;
        get_cell(this.position).eat_food();
        if (get_cell(this.position).food_left <= 0)
            this.start_erase_food_trail();
        this.state = delivery_state;
    }
    //функция поведения когда вернулся в гнездо
    reached_nest() {
        this.steps_from_nest = 0;
        this.steps_from_food = -1;
        this.reset_prev_position();
        this.state = collector_mode;
        this.erase = false;
    }
    reset_prev_position() {
        this.prev_position.x = world.nest.position.x;
        this.prev_position.y = world.nest.position.y;
    }
    return() {
        this.state = delivery_state;
    }
    render() {
    //окрас муравьев в оранжевый цвет
        fill(20, 80, 80);
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
}

Ant.max_fuel = Math.max(grid_w, grid_h) * 1.5;
//класс клетки (ячейки на канве)
class Cell extends Wall {
    constructor(x, y, steps = 0) {
        super(x, y);
        this.type = "Cell";
        this.nest_distance = Number.MAX_SAFE_INTEGER;
        this.food_distance = -1;
        this.food_path = 0;
        this.steps = steps;
        this.step_duration = Cell.step_duration;
    }
    set_cells_nest_distance(steps_from_nest) {
        this.set_cells_distance(steps_from_nest, "nest");
    }
    set_food_distance(steps_from_food) {
        this.set_distance(steps_from_food, "food");
        this.food_path = Cell.food_max_dist;
        world.nest.food_distance = -1;
    }
    set_cells_distance(steps, object) {
        this.set_distance(steps, object);
        world.adj_pos[this.position.x][this.position.y].forEach((position) => {
            if (position.x === this.position.x || position.y === this.position.y)
                world.grid[position.x][position.y].set_distance(steps + 1, object);
            else
                world.grid[position.x][position.y].set_distance(steps + 2, object);
        }, this);
    }
    set_distance(steps, object) {
        if (object === "nest") {
            if (this.nest_distance > steps)
                this.nest_distance = steps;
        }
        else {
            if (this.food_distance === -1)
                this.food_distance = steps;
            else if (this.food_distance > steps)
                this.food_distance = steps;
        }
    }
    erase_food_trail() {
        this.food_path = 0;
    }
    step_on_cell() {
        this.add_step();
    }
    add_step(n = 1) {
        this.step_duration = Cell.step_duration;
        this.steps += n;
    }
    decrease_steps() {
        this.steps--;
    }
    update() {
        this.update_steps();
        this.food_path = Math.max(--this.food_path, 0);
        if (this.food_path === 0)
            this.food_distance = -1;
    }
    update_steps() {
        this.step_duration--;
        if (this.step_duration < 0)
            this.decrease_steps();
    }

    paint_special() {
        fill(0);
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
    render() {
        if (this.food_path === 0)
            fill(48, 2, Math.max(98 - this.steps * 2, 20)); // натоптанные тропинки
        else
            fill(110, 40, 100); // феромоновый след еды
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
}


Cell.step_duration = Math.max(grid_w, grid_h) * 10;
Cell.food_max_dist = Math.max(grid_w, grid_h) * 1.5;
class Food extends Cell {
    constructor(x, y) {
        super(x, y);
        this.type = "Food";
        this.food_distance = 0;
        this.food_left = food_quantity;
    }
    eat_food() {
        this.food_left--;
        console.log('eat 1, left: ' + this.food_left)
    }
    update() {
        if (this.food_left <= 0)
            world.grid[this.position.x][this.position.y] = new Cell(this.position.x, this.position.y);
    }
    render() {
        // рисуем еду, фиолетовая
        fill(300, 50, 50);
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
}
class Nest extends Cell {
    constructor(x, y) {
        super(x, y);
        this.type = "Nest";
        this.nest_distance = 0;
    }
    setNestDistance(steps_from_nest) {
    }
    step_on_cell() {
    }
    update() { }
    render() {
        // рисуем гнездо, красное
        fill(0, 100, 90);
        square(this.position.x * this.size, this.position.y * this.size, this.size);
    }
}


