// public/js/notas.js
export function initNotas() {
    const formBuscar = document.getElementById('formBuscarNotas');
    const formRegistrar = document.getElementById('formRegistrarNotas');
    const resultado = document.getElementById('fichaNotasResultado');

    if (formBuscar) {
        formBuscar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cedula = document.getElementById('cedulaEstudianteNotas').value.trim();

            try {
                const response = await fetch(`/api/notas/estudiante/${cedula}`);
                const data = await response.json();

                if (!data.estudiante) {
                    resultado.innerHTML = '<p>No se encontró el estudiante.</p>';
                    return;
                }

                let html = `<h4>${data.estudiante.nombre} (${data.estudiante.cedula})</h4>`;
                if (data.notas.length === 0) {
                    html += '<p>Este estudiante no tiene notas registradas.</p>';
                } else {
                    html += '<ul>';
                    data.notas.forEach(nota => {
                        const fecha = new Date(nota.fecha_nota).toLocaleDateString('es-VE');
                        html += `<li><strong>${nota.materia}</strong>: ${nota.valor} (Fecha: ${fecha})</li>`;
                    });
                    html += '</ul>';
                }

                resultado.innerHTML = html;
            } catch (error) {
                resultado.innerHTML = '<p>Error al buscar notas.</p>';
            }
        });
    }

    if (formRegistrar) {
        formRegistrar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevaNota = {
                cedulaEstudiante: document.getElementById('cedulaEstudianteAddNota').value.trim(),
                materia: document.getElementById('materiaNota').value.trim(),
                valor: parseFloat(document.getElementById('valorNota').value),
                fecha: new Date().toISOString().split('T')[0]
            };

            try {
                const response = await fetch('/api/notas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaNota)
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Nota registrada con éxito!');
                    formRegistrar.reset();
                } else {
                    alert(`Error al registrar nota: ${data.message || response.statusText}`);
                }
            } catch (error) {
                alert('Error de conexión al registrar nota.');
            }
        });
    }
}