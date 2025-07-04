// public/js/representantes.js
export function initRepresentantes(fetchRepresentantes) {
    const form = document.getElementById('formRepresentante');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevoRepresentante = {
                nombre: document.getElementById('nombreRepresentante').value.trim(),
                cedula: document.getElementById('cedulaRepresentante').value.trim(),
                telefono: document.getElementById('telefonoRepresentante').value.trim(),
                parentesco: document.getElementById('parentescoRepresentante').value.trim()
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
                    form.reset();
                    fetchRepresentantes();
                } else {
                    alert(`Error al registrar representante: ${data.message || response.statusText}`);
                }
            } catch (error) {
                alert('Error de conexión al registrar representante.');
            }
        });
    }
}

export async function fetchRepresentantes() {
    const lista = document.getElementById('listaRepresentantes');
    if (!lista) return;

    lista.innerHTML = '<li>Cargando representantes...</li>';

    try {
        const response = await fetch('/api/representantes');
        const representantes = await response.json();
        lista.innerHTML = '';

        if (representantes.length === 0) {
            lista.innerHTML = '<li>No hay representantes registrados.</li>';
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
            lista.appendChild(li);
        });
    } catch (error) {
        lista.innerHTML = '<li>Error al cargar representantes.</li>';
    }
}