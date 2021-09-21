
$(document).ready();

//<pruebas api--------

//const WT_URL = "http://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires";
/* const WT_URL = "http://worldclockapi.com/api/json/utc/now";

fetch(WT_URL)
    .then(r => r.json())
    .then(data => data.datetime)
    .then(strdate => new Date( Date.parse(strdate) ))
    .then(changeColor); */


/* function changeColor(now) {
    console.log(now);
    if (now.getHours() < 15) {
        $('body').css({
            'background-color': 'blue'
        })
    }
} */
//</pruebas api-------------


/* Definiendo variables */
let client;
let project; 
let prodType;
let prodTime;
let laborFee = 500;
const TASKS = ["#design3d", "#production3d", "#render3d", "#body2d", "#face2d", "#character2d", "#evMontaje", "#evColor", "#evEncoding"];
/* Definiendo Classes que construiran los objetos principales */

class Client {
    constructor(name, mail){
        this.name = name;
        this.mail = mail;
        this.projects = [];
    }
    /* clientLog(this){
        localstorage.setItem("Client", JSON.stringify(this));
    } */
    addProject(project){
        this.projects.push(project);
    }
};


class Project {
    constructor(name) {
        this.name = name;
        this.products = [];
        this.time = 0;
        this.cost = 0;
    }
    projectLog() {
        localstorage.setItem("Project", JSON.stringify(this));
    }
    addProduct(product){
        this.products.push(product);
        this.time = this.time + product.time;
        this.cost = this.time * laborFee;
    }
}

class Product {
    constructor(type){
        this.type = type;
        this.multiplier = parseInt($('#subType3d').children("option:selected").val()) + parseOrDefault("#seg2d") + parseOrDefault("#minVideo");
        this.tasks = createTasks(); //suma de los valores chequeados en los boxes
        this.time = this.tasks.total * this.multiplier;
    }

    addSelectedTsk(tasklist) {
        this.tasks.selectedTasks.push(tasklist)
    }
}

/* Agregando escucha de eventos */

/* botones----- */
$("#btnNewCl").on("click", createUser);
$('#btnNewProj').on("click",createProj);
$('#addProd').on("click",createProd);
$('#typeCont input').on('click', newShowType);
$('#saveUserData').on('click',storeUser);

/* --------------------Agregando Funciones-------------------- */

/* Creacion de Cliente Producto y Objeto */

function createUser(){
    client = new Client($("#userName").val(), $("#userMail").val());
    $("#btnNewProj").prop('disabled',false);
    console.log(client);
    
}

function createProj(){
    console.log(client.projects.length);
    if (client.projects.length > 2) {
        alert("Tranquilo, tigre/sa. Empecemos con 3 proyectos. Si queres, podes eliminar alguno de los anteriores.");
    }
    else {
        project = new Project($("#projName").val());
        $("#addProd").prop('disabled',false);
        client.addProject(project);
        console.log(client);
    }
}

function createProd(){
    if (project.products.length > 5) {
        alert("Has superado el limite de productos. Si queres podes eliminar uno.")
    }
    else{
        prodType = $('#typeCont input:checked').next("label").text();
        let product = new Product(prodType);
        project.addProduct(product);
        console.log(client);
    }
}

/* Mostrador de multiplicadores y tareas */

const MULTI = ['#subType3d', '#tasks3d', '#timer2d', '#tasks2d', '#EVTimer', '#tasksEv']; 

function newShowType() {
    resetCheckBoxes();
    resetProyText();
    resetOption();
    for (let toHide of MULTI) {
        $(toHide).hide();
    }
    let checked = $('#typeCont input:checked').val();
    if (checked == "0") {
        $('#subType3d').show();
        $('#tasks3d').show();
    }

    else if (checked == "1") {
        $('#timer2d').show();
        $('#tasks2d').show();
    }

    else if (checked == "2") {
        $('#EVTimer').show();
        $('#tasksEv').show();
    }
}

/* Manejo de las tareas del Producto -------------*/

function createTasks() {
    let ret = 0;
    let checkedTasks = []
    for (let task of TASKS) {
        if ($(task).is(":checked")) {
            ret = ret + parseOrDefault(task);
            checkedTasks.push($(task).next("label").text());
        }
    }
    return {total: ret, chosenTasks: checkedTasks};
}

function parseOrDefault(task) {
    if ($(task).val() == "") {
        return 0;
    } 
    return parseInt($(task).val());
}


//LIMPIADORES DE FORMULARIOS-----------------------

function resetForm() {
    resetCheckBoxes();
    resetTextBoxes();
    resetRadios();
    resetOption();    
}

function resetCheckBoxes() {
    $('input[type=checkbox]').prop('checked',false);
}

function resetTextBoxes() {
    $('input[type=text]').val("");
}

function resetProyText() {
    $('.regProyecto input[type=text]').val("");
}

function resetOption(){
    $('#subType3d').val("0")
}

function resetRadios(){
    $('#typeCont input').prop('checked', false);
}

//-----------------------------------------------------

/* Storage, almacenamiento y AJAX */

function storeUser() {
    console.log(client);
    localStorage.setItem(client.mail, JSON.stringify(client));
    displayCard();
    resetForm();
}

function displayCard() {
    $('#usuario').text(` ${client.name}`);
    $('.card__title').text(`Tu proyecto ${project.name} llevaria unas ${project.time}hs de trabajo y costaria aproximadamente $${project.cost}.`)
    let showCard = $('#card-1');
    showCard.show();
    let proyCard = $('.card');
    proyCard.css({
        'top':'-40rem',
        'opacity':'0',
        'transform':'scale(1.2)',
    }).animate({
        'opacity':'1',
    }, "fast");
    proyCard.click(()=>{
        proyCard.animate({'top':'0',},"fast");
        proyCard.css({'transform':'scale(1)',});
    });


}

const CLIENTURL = 'https://jsonplaceholder.typicode.com/posts' //simulacion de destino del post (no me dejaba hacerlo con un archivo local, error CORS 405)

$('#saveUserData').click(() => {
    $.post(CLIENTURL, client,(respuesta, estado) => {
        if (estado === "success") {
            console.log("guardado");
        }
    }
    );
}
)

/*------------------------------------------------------------------- Notas de tareas a realizar

1.Resetear el formulario de tareas cuando se guarda un producto o se cambia su tipo.
2.Boton para finalizar el proyecto (resetea todo el formulario menos el nombre y el mail)
3.Corregir habilitadores e inhabilitadores
4.Agregar limitadores: de proyectos a 3, de productos a 6
5.Programar creacion de tarjeta por proyecto.
6.Mejorar la interfaz: Animaciones*/