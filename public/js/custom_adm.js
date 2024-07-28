/* Inicio Dropdown Navbar */
//let notification = document.querySelector(".notification");
let avatar = document.querySelector(".avatar");

dropMenu(avatar);
//dropMenu(notification);

function dropMenu(selector) {
    //console.log(selector);
    selector.addEventListener("click", () => {
        let dropdownMenu = selector.querySelector(".dropdown-menu");
        dropdownMenu.classList.contains("active") ? dropdownMenu.classList.remove("active") : dropdownMenu.classList.add("active");
    });
}
/* Fim Dropdown Navbar */

/* Inicio Sidebar Toggle / bars */
let sidebar = document.querySelector(".sidebar");
let bars = document.querySelector(".bars");

bars.addEventListener("click", () => {
    sidebar.classList.contains("active") ? sidebar.classList.remove("active") : sidebar.classList.add("active");
});

window.matchMedia("(max-width: 768px)").matches ? sidebar.classList.remove("active") : sidebar.classList.add("active");
/* Fim Sidebar Toggle / bars */

function actionDropdown(id) {
    const closeDropdownb = document.getElementById('actionDropdown' + id);

    if(closeDropdownb.classList.contains("show-dropdown-action")){
        closeDropdownb.classList.remove("show-dropdown-action");
    }else{
        closeDropdownAction();
        document.getElementById("actionDropdown" + id).classList.toggle("show-dropdown-action");
    }    
}

window.onclick = function (event) {
    if (!event.target.matches(".dropdown-btn-action")) {
        /*document.getElementById("actionDropdown").classList.remove("show-dropdown-action");*/
        closeDropdownAction();
    }
}

function closeDropdownAction() {
    var dropdowns = document.getElementsByClassName("dropdown-action-item");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i]
        if (openDropdown.classList.contains("show-dropdown-action")) {
            openDropdown.classList.remove("show-dropdown-action");
        }
    }
}


/* Inicio dropdown sidebar */

var dropdownSidebar = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdownSidebar.length; i++) {
    dropdownSidebar[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
}
/* Fim dropdown sidebar */


/* Inicio preview imagem do usuário */

function inputFilePriviewImg() {
    // Receber o seletor do campo imagem
    var new_image = document.querySelector('#image');

    // Receber o valor do campo
    var filePath = new_image.value;

    // Extensões de imagens permitidas
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    // Verificar se a extesão da imagem enviada pelo usuário está na lista de extensões permitidas
    if (allowedExtensions.exec(filePath)) {

        // Verificar se existe a imagem
        if ((new_image.files) && (new_image.files[0])) {
            // FileReader() - ler o conteúdo dos arquivos
            var reader = new FileReader();

            // onload - disparar um evento quando qualquer elemento tenha sido carregado
            reader.onload = function(e){
                // Enviar o preview da imagem para a página HTML
                document.getElementById('preview-img').innerHTML = "<img src='" + e.target.result + "' alt='imagem' class='view-image-user'>";
            }            
        }

        // readAsDataURL - Retorna os dados do formato blob como uma URL de dados - Blob representa um arquivo
        reader.readAsDataURL(new_image.files[0]);

    } else {
        // Enviar o preview da imagem padrão para a página HTML
        document.getElementById('preview-img').innerHTML = "<img src='/images/users/user.jpg' alt='imagem' class='view-image-user'>";
    }
}
/* Fim preview imagem do usuário */