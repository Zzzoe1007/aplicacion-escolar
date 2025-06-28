document.addEventListener('DOMContentLoaded', () => {
    console.log('FRONTEND: Documento cargado. Reestableciendo la estructura original.');

    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;

    // Manejo del menú hamburguesa
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            body.classList.toggle('menu-open'); // Clase para oscurecer el main
        });
    } else {
        console.error('FRONTEND: Elementos de navegación (menuToggle o mainNav) no encontrados.');
    }

    // --- Lógica para mostrar/ocultar secciones (PAGES) ---
    const allPages = document.querySelectorAll('.page');

    function showPage(pageId) {
        allPages.forEach(page => {
            page.classList.remove('active'); // Oculta todas las páginas
        });
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.classList.add('active'); // Muestra la página deseada
            console.log(`FRONTEND: Mostrando página: ${pageId}`);
        } else {
            console.error(`FRONTEND: Página con ID "${pageId}" no encontrada.`);
        }

        // Cierra el menú móvil si está abierto
        if (mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        }

        // Llama a las funciones de carga de datos cuando se activa la sección
        if (pageId === 'registrarEstudiante') {
            fetchEstudiantes();
        } else if (pageId === 'registrarRepresentante') {
            fetchRepresentantes();
        } else if (pageId === 'pagos') {
            fetchPagos(); 
        } else if (pageId === 'notas') {
            document.getElementById('fichaNotasResultado').innerHTML = '<p>Aquí se mostrarán los resultados de las notas al buscar por cédula.</p>';
            // No hay lista general de notas en este HTML, se busca por estudiante.
            // document.getElementById('listaNotas').innerHTML = '<li>Notas recientes se mostrarán aquí.</li>'; // Si tuvieras una lista general.
        } else if (pageId === 'buscar') {
            document.getElementById('resultadosBusqueda').innerHTML = '<p>Aquí se mostrarán los resultados de la búsqueda.</p>';
        }
    }

    // Asignar eventos a los botones de navegación
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
            button.addEventListener('click', () => showPage(navButtons[btnId]));
        } else {
            console.error(`FRONTEND: Botón de navegación con ID "${btnId}" no encontrado.`);
        }
    }

    // Mostrar la página de inicio por defecto
    showPage('inicio');

    // --- Módulo de Representantes ---
    const formRepresentante = document.getElementById('formRepresentante');
    const listaRepresentantes = document.getElementById('listaRepresentantes');

    if (formRepresentante) { 
        formRepresentante.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('FRONTEND: Intentando registrar representante...');
            
            const nuevoRepresentante = {
                nombre: document.getElementById('nombreRepresentante').value.trim(),
                cedula: document.getElementById('cedulaRepresentante').value.trim(),
                telefono: document.getElementById('telefonoRepresentante').value.trim(),
                parentesco: document.getElementById('parentescoRepresentante').value.trim(),
            };

            try {
                const response = await fetch('/api/representantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoRepresentante)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Representante registrado con éxito!');
                    formRepresentante.reset();
                    fetchRepresentantes(); // Refrescar la lista
                } else {
                    console.error('FRONTEND: Error en la respuesta del servidor al registrar representante:', response.status, data);
                    alert(`Error al registrar representante: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('FRONTEND: Error de red o del servidor al registrar representante:', error);
                alert('Ocurrió un error de conexión al intentar registrar el representante. Asegúrate que el backend esté corriendo.');
            }
        });
    }

    const fetchRepresentantes = async () => {
        if (!listaRepresentantes) return;
        listaRepresentantes.innerHTML = '<li>Cargando representantes...</li>'; 

        try {
            const response = await fetch('/api/representantes');
            const representantes = await response.json();
            listaRepresentantes.innerHTML = ''; 

            if (representantes.length === 0) {
                listaRepresentantes.innerHTML = '<li>No hay representantes registrados.</li>';
                return;
            }

            representantes.forEach(rep => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span><strong>${rep.nombre}</strong> (ID: ${rep.id})</span>
                    <span>Cédula: ${rep.cedula}</span>
                    <span>Teléfono: ${rep.telefono}</span>
                    <span>Parentesco: ${rep.parentesco}</span>
                `;
                listaRepresentantes.appendChild(li);
            });
        } catch (error) {
            console.error('FRONTEND: Error al obtener representantes:', error);
            listaRepresentantes.innerHTML = '<li>Error al cargar representantes. Asegúrate que el backend esté corriendo y conectado a la DB.</li>';
        }
    };

    // --- Módulo de Estudiantes ---
    const formEstudiante = document.getElementById('formEstudiante');
    const listaEstudiantes = document.getElementById('listaEstudiantes'); 

    if (formEstudiante) { 
        formEstudiante.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('FRONTEND: Intentando registrar estudiante...');

            const nuevoEstudiante = {
                nombre: document.getElementById('nombreEstudiante').value.trim(),
                cedula: document.getElementById('cedulaEstudiante').value.trim(),
                grado: document.getElementById('gradoEstudiante').value.trim(),
                fechaNacimiento: document.getElementById('fechaNacimiento').value, 
                direccion: document.getElementById('direccionEstudiante').value.trim(),
                representanteCedula: document.getElementById('cedulaRepresentanteEstudiante').value.trim()
            };

            try {
                const response = await fetch('/api/estudiantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoEstudiante)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Estudiante registrado con éxito!');
                    formEstudiante.reset();
                    fetchEstudiantes(); // Refrescar la lista
                } else {
                    console.error('FRONTEND: Error en la respuesta del servidor al registrar estudiante:', response.status, data);
                    alert(`Error al registrar estudiante: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('FRONTEND: Error de red o del servidor al registrar estudiante:', error);
                alert('Ocurrió un error de conexión al intentar registrar el estudiante. Asegúrate que el backend esté corriendo.');
            }
        });
    }

    const fetchEstudiantes = async () => {
        if (!listaEstudiantes) return;
        listaEstudiantes.innerHTML = '<li>Cargando estudiantes...</li>';

        try {
            const response = await fetch('/api/estudiantes');
            const estudiantes = await response.json();
            listaEstudiantes.innerHTML = ''; 

            if (estudiantes.length === 0) {
                listaEstudiantes.innerHTML = '<li>No hay estudiantes registrados.</li>';
                return;
            }

            estudiantes.forEach(est => {
                const li = document.createElement('li');
                const fechaNacimientoFormateada = est.fecha_nacimiento ? new Date(est.fecha_nacimiento).toLocaleDateString('es-VE') : 'N/A';
                li.innerHTML = `
                    <span><strong>${est.nombre}</strong> (ID: ${est.id})</span>
                    <span>Cédula/ID: ${est.cedula}</span>
                    <span>Grado: ${est.grado}</span>
                    <span>Nacimiento: ${fechaNacimientoFormateada}</span>
                    <span>Dirección: ${est.direccion || 'No especificada'}</span>
                    <span><strong>Representante: ${est.representante_nombre || 'N/A'}</strong> (${est.representante_cedula || 'N/A'})</span>
                `;
                listaEstudiantes.appendChild(li);
            });
        } catch (error) {
            console.error('FRONTEND: Error al obtener estudiantes:', error);
            listaEstudiantes.innerHTML = '<li>Error al cargar estudiantes. Asegúrate que el backend esté corriendo y conectado a la DB.</li>';
        }
    };

    // --- Módulo de Pagos ---
    const formPago = document.getElementById('formPago');
    const listaPagos = document.getElementById('listaPagos');

    if (formPago) {
        formPago.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('FRONTEND: Intentando registrar pago...');
            const nuevoPago = {
                cedulaEstudiante: document.getElementById('cedulaEstudiantePago').value.trim(),
                monto: parseFloat(document.getElementById('montoPago').value),
                fecha: document.getElementById('fechaPago').value,
                concepto: document.getElementById('conceptoPago').value.trim()
            };

            try {
                const response = await fetch('/api/pagos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoPago)
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Pago registrado con éxito!');
                    formPago.reset();
                    fetchPagos(); // Vuelve a cargar la lista de pagos
                } else {
                    console.error('FRONTEND: Error en la respuesta del servidor al registrar pago:', response.status, data);
                    alert(`Error al registrar pago: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('FRONTEND: Error de red o del servidor al registrar pago:', error);
                alert('Ocurrió un error de conexión al intentar registrar el pago. Asegúrate que el backend esté corriendo y la ruta /api/pagos exista.');
            }
        });
    }

    const fetchPagos = async () => {
        if (!listaPagos) return;
        listaPagos.innerHTML = '<li>Cargando pagos...</li>';
        try {
            const response = await fetch('/api/pagos'); 
            const pagos = await response.json();
            listaPagos.innerHTML = '';
            if (pagos.length === 0) {
                listaPagos.innerHTML = '<li>No hay pagos registrados.</li>';
                return;
            }
            pagos.forEach(pago => {
                const li = document.createElement('li');
                const fechaFormateada = pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-VE') : 'N/A';
                li.innerHTML = `
                    <span><strong>Estudiante:</strong> ${pago.estudiante_nombre || 'N/A'} (Cédula: ${pago.estudiante_cedula || 'N/A'})</span>
                    <span><strong>Monto:</strong> Bs. ${pago.monto.toFixed(2)}</span>
                    <span><strong>Concepto:</strong> ${pago.concepto}</span>
                    <span><strong>Fecha:</strong> ${fechaFormateada}</span>
                `;
                listaPagos.appendChild(li);
            });
        } catch (error) {
            console.error('FRONTEND: Error al obtener pagos:', error);
            listaPagos.innerHTML = '<li>Error al cargar pagos. Asegúrate que el backend esté corriendo y la ruta /api/pagos exista.</li>';
        }
    };


    // --- Módulo de Notas ---
    const formBuscarNotas = document.getElementById('formBuscarNotas');
    const fichaNotasResultado = document.getElementById('fichaNotasResultado');
    const formRegistrarNotas = document.getElementById('formRegistrarNotas');

    if (formBuscarNotas) {
        formBuscarNotas.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cedulaEstudiante = document.getElementById('cedulaEstudianteNotas').value.trim();
            fichaNotasResultado.innerHTML = 'Cargando notas...';

            if (!cedulaEstudiante) {
                fichaNotasResultado.innerHTML = '<p>Por favor, ingrese la cédula del estudiante.</p>';
                return;
            }

            try {
                const response = await fetch(`/api/notas/estudiante/${encodeURIComponent(cedulaEstudiante)}`);
                const data = await response.json(); // Se espera { estudiante: {}, notas: [] }

                fichaNotasResultado.innerHTML = '';

                if (response.ok) {
                    if (data.estudiante) {
                        let html = `<h3>Notas de ${data.estudiante.nombre} (Cédula: ${data.estudiante.cedula})</h3>`;
                        if (data.notas && data.notas.length > 0) {
                            html += '<ul>';
                            data.notas.forEach(nota => {
                                html += `<li>Materia: ${nota.materia}, Nota: ${nota.valor}, Fecha: ${new Date(nota.fecha_nota).toLocaleDateString('es-VE')}</li>`;
                            });
                            html += '</ul>';
                        } else {
                            html += '<p>No se encontraron notas para este estudiante.</p>';
                        }
                        fichaNotasResultado.innerHTML = html;
                    } else {
                        fichaNotasResultado.innerHTML = '<p>Estudiante no encontrado.</p>';
                    }
                } else {
                    console.error('FRONTEND: Error al buscar notas:', data);
                    fichaNotasResultado.innerHTML = `<p>Error al buscar notas: ${data.message || response.statusText}</p>`;
                }
            } catch (error) {
                console.error('FRONTEND: Error de red o del servidor al buscar notas:', error);
                fichaNotasResultado.innerHTML = '<p>Error de conexión al buscar notas. Asegúrate que el backend esté corriendo y la ruta sea correcta.</p>';
            }
        });
    }

    if (formRegistrarNotas) {
        formRegistrarNotas.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('FRONTEND: Intentando registrar nota...');
            const nuevaNota = {
                cedulaEstudiante: document.getElementById('cedulaEstudianteAddNota').value.trim(),
                materia: document.getElementById('materiaNota').value.trim(),
                valor: parseFloat(document.getElementById('valorNota').value),
                fecha: document.getElementById('fechaNota').value // Usar el campo de fecha si existe
            };
            if (!nuevaNota.fecha) { // Si no hay campo de fecha, usar la actual
                nuevaNota.fecha = new Date().toISOString().slice(0, 10); 
            }

            try {
                const response = await fetch('/api/notas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaNota)
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Nota registrada con éxito!');
                    formRegistrarNotas.reset();
                } else {
                    console.error('FRONTEND: Error en la respuesta del servidor al registrar nota:', response.status, data);
                    alert(`Error al registrar nota: ${data.message || response.statusText}`);
                }
            } catch (error) {
                console.error('FRONTEND: Error de red o del servidor al registrar nota:', error);
                alert('Ocurrió un error de conexión al intentar registrar la nota. Asegúrate que el backend esté corriendo y la ruta /api/notas exista.');
            }
        });
    }


    // --- Módulo de Búsqueda General (Estudiantes y Representantes) ---
    const formBuscador = document.getElementById('formBuscador');
    const resultadosBusqueda = document.getElementById('resultadosBusqueda');

    if (formBuscador) {
        formBuscador.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tipoBusqueda = document.getElementById('tipoBusqueda').value;
            const criterioBusqueda = document.getElementById('criterioBusqueda').value.trim();
            resultadosBusqueda.innerHTML = '<li>Buscando...</li>';

            if (!criterioBusqueda) {
                resultadosBusqueda.innerHTML = '<p>Ingrese un criterio de búsqueda.</p>';
                return;
            }

            try {
                let response;
                let data;

                if (tipoBusqueda === 'estudiante') {
                    // Cuidado: Cambiado a una nueva ruta que trae estudiante + notas
                    response = await fetch(`/api/estudiantes/buscarConNotas?query=${encodeURIComponent(criterioBusqueda)}`);
                    data = await response.json(); // Se espera { estudiante: {}, notas: [] }

                    resultadosBusqueda.innerHTML = '';
                    if (data.estudiante) {
                        let html = `
                            <h4>Estudiante:</h4>
                            <ul>
                                <li>
                                    <span><strong>${data.estudiante.nombre}</strong> (ID: ${data.estudiante.id})</span>
                                    <span>Cédula: ${data.estudiante.cedula}</span>
                                    <span>Grado: ${data.estudiante.grado}</span>
                                    <span>Nacimiento: ${data.estudiante.fecha_nacimiento ? new Date(data.estudiante.fecha_nacimiento).toLocaleDateString('es-VE') : 'N/A'}</span>
                                    <span>Dirección: ${data.estudiante.direccion || 'No especificada'}</span>
                                    <span>Representante: ${data.estudiante.representante_nombre || 'N/A'} (Cédula: ${data.estudiante.representante_cedula || 'N/A'})</span>
                                </li>
                            </ul>
                        `;
                        if (data.notas && data.notas.length > 0) {
                            html += '<h4>Notas del Estudiante:</h4><ul>';
                            data.notas.forEach(nota => {
                                html += `<li>Materia: ${nota.materia}, Nota: ${nota.valor}, Fecha: ${new Date(nota.fecha_nota).toLocaleDateString('es-VE')}</li>`;
                            });
                            html += '</ul>';
                        } else {
                            html += '<p>Este estudiante no tiene notas registradas.</p>';
                        }
                        resultadosBusqueda.innerHTML = html;
                    } else {
                        resultadosBusqueda.innerHTML = '<p>No se encontraron estudiantes con ese criterio.</p>';
                    }
                } else if (tipoBusqueda === 'representante') {
                    // Cuidado: Aquí es donde cambiaremos la llamada a la API
                    // Necesitamos una nueva ruta que traiga representantes E hijos
                    response = await fetch(`/api/representantes/buscarConHijos?query=${encodeURIComponent(criterioBusqueda)}`);
                    data = await response.json(); // Esperamos { representante: {}, hijos: [] }

                    resultadosBusqueda.innerHTML = '';
                    
                    if (data.representante) {
                        let html = `
                            <h4>Representante:</h4>
                            <ul>
                                <li>
                                    <span><strong>${data.representante.nombre}</strong> (Cédula: ${data.representante.cedula})</span>
                                    <span>Teléfono: ${data.representante.telefono}</span>
                                    <span>Parentesco: ${data.representante.parentesco}</span>
                                </li>
                            </ul>
                        `;

                        if (data.hijos && data.hijos.length > 0) {
                            html += '<h4>Hijos Inscritos:</h4><ul>';
                            data.hijos.forEach(hijo => {
                                const fechaNacimientoHijo = hijo.fecha_nacimiento ? new Date(hijo.fecha_nacimiento).toLocaleDateString('es-VE') : 'N/A';
                                html += `
                                    <li>
                                        <span><strong>${hijo.nombre}</strong> (Cédula: ${hijo.cedula})</span>
                                        <span>Grado: ${hijo.grado}</span>
                                        <span>Nacimiento: ${fechaNacimientoHijo}</span>
                                    </li>
                                `;
                            });
                            html += '</ul>';
                        } else {
                            html += '<p>Este representante no tiene hijos inscritos en el sistema.</p>';
                        }
                        resultadosBusqueda.innerHTML = html;

                    } else {
                        resultadosBusqueda.innerHTML = '<p>No se encontraron representantes con ese criterio.</p>';
                    }
                }
            } catch (error) {
                console.error('FRONTEND: Error al realizar la búsqueda:', error);
                resultadosBusqueda.innerHTML = '<p>Error al realizar la búsqueda. Asegúrate que el backend esté corriendo y las rutas de búsqueda existan.</p>';
            }
        });
    }
});