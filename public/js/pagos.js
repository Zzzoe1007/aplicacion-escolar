// public/js/pagos.js
export function initPagos(fetchPagos) {
    const form = document.getElementById('formPago');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nuevoPago = {
                cedulaEstudiante: document.getElementById('cedulaEstudiantePago').value.trim(),
                monto: parseFloat(document.getElementById('montoPago').value),
                concepto: document.getElementById('conceptoPago').value.trim(),
                fecha: document.getElementById('fechaPago').value
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
                    form.reset();
                    fetchPagos();
                } else {
                    alert(`Error al registrar pago: ${data.message || response.statusText}`);
                }
            } catch (error) {
                alert('Error de conexión al registrar pago.');
            }
        });
    }
}

export async function fetchPagos() {
    const lista = document.getElementById('listaPagos');
    if (!lista) return;

    lista.innerHTML = '<li>Cargando pagos...</li>';

    try {
        const response = await fetch('/api/pagos');
        const pagos = await response.json();
        lista.innerHTML = '';

        if (pagos.length === 0) {
            lista.innerHTML = '<li>No hay pagos registrados.</li>';
            return;
        }

        pagos.forEach(pago => {
            const fecha = new Date(pago.fecha_pago).toLocaleDateString('es-VE');
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${pago.estudiante_nombre}</strong> (${pago.estudiante_cedula})</span>
                <span>Monto: Bs. ${pago.monto.toFixed(2)}</span>
                <span>Concepto: ${pago.concepto}</span>
                <span>Fecha: ${fecha}</span>
            `;
            lista.appendChild(li);
        });
    } catch (error) {
        lista.innerHTML = '<li>Error al cargar pagos.</li>';
    }
}