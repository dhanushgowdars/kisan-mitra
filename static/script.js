// 1. Handle PDF Upload
document.getElementById('pdfFile').addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;

    const status = document.getElementById('uploadStatus');
    status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
    status.style.color = "white";
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.status === 'success') {
            status.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + result.message;
            status.style.color = "#a5d6a7"; // Softer green for success
        } else {
            status.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Error uploading.';
            status.style.color = "#ffcdd2"; 
        }
    } catch (error) {
        status.innerText = "❌ Connection failed.";
        status.style.color = "#ffcdd2";
    }
});

// 2. Handle Chat Message
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, 'user');
    input.value = '';

    // Show "Thinking..."
    const loadingId = addMessage("Thinking... <i class='fa-solid fa-ellipsis fa-bounce'></i>", 'bot', true);

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        // Remove loading
        document.getElementById(loadingId).remove();

        // Check if it's an out-of-context message
        if (data.is_out_of_context) {
            addMessage(data.response, 'bot-warning'); 
        } else {
            addMessage(data.response, 'bot');
        }

    } catch (error) {
        document.getElementById(loadingId).innerHTML = "⚠️ Error connecting to AI.";
    }
}

// 3. Helper to add bubbles + Share Buttons
function addMessage(text, sender, isLoading = false) {
    const chatBox = document.getElementById('chatBox');
    
    // Determine visual style based on sender
    let styleType = sender;
    if (sender === 'bot-warning') styleType = 'bot'; // Use bot layout for warnings too

    const container = document.createElement('div');
    container.className = `message-container ${styleType}-message-container`;
    if (isLoading) container.id = 'loading-' + Date.now();

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';

    // Avatar Selection
    const avatar = document.createElement('div');
    if (sender === 'bot-warning') {
        avatar.className = `avatar bot-warning-avatar`;
        avatar.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
    } else {
        avatar.className = `avatar ${sender}-avatar`;
        avatar.innerHTML = sender === 'bot' ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
    }

    // Message Bubble Selection
    const messageBubble = document.createElement('div');
    if (sender === 'bot-warning') {
        messageBubble.className = `message bot-warning-message`;
    } else {
        messageBubble.className = `message ${sender}-message`;
    }
    
    if (isLoading) {
        messageBubble.innerHTML = text;
    } else {
        messageBubble.innerHTML = marked.parse(text);
    }

    // Assemble
    if (sender === 'user') {
        contentWrapper.appendChild(messageBubble);
        contentWrapper.appendChild(avatar); // Avatar on right for user
    } else {
        contentWrapper.appendChild(avatar); // Avatar on left for bot
        contentWrapper.appendChild(messageBubble);
    }
    
    container.appendChild(contentWrapper);

    // Share Buttons (Only for valid Bot answers)
    if ((sender === 'bot' || sender === 'bot-warning') && !isLoading) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('div');
        copyBtn.className = 'action-btn';
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        copyBtn.onclick = () => copyText(text, copyBtn);

        const waBtn = document.createElement('div');
        waBtn.className = 'action-btn';
        waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Share';
        waBtn.onclick = () => shareToWhatsApp(text);

        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(waBtn);
        container.appendChild(actionsDiv);
    }

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
    return container.id;
}

function copyText(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => btnElement.innerHTML = originalHTML, 2000);
    });
}

function shareToWhatsApp(text) {
    const encodedText = encodeURIComponent("🌱 *KisanMitra Answer:*\n\n" + text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}

document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});