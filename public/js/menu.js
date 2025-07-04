export function initMenu(showPageCallback) {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }

    const navButtons = {
        btnInicio: 'inicio',
        btnRegistrarEstudiante: 'registrarEstudiante',
        btnRegistrarRepresentante: 'registrarRepresentante',
        btnPagos: 'pagos',
        btnNotas: 'notas',
        btnBuscar: 'buscar'
    };

    for (const btnId in navButtons) {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', () => showPageCallback(navButtons[btnId]));
        }
    }
}