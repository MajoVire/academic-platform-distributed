document.addEventListener("DOMContentLoaded", function() {
    // Hide standard title and generic helper texts
    const title = document.getElementById('kc-page-title');
    if (title) title.style.display = 'none';

    // Hide required fields text
    const helperText = document.querySelector('.pf-v5-c-login__main-header-desc');
    if (helperText) helperText.style.display = 'none';

    // Hide locale picker
    const localePicker = document.querySelector('.pf-v5-c-login__main-header-utilities');
    if (localePicker) localePicker.style.display = 'none';

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

    // Identify if it's Login or Registration and set the title
    const headerWrapper = document.getElementById('kc-header-wrapper');
    if (headerWrapper) {
        if (document.getElementById('kc-register-form')) {
            headerWrapper.innerHTML = '<h2>Registro</h2>';
        } else {
            headerWrapper.innerHTML = '<h2>Iniciar sesión</h2>';
        }
    }
});
