
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
    constructor(name, id) {
        this.name = name;
        this.products = [];
        this.time = 0;
        this.cost = 0;
        this.id = id;
    }
    projectLog() {
        localstorage.setItem("Project", JSON.stringify(this));
    }
    addProduct(product){
        this.products.push(product);
        this.time = this.time + product.time;
        this.cost = this.time * laborFee;
    }
    displayCard() {
        /*     $('#usuario').text(`${client.name}`);
            $('.card__title').text(`Tu proyecto ${project.name} llevaria unas ${project.time}hs de trabajo y costaria aproximadamente $${project.cost}.`) */
            
            $('footer').append(`
            <div class="card" id="card-${this.id}">
            <i title="mostrar cartas" class="fas fa-star" id="show-card"></i>
            <div class="card1-content">
                <p class="card__exit"><i class="far fa-times-circle" id="closeCard-${this.id}"></i></p>
                <div class="card__icon">
                    <i class="fas fa-bolt"></i>
                    <h2>Proyecto: ${this.name}</h2>
                </div>
                <h4 class="card__title">Tu Proyecto: ${this.name}, aproximadamente, tomará unas ${this.time}hs de trabajo
                y costaría alrededor de los $${this.cost}</h4>
                </div>
            </div>
            `);
            let proyCard = $(`#card-${this.id}`);
            proyCard.show();
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
}

class Product {
    constructor(type, id){
        this.type = type;
        this.multiplier = parseInt($('#subType3d').children("option:selected").val()) + parseOrDefault("#seg2d") + parseOrDefault("#minVideo");
        this.tasks = createTasks(); //suma de los valores chequeados en los boxes
        this.time = this.tasks.total * this.multiplier;
        this.id = id;
    }

    addSelectedTsk(tasklist) {
        this.tasks.selectedTasks.push(tasklist)
    }
    

    displayItem() {
        let prodValue = $('#typeCont input:checked').val();
        $(".product-shelf").append(`<li id="${project.products.length}" title="Producto: ${this.type} deadline: ${this.time}hs" class="product-icon icon-${prodValue}"></li>`);
        //console.log($(".product-icon"));
    }
}

/* Agregando escucha de eventos */

/* botones----- */
$("#btnNewCl").on("click", createUser);
$('#btnNewProj').on("click",createProj);
$('#addProd').on("click",createProd);
$('#typeCont input').on('click', newShowType);
$('#saveUserData').on('click',storeUser);
$("ol").on("click", ".product-icon", deleteProd);
$('#endProject').on("click", endProy);
$("footer").on("click", ".card__exit", deleteProy);

/* --------------------Agregando Funciones-------------------- */

/* Creacion de Cliente Proyecto y Producto */

function createUser(){
    client = new Client($("#userName").val(), $("#userMail").val());
    $("#btnNewProj").prop('disabled',false);
    console.log(client);
    
}

function createProj(){
    if (client.projects.length > 2) {
        alert("Tranquilo, tigre/sa. Empecemos con 3 proyectos. Si queres, podes eliminar alguno de los anteriores.");
    }
    else {
        let id = getProjId();
        project = new Project($("#projName").val(),id);
        client.addProject(project);
        console.log(client);
    }
}

function createProd(){
    if (project.products.length > 3) {
        alert("Has superado el limite de productos. Si queres podes eliminar uno.")
    }
    else{
        let id = getId();
        prodType = $('#typeCont input:checked').next("label").text();
        //prodValue = $('#typeCont input:checked').val();
        let product = new Product(prodType, id);
        product.displayItem();
        project.addProduct(product);
        console.log(project.products);
        resetCheckBoxes();
        resetTextBoxes();
        resetRadios();
        $("#addProd").prop('disabled',true);
        btnEnabler(project.products, '#endProject');
    }
}

function endProy(){
    project.displayCard();
    project = 0;
    $(".product-icon").remove();

}

function deleteProd() {
    let idx = $(this).index(".product-icon");
    project.products.splice(idx,1);
    $(this).remove();
    btnEnabler(project.products, '#endProject');
    console.log(project.products);
}

function deleteProy() {
    let idx = $(this).parent().parent().index(".card");
    console.log(idx);
    client.projects.splice(idx,1);
    $(this).parent().parent().remove();
    console.log(client.projects);
}

function getId(){
	if (project.products.length > 0) {
		return project.products[project.products. length -1].id + 1
	}
	else{
		return 1;
	} 
}

function getProjId(){
	if (client.projects.length > 0) {
		return client.projects[client.projects.length -1].id + 1
	}
	else{
		return 1;
	} 
}

/* Mostrador de multiplicadores y tareas */

const MULTI = ['#subType3d', '#tasks3d', '#timer2d', '#tasks2d', '#EVTimer', '#tasksEv','.product-instructions']; 

function newShowType() {
    resetCheckBoxes();
    resetProyText();
    resetOption();
    for (let toHide of MULTI) {
        $(toHide).hide();
    }
    let checked = $('#typeCont input:checked').val();
    if (checked == "0") {
        $("#addProd").prop('disabled',false);
        $('#subType3d').show();
        $('#tasks3d').css('display', 'flex');
    }

    else if (checked == "1") {
        $("#addProd").prop('disabled',false);
        $('#timer2d').show();
        $('#tasks2d').css('display', 'flex');
    }

    else if (checked == "2") {
        $("#addProd").prop('disabled',false);
        $('#EVTimer').show();
        $('#tasksEv').css('display', 'flex');
    }
    else{ 
        $("#addProd").prop('disabled',true);
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
    $('.project-form input[type=text]').val("");
    $('.product-form input[type=text]').val("");
}

function resetProyText() {
    $('.product-timer input[type=text]').val("");
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
    resetForm();
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

function btnEnabler(toCheck, toEnable){
    if (toCheck.length > 0){
        $(toEnable).prop('disabled',false);
    }
    else {
        $(toEnable).prop('disabled',true);
    }
}