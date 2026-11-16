const formulario =
    document.querySelector("form");

const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

formulario.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const contrasena = document.getElementById("contrasena").value;

        if (!email || !contrasena) {
            notificar("Por favor complete todos los campos.");
            return;
        }

        const usuarioCoincidencia = usuarios.find(u => u.correo === email);

        if (usuarioCoincidencia && usuarioCoincidencia.contrasena === contrasena) {

            localStorage.setItem("usuarioLogueado", usuarioCoincidencia.correo);

            notificar("Bienvenido " + usuarioCoincidencia.nombre);
            window.location.href = "perfil.html";

        }
        else {
            notificar("Datos incorrectos");
        }
    }
);