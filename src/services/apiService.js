const API_URL = 'https://jsonplaceholder.typicode.com/users';

export async function getItems(retries = 1) {
    const timeoutMs = 5000;

    for (let intento = 0; intento <= retries; intento++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(API_URL, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const serverError = new Error(`Error del servidor: ${response.status}`);
                serverError.type = 'SERVER_ERROR';
                serverError.status = response.status;
                throw serverError;
            }

            const data = await response.json();

            // Mapeo sincronizado con los 4 centros
            return data.slice(0, 4).map((user, index) => {
                const idReal = index + 1;
                
                const centrosBCS = {
                    1: { nombre: "Centro Estatal de Transfusión Sanguínea", ciudad: "La Paz", tipo: "Banco de Sangre Central", horario: "Lunes a Viernes 7:00 AM - 12:00 PM" },
                    2: { nombre: "Hospital General Salvatierra", ciudad: "La Paz", tipo: "Hospital General", horario: "Lunes a Domingo 24 horas" },
                    3: { nombre: "Hospital General de Subzona No. 38 IMSS", ciudad: "Santa Rosalía", tipo: "IMSS", horario: "Lunes a Viernes 8:00 AM - 2:00 PM" },
                    4: { nombre: "Hospital General de Zona No. 1 IMSS", ciudad: "La Paz", tipo: "IMSS", horario: "Lunes a Viernes 7:00 AM - 1:00 PM" }
                };

                const infoCentro = centrosBCS[idReal];

                return {
                    id: idReal,
                    nombre: infoCentro.nombre,
                    ciudad: infoCentro.ciudad,
                    tipo: infoCentro.tipo,
                    horario: infoCentro.horario,
                    slug: user.username.toLowerCase()
                };
            });

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                error.type = 'TIMEOUT_ERROR';
            } else if (error instanceof TypeError || !error.type) {
                error.type = 'NETWORK_ERROR';
            }

            const esErrorDeServidor = error.type === 'SERVER_ERROR';

            if (intento < retries && !esErrorDeServidor) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue; 
            }

            throw error;
        }
    }
}