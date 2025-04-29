const info = document.getElementById("info");

function notify(number) {
	if (number === 0) {
		info.innerHTML = "NO MESSAGES FOUND IN THE DATABASE";
	} else {
  info.innerHTML = ""; 
  info.style.display = 'none';  
 }
}

async function loadMessages() {
	try {
		const response = await fetch("/messages");
		const messages = await response.json();
		notify(messages.length);
		if(messages.length > 0){
  info.style.display='none';
  const container = document.getElementById("Allmsg");
		container.innerHTML = "";
		messages.forEach((msg) => {
			addMessageToContainer(msg.user, msg.msg, msg.token);
		});
		container.scrollTop = container.scrollHeight;
 }
	} catch (error) {
		console.error("Error al cargar mensajes:", error);
	}
}

function addMessageToContainer(user, msg, token) {
	const container = document.getElementById("Allmsg");
	const msgDiv = document.createElement("div");
	msgDiv.style.width = "100%";
	let msgShow0 = "";

	if (msg.includes("https://tmpfiles.org/dl/") === true) {

if(localStorage.getItem('token') === token){
msgShow0 += `<div class="flex justify-end text-sm"><label class="font-bold mr-1"><+></label><label class="flex items-center text-black bg-orange-400 pr-2 pl-2">${user}</label>`;
	} else {
		msgShow0 += `<div class="flex text-sm"><label class="font-bold mr-1"><+></label><label class="flex items-center text-black bg-orange-400 pr-2 pl-2">${user}</label>`;
	}



		if (msg.includes(".png") === true || msg.includes(".jpg") === true) {
			msgShow0 += `
			<a class="pl-2 pr-2 bg-blue-600 text-white text-sm inline-block hover:bg-blue-400" href="${msg}" download>Imagen Adjunta</a></div>
  `;
		} else {
			msgShow0 += `<a class="pl-2 pr-2 bg-blue-600 text-sm inline-block hover:bg-blue-400" href="${msg}" download>Documento Adjunto</a></div>`;
		}
	} else {

console.log(`${localStorage.getItem('token')} ${token}`);
if(localStorage.getItem('token') === token){
	 msgShow0 += `<div class="flex gap-4 items-center justify-end"><div class="bg-blue-500 flex gap-2 rounded-sm"><span id="showUser" class="pl-2 bg-gray-300 pr-2 font-bold text-xs">${user} </span><span class="flex text-white pr-2 items-center text-sm">${msg}</span></div></div>`;
	} else {
    msgShow0 += `<div class="flex  items-center"><div class="flex gap-2"><div class="bg-gray-200 rounded-sm pr-2 flex"> <span id="showUser" class="font-bold text-xs bg-blue-500 pr-2 pl-2">${user} </span><span class="flex pl-2 text-black items-center text-sm ">${msg}</span></div></div>`;
   }
    msgShow0 += ``;
}
	msgDiv.innerHTML = `${msgShow0}`;

	container.appendChild(msgDiv);
	container.scrollTop = container.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
	loadMessages();
	const ws = new WebSocket("wss://chat-grupal.onrender.com");

	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (message.type === "new_message") {
			addMessageToContainer(message.data.user, message.data.msg, message.data.token);
   const container = document.getElementById("Allmsg");
   const currentMessages = container.querySelectorAll('div').length;
   notify(currentMessages + 1); // +1 porque acabamos de añadir uno
		}
	};

	const savedUser = localStorage.getItem("user");
	const savedToken = localStorage.getItem("token");

	if (savedUser && savedToken) {
		document.getElementById("user").value = savedUser;
		document.getElementById("inputUsername").style.display = "none";
		document.getElementById("showMessage").style.display = "flex";
		ensureUserInputExists(savedUser);
	}
});
