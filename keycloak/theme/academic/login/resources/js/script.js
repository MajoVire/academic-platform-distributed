document.addEventListener("DOMContentLoaded", function() {
    // Do not hide the page title, just restyle it if needed
    const title = document.getElementById('kc-page-title');
    if (title) {
        title.style.fontSize = '1.5rem';
        title.style.fontWeight = '700';
        title.style.color = '#111827';
        title.style.marginBottom = '1.5rem';
        title.style.textAlign = 'center';
    }

    // Do not hide main-header-desc, it might contain important instructions or alerts

    // Hide locale picker safely without hiding the utilities container (which holds global alerts)
    const utilitiesContainer = document.querySelector('.pf-v5-c-login__main-header-utilities');
    if (utilitiesContainer) {
        Array.from(utilitiesContainer.children).forEach(child => {
            if (!child.classList.contains('pf-v5-c-alert')) {
                child.style.display = 'none';
            }
        });
    }

    // Hide "Usuario" field in registration and sync with email
    const registerForm = document.getElementById('kc-register-form');
    if (registerForm) {
        const usernameInput = registerForm.querySelector('input[name="username"]');
        const emailInput = registerForm.querySelector('input[name="email"]');
        
        if (usernameInput && emailInput) {
            const group = usernameInput.closest('.pf-v5-c-form__group');
            if (group) group.style.display = 'none'; // Hide the whole group
            
            emailInput.addEventListener('input', function() {
                usernameInput.value = emailInput.value;
            });
        }

        // Reorder registration fields safely
        const order = ['firstName', 'lastName', 'email', 'password', 'password-confirm'];
        order.forEach(name => {
            const input = registerForm.querySelector(`input[name="${name}"]`);
            if (input) {
                const group = input.closest('.pf-v5-c-form__group');
                if (group) registerForm.appendChild(group);
            }
        });

        // Ensure submit button is at the end
        const btnGroup = document.getElementById('kc-form-buttons');
        if (btnGroup) {
            registerForm.appendChild(btnGroup);
        }
    }

    // Convert all labels into placeholders (using Spanish texts)
    const inputs = document.querySelectorAll('.pf-v5-c-form-control, input[type="text"], input[type="password"], input[type="email"]');
    inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) {
                let labelText = label.innerText.replace('*', '').trim();
                
                // Enforce proper Spanish placeholders
                if (labelText.toLowerCase().includes('nombre') && !labelText.toLowerCase().includes('usuario')) {
                    labelText = 'Nombres';
                } else if (labelText.toLowerCase().includes('apellido')) {
                    labelText = 'Apellidos';
                } else if (labelText.toLowerCase().includes('correo')) {
                    labelText = 'Correo electrónico';
                } else if (labelText.toLowerCase().includes('confirmar')) {
                    labelText = 'Confirmar contraseña';
                } else if (labelText.toLowerCase().includes('contraseña')) {
                    labelText = 'Contraseña';
                } else if (labelText.toLowerCase().includes('usuario')) {
                    labelText = 'Usuario o correo';
                }

                input.setAttribute('placeholder', labelText);
                label.style.display = 'none'; // Hide the label visually
            }
        }
    });

    // Style the registration link at the bottom (for login page)
    const registerNode = document.getElementById('kc-registration');
    if (registerNode) {
        const link = registerNode.querySelector('a');
        if (link) {
            // Put the link on a new line using <br>
            registerNode.innerHTML = `<span>¿No tienes cuenta?<br><a href="${link.href}" style="display:inline-block; margin-top:0.5rem; font-weight:600;">Regístrate ahora</a></span>`;
        }
    }

    // Identify if it's Login or Registration and set the title text safely
    if (title) {
        if (document.getElementById('kc-register-form')) {
            title.innerText = 'Registro';
        } else {
            title.innerText = 'Iniciar sesión';
        }
    }
    // We intentionally DO NOT overwrite kc-header-wrapper because Keycloak might inject alerts there.
});
