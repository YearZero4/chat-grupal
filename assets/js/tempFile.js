const msg0 = document.getElementById("msg0");

document.getElementById("adjuntar").addEventListener("click", function () {
	document.getElementById("fileInput").click();
});
document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
    })
    .then((response) => response.json())
    .then(async (data) => {
        if (data.status === "success") {
            const downloadLink = data.data.url;
            const urlTMP = `${downloadLink.replace(".org/", ".org/dl/")}`;

            msg0.value = urlTMP;
            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token"); // ← Obtener el token
            
            if (!savedUser || !token) {
                console.error("No hay usuario o token guardado");
                return;
            }

            try {
                const response = await fetch("/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        username1: savedUser, 
                        msg: urlTMP,
                        token: token // ← Incluir el token aquí
                    }), 
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Error al enviar");

                console.log("Enlace enviado:", result);
                msg0.value = ""; 
            } catch (error) {
                console.error("Error al enviar enlace:", error);
            }
        } else {
            console.error("Error al subir el archivo:", data.message);
        }
    })
    .catch((error) => {
        console.error("Error en la solicitud:", error);
    });
});