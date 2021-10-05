
$(document).ready();

const API_KEY = "56489b167348bed758c0";
const CURRENCY_CONVERTER_URL = `https://free.currconv.com/api/v7/convert?q=ARS_USD&compact=ultra&apiKey=${API_KEY}`;
const TIMEOUT = 5000;

let usdRatio = -1;
$.getJSON({url: CURRENCY_CONVERTER_URL, timeout: TIMEOUT} , function(data) {
    console.log(data);
    usdRatio = data.ARS_USD;
})
    .fail(function(_jqXHR, textStatus) {
        console.log(`Could not retrieve response from currency converter api, status: ${textStatus}`);
    });




/* Definiendo variables principales */
let client;
let project; 
let prodType;
let prodTime;
const laborFee = 500;
const TASKS = ["#design3d", "#production3d", "#render3d", "#body2d", "#face2d", "#character2d", "#evMontaje", "#evColor", "#evEncoding"];

/* Definiendo Classes que construiran los objetos principales */

class Client {
    constructor(name, mail){
        this.name = name;
        this.mail = mail;
        this.projects = [];
    }
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
    }
    deleteProduct(idx){
        this.products.splice(idx, 1);
    }
    displayCard() {
        for (let product of this.products) {
            this.time = this.time + product.time;
        }
        this.cost = this.time * laborFee;
        $('footer').append(`
        <div class="cards" id="card-${this.id}">
        <i title="mostrar cartas" class="fas fa-star" id="show-card"></i>
        <div class="card1-content">
            <p class="card__exit"><i class="far fa-times-circle" id="closeCard-${this.id}"></i></p>
            <div class="card__icon">
                <i class="fas fa-bolt"></i>
                <h2>Proyecto: ${this.name}</h2>
            </div>
            <h4 class="card__title">Tu Proyecto: ${this.name}, aproximadamente, tomará unas ${this.time}hs de trabajo
            y costaría alrededor de los $${this.cost}.</h4>
            </div>
        </div>
        `);
        if (usdRatio > 0) {
            let costInUsd = (this.cost * usdRatio).toFixed(2);
            $(`#card-${this.id}`).append(`<br>Costo aproximado en dólares: USD$${costInUsd}`);
        }
        let proyCard = $(`#card-${this.id}`);
        proyCard.show();
        proyCard.css({
            'position':'fixed',
            'top':'33%',
            'opacity':'0',
            'transform':'scale(1.2)',
        }).animate({
            'opacity':'1',
        }, "fast");
        proyCard.click(()=>{
            proyCard.animate({'top':'90%'},"fast",()=>{proyCard.css({'position':'relative','transform':'scale(1)',});});  
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
        $(`#${project.products.length}`).css({'position':'relative','left':'200px'});
        $(`#${project.products.length}`).animate(
            {left:'0px'}, 100    
        )

    }
}

/* Agregando escucha de eventos principales*/

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
    if(($('#userName').val() != "") && ($('#userMail').val() != "")){
        client = new Client($("#userName").val(), $("#userMail").val());
        $("#btnNewProj").prop('disabled',false);
        $("#form-project").parent().animate({
            scrollTop: $("#form-project").height()
        }, "slow","swing");
        $(".project-title").text(`Bienvenid@! ${client.name}!`);
        fader('.project-title');
        sliderLeft(".project-header > p");
        console.log(client);
    }
    else{
        alert("Por favor, para empezar completa los campos requeridos!");
    }
}

function createProj(){
    if (client.projects.length > 2) {
        alert("Tranquilo, tigre/sa. Empecemos con 3 proyectos. Si queres, podes eliminar alguno de los anteriores clickeando en el boton de cerrar en las tarjetas del footer.");
    }
    else if ($('#projName').val() == ""){
        alert("Por favor, para empezar completa los campos requeridos!");
    }
    else {
        let id = nextId(client.projects);
        project = new Project($("#projName").val(),id);
        client.addProject(project);
        $('.product-title').text(`Proyecto ${project.name}`);
        $("#form-project").parent().animate({
            scrollTop: ($("#form-project").height())*2
        }, "slow","swing");
        fader('.product-title');
        sliderLeft(".product-header > p");
        console.log(client);
    }
}

function createProd(){
    if (project.products.length > 3) {
        alert("Has superado el limite de productos. Si queres podes eliminar uno.")
    }
    else{
        let id = nextId(project.products);
        prodType = $('#typeCont input:checked').next("label").text();
        let product = new Product(prodType, id);
        if (product.time == 0){
            alert('Recuerda completar todos los campos. Con la información solicitada.');
        }
        else{
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
}

//----Finzalizacion de Proyecto-----
function endProy(){
    project.displayCard();
    project = 0;
    $(".product-icon").remove();
    $("#form-project").parent().animate({
        scrollTop: ($("#form-project").height())
    }, "slow","swing");
    submitEnabler();
}


/* Borrado de Productos y de Proyectos */

function deleteProd() {
    let idx = $(this).index(".product-icon");
    project.deleteProduct(idx);
    $(this).remove();
    btnEnabler(project.products, '#endProject');
    console.log(project.products);
}

function deleteProy() {
    let idx = $(this).parent().parent().index(".card");
    console.log(idx);
    client.projects.splice(idx,1);
    $(this).parent().parent().remove();
    submitEnabler();
    console.log(client.projects);
}

function nextId(array){
	if (array.length > 0) {
		return array[array.length -1].id + 1;
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
        $('#subType3d').show(400);
        $('#tasks3d').css('display', 'flex');
    }

    else if (checked == "1") {
        $("#addProd").prop('disabled',false);
        $('#timer2d').show(400);
        $('#tasks2d').css('display', 'flex');
    }

    else if (checked == "2") {
        $("#addProd").prop('disabled',false);
        $('#EVTimer').show(400);
        $('#tasksEv').css('display', 'flex');
    }
    else{ 
        $("#addProd").prop('disabled',true);
    }

}

function btnEnabler(toCheck, toEnable){
    if (toCheck.length > 0){
        $(toEnable).prop('disabled',false);
    }
    else {
        $(toEnable).prop('disabled',true);
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
    $('.project-form input[type=text],[type=number]').val("");
    $('.product-form input[type=text],[type=number]').val("");
}
function resetProyText() {
    $('.product-timer input[type=text],[type=number]').val("");
}
function resetOption(){
    $('#subType3d').val("0")
}
function resetRadios(){
    $('#typeCont input').prop('checked', false);
}

//-----------------------------------------------------

/* Storage y almacenamiento*/

function storeUser() {
    console.log(client);
    localStorage.setItem(client.mail, JSON.stringify(client));
    resetForm();
}

const CLIENTURL = 'https://jsonplaceholder.typicode.com/posts' //simulacion de destino del post (no me dejaba hacerlo con un archivo local, error CORS 405)

$('#saveUserData').click(() => {
    $.post(CLIENTURL, client,(respuesta, estado) => {
        if (estado === "success") {
            alert("Excelente! Gracias por usar la plataforma. Ni bien pueda reviso los proyectos y estaremos en contacto!");
            location.reload(true);
        }
    }
    );
});

function submitEnabler(){
    if(client.projects.length > 0){
        $('#saveUserData').show(2000);
    }
    else if(client.projects.lenght > 0){
        $('#saveUserData').hide(2000);
    }
}

/* animaciones ----------*/
function sliderLeft(element){
    $(element).css({'opacity':'0', 'position':'relative', 'left':'3%' });
    $(element).animate({opacity: "1", left: '0'},800);
}

sliderLeft('main > aside > h1');

$('main > aside > p').css({'opacity':'0', 'position':'relative', 'right':'3%' });
$('main > aside > p').animate({opacity: "1", right: '0'},800);

fader('main > aside > h2');

function fader(element) {
    $(element).hide();
    $(element).fadeIn(2000);
}

