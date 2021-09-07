/* probando jquery */
/* $("document").ready(function(){
    alert("JQUERY SABE!")
}); */

console.log($("#userName"));/* diferencia entre este metodo y el de abajo. por que en uno se llama .value y ene el otro .val() */
console.log(document.getElementById("userName"));

/* Definiendo variables */
let client ="";
let project; 
let prodType ="";
let prodTime ="";
let laborFee = 500;
const TASKS = ["#design3d", "#production3d", "#render3d", "#body2d", "#face2d", "#character2d", "#evMontaje", "#evColor", "#evEncoding"];
/* Definiendo Classes que construiran los objetos principales */

class Client {
    constructor(name, mail){
        this.name = name;/* citar formulario */
        this.mail = mail;/* citar formulario */
        this.projects = [];/*arrays con pryectos del formulario citar formulario */
    }
    /* clientLog(this){
        localstorage.setItem("Client", JSON.stringify(this));
    } */
    addProject(project){
        this.projects.push(project);
    }
};

/* let p = new Project();
client.addProject(p); ----ensayo---- */

class Project {
    constructor(name) {
        this.name = name;
        this.products = [];
        this.time = 0;
        this.cost = this.time * laborFee;
    }
    projectLog() {
        localstorage.setItem("Project", JSON.stringify(this));
    }
    addProduct(product){
        this.products.push(product);
    }
}

class Product {
    constructor(type){
        this.type = type;
        this.subtype = parseInt($('#subType3d').children("option:selected").val()) + parseOrDefault("#seg2d") + parseOrDefault("#minVideo");
        this.tasks = sumTasksValues(); //suma de los valores chequeados en los boxes
        this.time = this.tasks * this.subtype;
    }
    productLog() {
        localstorage.setItem("Product", JSON.stringify(this));
    }
}

/* Agregando escucha de eventos */

/* botones----- */
$("#btnNewCl").on("click", createUser);
$('#btnNewProj').on("click",createProj);
$('#addProd').on("click",createProd);

/* Seleccion de Tipos para habilitar multiplicadores */
/* $('#radio3d').on("click", showType($('#subType3d'), $('#tasks3d')));
$('#radio2d').on("click", showType($('#timer2d'), $('#tasks2d')));
$('#radioEV').on("click", showType($('#EVTimer'), $('#tasksEv')));  Asi probe la primera vez pero por algun motivo no funcionaba
si no le agregaba una funcion flecha antes*/

$('#radio3d').change(() => showType('#subType3d', '#tasks3d'));
$('#radio2d').change(() => showType('#timer2d', '#tasks2d'));
$('#radioEV').change(() => showType('#EVTimer', '#tasksEv'));

/* --------------------Agregando Funciones-------------------- */

/* Creacion de Cliente Producto y Objeto */

function createUser(){
    client = new Client($("#userName").val(), $("#userMail").val());
    $("#btnNewProj").prop('disabled',false);
    console.log(client);
}

function createProj(){
    project = new Project($("#projName").val());
    $("#addProd").prop('disabled',false);
    client.addProject(project);
    console.log(client.projects);
}

function createProd(){
    let product = new Product(prodType);
    project.addProduct(product)
    console.log(project.products);   
}

/* Mostrador de multiplicadores y tareas */

const ALL = ['#subType3d', '#tasks3d', '#timer2d', '#tasks2d', '#EVTimer', '#tasksEv']; 

function showType(multiplier, tasks) {
    for (let toHide of ALL) {
        $(toHide).hide();
    }
    $(multiplier).show();
    $(tasks).show();
    if (multiplier.includes("3d")){
        prodType = "Asset 3d";
    }
    else if (multiplier.includes("2d")){
        prodType = "Animación 2d";
    }
    else if (multiplier.includes("EV")){
        prodType = "Edicion de Video";
    }
    console.log(prodType); 
}

function sumTasksValues() {
    let ret = 0;
    for (let task of TASKS) {
        if ($(task).is(":checked")) {
            ret = ret + parseOrDefault(task);
        }
    }
    return ret;
}

function parseOrDefault(algo) {
    if ($(algo).val() == "") {
        return 0;
    } 
    return parseInt($(algo).val());
}


