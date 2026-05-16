// Reemplaza esto con la URL que te dé Google al desplegar el Apps Script como Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOxR252eWHXM1y5UXWnUYP3wHK1sSfd8O5BsUiFk0c7HDW_7vRa4jWSfVmMlFjIqpvvw/exec';

document.addEventListener('DOMContentLoaded', () => {
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const instructionText = document.getElementById('instruction-text');
    const mainContent = document.getElementById('main-content');
    let envelopeOpened = false;

    // Abrir sobre
    envelopeWrapper.addEventListener('click', () => {
        if (!envelopeOpened) {
            envelopeOpened = true;
            envelopeWrapper.classList.add('open');
            instructionText.style.opacity = '0';
            
            // Esperar a que la animación termine antes de mostrar el contenido
            setTimeout(() => {
                mainContent.classList.add('visible');
                
                // Desplazar suavemente hacia el contenido
                setTimeout(() => {
                    const heroHeight = document.getElementById('hero').offsetHeight;
                    window.scrollTo({
                        top: heroHeight * 0.7,
                        behavior: 'smooth'
                    });
                }, 500);

                // Cargar lista de regalos
                loadGifts();
            }, 1800);
        }
    });

    // Observador para animar elementos al hacer scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
});

// Función de ayuda para mostrar mensajes de estado
function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    el.textContent = text;
    el.className = `status-message status-${type}`;
    setTimeout(() => { el.textContent = ''; }, 6000);
}

// Activar/desactivar botones
function toggleButtons(disabled, selector) {
    document.querySelectorAll(selector).forEach(btn => {
        btn.disabled = disabled;
        btn.style.opacity = disabled ? '0.6' : '1';
        btn.style.pointerEvents = disabled ? 'none' : 'auto';
    });
}

// Enviar RSVP
async function submitRSVP(status) {
    const nameInput = document.getElementById('guest-name');
    const companionsSelect = document.getElementById('guest-companions');
    
    const name = nameInput.value.trim();
    if (!name) {
        showMessage('rsvp-message', 'Por favor, ingresa tu nombre completo.', 'error');
        nameInput.focus();
        return;
    }

    const payload = {
        action: 'rsvp',
        name: name,
        companions: companionsSelect.value,
        status: status
    };

    try {
        toggleButtons(true, '.rsvp-buttons .btn');
        showMessage('rsvp-message', 'Enviando...', 'success');

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            // Enviamos como text/plain para evitar el preflight de CORS y usar JSON internamente
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage('rsvp-message', '¡Gracias por confirmar!', 'success');
            nameInput.value = '';
            companionsSelect.selectedIndex = 0;
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        showMessage('rsvp-message', 'Hubo un error al enviar. Por favor, intenta de nuevo.', 'error');
        console.error(error);
    } finally {
        toggleButtons(false, '.rsvp-buttons .btn');
    }
}

// Registrar Regalo
async function registerGift() {
    const giftInput = document.getElementById('gift-name');
    const giftName = giftInput.value.trim();
    
    if (!giftName) {
        showMessage('gift-message', 'Por favor, escribe un regalo.', 'error');
        giftInput.focus();
        return;
    }

    const payload = {
        action: 'gift',
        gift: giftName
    };

    try {
        toggleButtons(true, '.btn-register');
        showMessage('gift-message', 'Registrando...', 'success');

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('gift-message', '¡Regalo registrado con éxito!', 'success');
            giftInput.value = '';
            
            // Recargar la lista después de un momento
            setTimeout(loadGifts, 500);
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        showMessage('gift-message', 'Hubo un error. Intenta de nuevo.', 'error');
        console.error(error);
    } finally {
        toggleButtons(false, '.btn-register');
    }
}

// Cargar Lista de Regalos (GET)
async function loadGifts() {
    const giftListEl = document.getElementById('gift-list');
    const spinner = document.getElementById('loading-gifts');
    
    try {
        giftListEl.innerHTML = '';
        spinner.style.display = 'block';

        const response = await fetch(`${SCRIPT_URL}?action=gifts`);
        const gifts = await response.json();
        
        spinner.style.display = 'none';

        if (!gifts || gifts.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Aún no hay regalos registrados. ¡Sé el primero!';
            li.style.borderLeft = 'none';
            li.style.background = 'transparent';
            giftListEl.appendChild(li);
            return;
        }

        gifts.forEach(gift => {
            const li = document.createElement('li');
            li.textContent = gift;
            giftListEl.appendChild(li);
        });

    } catch (error) {
        spinner.style.display = 'none';
        console.error("Error fetching gifts:", error);
        const li = document.createElement('li');
        li.textContent = 'No se pudo cargar la lista temporalmente. Intenta recargar la página.';
        li.style.color = '#D87070';
        giftListEl.appendChild(li);
    }
}
