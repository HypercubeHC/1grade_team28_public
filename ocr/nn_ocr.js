//данная нейронная сеть является перцептроном и имеет два слоя: input и hidden
//простейший вид нейронных сетей. В основе лежит математическая модель восприятия
// информации мозгом, состоящая из сенсоров, ассоциативных и реагирующих элементов


//вспомогательные константы с использованием модуля math
const sum = math.sum;
const math_random = math.random;
const math_square = math.square;
const math_matrix = math.matrix;
const math_transposition = math.transpose;
const math_subtract = math.subtract;
const e = math.evaluate;
// передача каждого элемента матрицы в функцию act
const math_map = math.map;

class NeuralNetwork {
    constructor(input_nodes, hidden_nodes, output_nodes, learning_rate, wih, who) {
        this.input_n = input_nodes;
        // нейронная сеть состоит из двух слоев
        this.hidden_n = hidden_nodes;
        this.output_n = output_nodes;
        this.learningrate = learning_rate;

        // wih и who используются в weights.json и получаются при обучении модели, в среднем занимает 2.5 часа
        // wih - weight of input hidden layer
        // who = weight of hidden output layer
        this.wih = wih || math_subtract(math_matrix(math_random([hidden_nodes, input_nodes])), 0.5);
        this.who = who || math_subtract(math_matrix(math_random([output_nodes, hidden_nodes])), 0.5);

        // сигмоидная функиця активации, график в виде буквы S, применяется для сглаживания значений
        this.act = (matrix) => math_map(matrix, (x) => 1 / (1 + Math.exp(-x)));
    }

    //на входе массив градаций серого, на выходе массив с float 0-1
    static normalize_data = (data) => {
        return data.map((e) => (e / 255) * 0.99 + 0.01);
    };

    cache = { loss: [] };

    //рисование числа, принятие данных на вход
    forward = (input) => {
        const wih = this.wih;
        const who = this.who;
        const act = this.act;

        input = math_transposition(math_matrix([input]));

        // константы скрытого и выходного слоя
        const hidden_input_layer = e("wih * input", { wih, input });
        const hidden_output_layer = act(hidden_input_layer);
        const output_layer = e("who * hidden_output_layer", { who, hidden_output_layer });
        const actual = act(output_layer);

        // кэширование для функции ниже - backward
        this.cache.input = input;
        this.cache.hidden_output_layer = hidden_output_layer;
        this.cache.actual = actual;
        return actual;
    };

    backward = (object) => {
        const who = this.who;
        const input = this.cache.input;
        const hidden_out = this.cache.hidden_output_layer;
        const actual = this.cache.actual;

        object = math_transposition(math_matrix([object]));

        // расчет градиента функции ошибок E к функции активации A
        const d_err_d_act = math_subtract(object, actual);

        // расчет градиента функции активации к взвешенным суммам из выходного слоя
        const d_act_d_sums = e("actual .* (1 - actual)", {
            actual,
        });

        // расчет градиента ошибок потерь функции к весам скрытого выходного слоя
        const d_weight_hidden_out = e("(d_err_d_act .* d_act_d_sums) * hidden_out'", {
            d_err_d_act,
            d_act_d_sums,
            hidden_out,
        });

        // расчет взвешенной ошибки для скрытого слоя
        const hidden_err = e("who' * (d_err_d_act .* d_act_d_sums)", {
            who,
            d_err_d_act,
            d_act_d_sums,
        });

        // расчет градиента функции активации к взвешенным суммам скрытого слоя
        const hidden_d_act_d_sums = e("hidden_out .* (1 - hidden_out)", {
            hidden_out,
        });

        // расчет градиента функции потерь к весам выходного скрытого слоя
        this.cache.d_weight_inp_hidden = e("(hidden_err .* hidden_d_act_d_sums) * input'", {
            hidden_err,
            hidden_d_act_d_sums,
            input,
        });
        this.cache.d_weight_hidden_out = d_weight_hidden_out;
        this.cache.loss.push(sum(math_square(d_err_d_act)));
    };

    update = () => {
        const wih = this.wih;
        const who = this.who;
        const d_weight_inp_hidden = this.cache.d_weight_inp_hidden;
        const d_weight_hidden_out = this.cache.d_weight_hidden_out;
        const r = this.learningrate;

        //обновление текущего веса каждого слоя с учетом ошибок
        this.wih = e("wih + (r .* d_weight_inp_hidden)", { wih, r, d_weight_inp_hidden });
        this.who = e("who + (r .* d_weight_hidden_out)", { who, r, d_weight_hidden_out });
    };

    predict = (input) => {
        return this.forward(input);
    };

    train = (input, target) => {
        this.forward(input);
        this.backward(target);
        this.update();
    };
}

// параметры нейронной сети
const input_nodes = 784;
const output_nodes = 10;
const hidden_nodes = 100;
const learning_rate = 0.2;
const threshold = 0.5; //порог
let iter = 0;
const iterations = 5;

//пути
const training_data_path = "./mnist/mnist_train.csv";
const test_data_path = "./mnist/mnist_test.csv";
const weights_file_name = "weights.json";
//после обучения файл хранится здесь. в среднем нейросеть обучается 2,5 часа
const saved_weights_path = `./dist/weights.json`;

// заполняются во время подготовки данных
const training_data = [];
const training_labels = [];
const test_data = [];
const test_labels = [];
const saved_weights = {};

// шаг между сообщениями в окне, более краткая запись
const print_steps = 1000;

let n_n; // neural network

window.onload = async () => {
    // создание объекта
    n_n = new NeuralNetwork(input_nodes, hidden_nodes, output_nodes, learning_rate);

    train_button.disabled = true;
    test_button.disabled = true;
    load_weights_button.disabled = true;

    //получаем данные и готовим к обработке
    status.innerHTML = "Loading the data sets. Please wait ...<br>";

    const train_scv = await load_data(training_data_path, "CSV");

    //
    if (train_scv) {
        prepare_data(train_scv, training_data, training_labels);
        status.innerHTML += "Training data loaded...<br>";
    }

    const test_scv = await load_data(test_data_path, "CSV");

    if (test_scv) {
        prepare_data(test_scv, test_data, test_labels);
        status.innerHTML += "Test data loaded...<br>";
    }
    // из-за тренировки нейронной сети и генерации весов weights.json приходится запускать веб-приложение на сервере
    // если он не запущен, то нужно запустить exe или проверить пути, но на данный момент с ними должно быть все хорошо
    if (!train_scv || !test_scv) {
        status.innerHTML +=
            "Missed train/test data set. Server or path problem";
        return;
    }

    // кнопки включены, если модель не обучается
    train_button.disabled = false;
    test_button.disabled = false;

    const weights_json = await load_data(saved_weights_path, "JSON");

    // если есть сохраненный файл JSON с существующими предварительно обученными весами,
    // загружаем из него данные в saved_weights
    // в нем хранятся веса для wih и для who
    if (weights_json) {
        saved_weights.wih = weights_json.wih;
        saved_weights.who = weights_json.who;
        // включаем кнопку загрузки весов
        load_weights_button.disabled = false;
    }

    status.innerHTML += "Ready.<br><br>";
};

//загрузка данных
// fetch необходимое зло для генерации json
async function load_data(path, type) {
    try {
        const result = await fetch(path, {
            mode: "no-cors",
        });

        switch (type) {
            case "CSV":
                return await result.text();
                break;
            case "JSON":
                return await result.json();
                break;
            default:
                return false;
        }
    } catch {
        return false;
    }
}

function prepare_data(raw_data, object, labels) {
    // создание массива где каждый элемент соответствует одной строке в файле CSV
    raw_data = raw_data.split("\n");
    // удаление последнего элемента, иначе он будет ссылаться на пустую строку
    raw_data.pop();

    raw_data.forEach((current) => {
        // создаем массив где каждый элемент имеет значение серого цвета
        let sample = current.split(",").map((x) => +x);
        labels.push(sample[0]); // выделение первого образца, который неправильный
        sample.shift(); // удаление этого первого элемента
        //нормализация объека класса
        sample = NeuralNetwork.normalize_data(sample);
        // выделение образца данных в зависимости от того, где функция используется
        object.push(sample);
    });
}

//достаточно долгий процесс, если нужно сгенерировать новые веса. свежие сгенерированы 13.04.2022
function train() {
    // кноки отключены пока обучается модель, чтобы они снова стали активны, нужно перезагрузить страницу или подождать
    train_button.disabled = true;
    test_button.disabled = true;
    load_weights_button.disabled = true;
    download.innerHTML = "";

    // когда модель обучается, то записывает в журнал сообщения, в каждой итерации обозначается проход в
    // 1000 элементов набора. В каждой итерации обрабатывается образцов 60 000(mnist data set),
    // поэтому так долго
    if (iter < iterations) {
        iter++;
        status.innerHTML += "Starting training ...<br>";
        status.innerHTML += "Iteration " + iter + " of " + iterations + "<br>";
        // для каждого элемента training data
        training_data.forEach((current, index) => {
            //устанавливаем таймер с помощью метода setTimeout
            setTimeout(() => {
                // однократное кодирование label
                const label = training_labels[index];
                const one_hot_label = Array(10).fill(0);
                one_hot_label[label] = 0.99;

                n_n.train(current, one_hot_label);

                // проверка достижения заданного интервала 1000, затем делаем запись о прогрессе
                if (index > 0 && !((index + 1) % print_steps)) {
                    status.innerHTML += `finished  ${index + 1}  samples ... <br>`;
                }

                // проверка достижения итераций. их 5
                if (index === training_data.length - 1) {
                    status.innerHTML += `Loss:  ${
                        sum(n_n.cache.loss) / training_data.length
                    }<br><br>`;
                    n_n.cache.loss = [];
                    // после каждой итерации проходит тест
                    test("", true);
                }
            }, 0);
        });
    }
}

function test(_, in_training = false) {
    // пропускаем первый параметр, который не нужен. с первым параметром test не проходит
    // во время теста так же все кнопки отключены
    train_button.disabled = true;
    test_button.disabled = true;
    load_weights_button.disabled = true;

    status.innerHTML += "Starting testing ...<br>";

    let correct_predicts = 0;
    test_data.forEach((current, index) => {
        setTimeout(() => {
            const actual = test_labels[index];

            const predict = format_prediction(n_n.predict(current));
            predict === actual ? correct_predicts++ : null;

            // как и с тренировкой, в тесте тоже делаются записи о прохождении 1000
            if (index > 0 && !((index + 1) % print_steps)) {
                status.innerHTML += " finished " + (index + 1) + " samples ...<br>";
            }

            // проверка на завершение теста
            // делается запись о точности в конце теста, расчитывает синус числа формулы
            // точность вроде как идеальная, 97% в среднем, на самом деле надо еще делить на два.
            // однако как есть
            if (index >= test_data.length - 1) {
                status.innerHTML +=
                    "Accuracy: " +
                    Math.round((correct_predicts / test_data.length) * 100) + " %<br><br>";

                // проверка за завершение тренировки модели
                // проверка завершится записью Finished training
                if (iter + 1 > iterations) {
                    create_download_link();
                    //в случае завершения тренировки активируются кнопки
                    enable_all_buttons();
                    status.innerHTML += "Finished training.<br><br>";
                    iter = 0;
                } else if (in_training) {
                    // если тест вызывается из обучения и обучение еще не закончено, то продолжить обучение
                    train();
                } else {
                    // иначе активируется кнопки
                    enable_all_buttons();
                }
            }
        }, 0);
    });
}

function predict() {
    // получение и обработка изображения с canvas
    // вместо 50рх у нас 250рх, почему бы и нет, дата сет все равно один, да и в 50px рисовать трудно
    const temp_canvas = document.createElement("canvas");
    const temp_context = temp_canvas.getContext("2d");
    temp_context.drawImage(canvas, 0, 0, 250, 250, 0, 0, 28, 28);

    // преобразование полученного изображения в 28*28px датасета
    const img = temp_context.getImageData(0, 0, 28, 28);
    // temp_context.putImageData(img, 0, 0, 0, 0, 28, 28)

    // удаляем альфа-канал и преобразуем в оттенки серого
    // вроде как это так работает, но я не уверен. однако тот факт, что нейросеть работает, уже чудо...
    // скучаю по фреймворкам
    let sample = [];
    for (let i = 0, j = 0; i < img.data.length; i += 4, j++) {
        sample[j] = (img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3;
    }

    // нормализация с помощью функции normalize_data
    img.data = NeuralNetwork.normalize_data(img.data);

    prediction.innerHTML = format_prediction(n_n.predict(sample));
}

function format_prediction(prediction) {
    // toArray возвращает массив со всеми элементами, встроенный метод
    // создание сглаженного массива, пускай он будет soft_array, my english is perfect
    const soft_array = prediction.toArray().map((x) => x[0]);

    // возвращаем индекс наибольшего числа в сглаженном массиве
    return soft_array.indexOf(Math.max(...soft_array));
}

// простая функиця загрузки весов, то бишь обученной модели
// после загрузки выведет сообщение в журнал
function load_weights() {
    n_n.wih = saved_weights.wih;
    n_n.who = saved_weights.who;
    status.innerHTML += "Weights loaded. <br>";
}

// после того как модель обучится до конца, будет создана ссылка на json. будет скачено в загрузки
// в json сохранены два массива весов входного скрытого слоя и весов выходного скрытого слоя
function create_download_link() {
    const wih = n_n.wih.toArray();
    const who = n_n.who.toArray();
    const weights = { wih, who };
    download.innerHTML = `<a download="${weights_file_name}" id="downloadLink" href="data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(weights)
    )}">Download model weights</a>`;
}

// функция включения кнопок
function enable_all_buttons() {
    train_button.disabled = false;
    test_button.disabled = false;
    load_weights_button.disabled = false;
}
