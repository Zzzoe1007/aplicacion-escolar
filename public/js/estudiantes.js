export function initEstudiantes(fetchEstudiantes) {
    const formEstudiante = document.getElementById('formEstudiante');

    if (formEstudiante) {
        formEstudiante.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                    fetchEstudiantes();
                } else {
                    alert(`Error al registrar estudiante: ${data.message || response.statusText}`);
                }
            } catch (error) {
                alert('Error de conexión al registrar estudiante.');
            }
        });
    }
}

export async function fetchEstudiantes() {
    const listaEstudiantes = document.getElementById('listaEstudiantes');
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
            const fechaNacimientoFormateada = est.fecha_nacimiento
                ? new Date(est.fecha_nacimiento).toLocaleDateString('es-VE')
                : 'N/A';
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
        listaEstudiantes.innerHTML = '<li>Error al cargar estudiantes.</li>';
    }
}