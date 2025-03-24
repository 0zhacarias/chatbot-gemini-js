const messageImput = document.querySelector(".message-input")
const chatBody = document.querySelector(".chat-body")
const SendMessageButton = document.querySelector("#send-message")
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper")
const fileCancelButton = document.querySelector("#file-cancel")
const chatbotToggler = document.querySelector("#chatbot-toggler")
const closeChatBot = document.querySelector("#close-chatbot")
const initialInputHeight=messageImput.scrollHeight;
messageImput.dispatchEvent(new Event("input"))
const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

API_KEY = "AIzaSyC03hXaWnfm7NjPzM0siYPO8go-Nggf-3c";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`
const generateBotResponse = async (inOutgoingMessageDiv) => {
    const MessageElement = inOutgoingMessageDiv.querySelector(".message-text")
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
            }]
        })

    }
    try {
        const response = await fetch(API_URL, requestOptions)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error.message)
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim()
        MessageElement.innerText = apiResponseText
        console.log(apiResponseText)
    } catch (error) {
        console.log(error)
        MessageElement.innerText = error.message
        MessageElement.style.color = "#ff0000"
    } finally {
        userData.file = {}
        inOutgoingMessageDiv.classList.remove("thinking")
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
    }
}
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div")
    div.classList.add("message", ...classes)
    div.innerHTML = content
    return div
}
const handleOutgoingMenssage = (e) => {
    e.preventDefault()
    userData.message = messageImput.value.trim()
    messageImput.value = "";

    const messageContent = `<div class="message-text"></div>
    ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}`
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message")
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message
    chatBody.appendChild(outgoingMessageDiv)
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })

    setTimeout(() => {
        const messageContent = ` <span class="material-symbols-rounded bot-avatar">
                    smart_toy
                </span>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>`
        const inOutgoingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking")
        inOutgoingMessageDiv.querySelector(".message-text")
        chatBody.appendChild(inOutgoingMessageDiv)
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" })
        generateBotResponse(inOutgoingMessageDiv)
    }, 600)

}
messageImput.addEventListener("keydown", (e) => {

    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && e.shiftKey && window.innerWidth >768) {
        //console.log((e))
        handleOutgoingMenssage(e)
    }
})
messageImput.addEventListener("input",()=>{
    messageImput.style.height=`${initialInputHeight}px`
    messageImput.style.height=`${messageImput.scrollHeight}px`
    document.querySelector(".chat-form").style.borderRadius=messageImput.scrollHeight>initialInputHeight?"15px":"32px"
})
SendMessageButton.addEventListener('click', (e) => handleOutgoingMenssage(e))
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result
        fileUploadWrapper.classList.add("file-uploaded")
        const base64String = e.target.result.split(",")[1]
        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = ""
        console.log(e.target.result)
    }
    reader.readAsDataURL(file)
});
/* EMOJI */
const emoji = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (e) => {
        const { selectionStart: start, selectionEnd: end } = messageImput
        messageImput.setRangeText(e.native, start, end, "end")
        messageImput.focus()
    },
    onClickOutside: (e) => {

        if (e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker")
        } else {
            document.body.classList.remove("show-emoji-picker")

        }
    }
})
document.querySelector(".chat-form").appendChild(emoji)
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click())
chatbotToggler.addEventListener("click",()=>document.body.classList.toggle("show-chatbot"))
closeChatBot.addEventListener("click",()=>document.body.classList.remove("show-chatbot"))
