import { initMenu } from './menu.js';
import { initEstudiantes, fetchEstudiantes } from './estudiantes.js';
import { initRepresentantes, fetchRepresentantes } from './representantes.js';
import { initPagos, fetchPagos } from './pagos.js';
import { initNotas } from './notas.js';

initRepresentantes(fetchRepresentantes);
initPagos(fetchPagos);
initNotas();

// Importa también pagos, notas, búsqueda...

document.addEventListener('DOMContentLoaded', () => {
    const allPages = document.querySelectorAll('.page');

    function showPage(pageId) {
        allPages.forEach(page => page.classList.remove('active'));
        const activePage = document.getElementById(pageId);
        if (activePage) activePage.classList.add('active');

        if (pageId === 'registrarEstudiante') fetchEstudiantes();
        else if (pageId === 'registrarRepresentante') fetchRepresentantes();
        else if (pageId === 'pagos') fetchPagos?.();
        else if (pageId === 'notas') document.getElementById('fichaNotasResultado').innerHTML = '<p>Aquí se mostrarán las notas.</p>';
        else if (pageId === 'buscar') document.getElementById('resultadosBusqueda').innerHTML = '<p>Aquí se mostrarán los resultados.</p>';
    }

    initMenu(showPage);
    initEstudiantes(fetchEstudiantes);
    initRepresentantes(fetchRepresentantes);
    initPagos(fetchPagos);
    initNotas();

    showPage('inicio');
});