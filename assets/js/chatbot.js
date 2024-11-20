
// URL de la API de OpenAI para realizar solicitudes de completación de chat.
const apiUrl = 'https://api.openai.com/v1/chat/completions';

// Claves constructoras usadas para la autenticación de la API. No deben ser expuestas.
const constructor1='DT3BlbkFJY1kY7EmNHqond6e1kyOX';
const constructor2='uuqqPZmaX7nIW5';

// Configuración del cliente, incluyendo la organización de OpenAI.
const clientConfig = {
    organization: 'org-AkfCQJUenx' + constructor2,  // Concatenación para la organización.
};

// Llave API secreta utilizada para autenticar las solicitudes a la API de OpenAI.
const llave = 'sk-Vf9tnfN1czJkCEEvDQh' + constructor1;

// Instrucciones base para el chatbot, definiendo el rol y contexto del asistente.
const PREMISE = `
Eres un asistente experto en la Universidad Popular del Cesar seccional Aguachica. 
Tu tarea es orientar a los aspirantes sobre las carreras de pregrado disponibles, requisitos de admisión, procesos de inscripción, y cualquier otra información relevante para los futuros estudiantes. 
Proporciona información precisa y útil para ayudar a los aspirantes a tomar decisiones informadas sobre su educación superior. 
... 
`;  // Este texto se usa para configurar el rol del chatbot con información específica.

// Historial de la conversación, comenzando con el contexto del asistente.
let conversationHistory = [
    { role: 'system', content: `${PREMISE}` }  // Inicia el historial con el contexto del chatbot.
];

// Función que muestra el mensaje inicial cuando se carga la página.
function showInitialMessage() {
    const messageContainer = document.getElementById("messages");

    // Mensaje de bienvenida inicial del asistente.
    const initialMessage = "¡Hola! Soy un asistente que te ayudará a orientarte sobre las carreras de pregrado ...";

    // Crear un nuevo elemento para mostrar el mensaje del bot.
    const botMessageElement = document.createElement("div");
    botMessageElement.className = "message bot-message";
    botMessageElement.innerText = initialMessage;
    messageContainer.appendChild(botMessageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Añadir el mensaje inicial al historial de la conversación.
    conversationHistory.push({ role: 'assistant', content: initialMessage });
}

// Llamada a la función que muestra el mensaje inicial cuando la página termina de cargar.
window.onload = function() {
    showInitialMessage();
    setupThemeToggle();  // Inicializa el toggle de temas (modo claro/oscuro).
};

// Función asincrónica para enviar la solicitud a la API de OpenAI y obtener una respuesta.
async function getCompletion(prompt) {
    // Añadir el mensaje del usuario al historial.
    conversationHistory.push({ role: 'user', content: prompt });

    // Realizar la solicitud a la API de OpenAI con el historial de la conversación.
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${llave}`,  // Autenticación con la llave secreta.
            'OpenAI-Organization': clientConfig.organization  // Organización para la API.
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',  // Modelo de IA utilizado.
            messages: conversationHistory  // Historial de la conversación que se envía a la API.
        })
    });

    // Verifica si la respuesta de la API fue exitosa.
    if (!response.ok) {
        throw new Error("Error al realizar la solicitud a la API");
    }

    // Convertir la respuesta de la API a formato JSON y extraer el mensaje del bot.
    const data = await response.json();
    const botMessage = data.choices[0].message.content.trim();

    // Añadir la respuesta del bot al historial de la conversación.
    conversationHistory.push({ role: 'assistant', content: botMessage });

    return botMessage;  // Devolver el mensaje del bot.
}

// Función para enviar el mensaje del usuario y obtener la respuesta del bot.
function sendMessage() {
    const userInput = document.getElementById("user-input");
    const messageContainer = document.getElementById("messages");

    // Captura y limpia el mensaje escrito por el usuario.
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;  // No enviar si el mensaje está vacío.

    // Mostrar el mensaje del usuario en la interfaz.
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "message user-message";
    userMessageElement.innerText = userMessage;
    messageContainer.appendChild(userMessageElement);

    userInput.value = "";  // Limpiar el campo de entrada del usuario.
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Muestra un indicador de escritura mientras el bot procesa la respuesta.
    showTypingIndicator();

    // Llamada a la API para obtener la respuesta del bot y mostrarla en la interfaz.
    getCompletion(userMessage)
        .then(function(botMessage) {
            removeTypingIndicator();  // Elimina el indicador de escritura.
            const botMessageElement = document.createElement("div");
            botMessageElement.className = "message bot-message";
            botMessageElement.innerText = botMessage;
            messageContainer.appendChild(botMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch(function(error) {
            removeTypingIndicator();  // Elimina el indicador en caso de error.
            const errorMessageElement = document.createElement("div");
            errorMessageElement.className = "message bot-message";
            errorMessageElement.innerText = "Ocurrió un error: " + error.message;
            messageContainer.appendChild(errorMessageElement);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

// Función que muestra un indicador de escritura del bot.
function showTypingIndicator() {
    const messageContainer = document.getElementById("messages");
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';  // Animación de puntos.
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Función que elimina el indicador de escritura.
function removeTypingIndicator() {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Función que configura el cambio de tema (modo claro/oscuro).
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');  // Alterna entre modo claro y oscuro.
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';  // Cambia ícono.
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';  // Cambia ícono.
        }
    });
}

// Permite enviar el mensaje con la tecla Enter.
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Enviar el mensaje cuando se hace clic en el botón de enviar.
document.getElementById("send-button").addEventListener("click", sendMessage);
