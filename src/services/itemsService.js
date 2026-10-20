const items = [
    {
        id: 1,
        nombre: "Centro Estatal de Transfusión Sanguínea",
        ciudad: "La Paz",
        tipo: "Banco de Sangre Central",
        horario: "Lunes a Viernes 7:00 AM - 12:00 PM"
    },
    {
        id: 2,
        nombre: "Hospital General Salvatierra",
        ciudad: "La Paz",
        tipo: "Hospital General",
        horario: "Lunes a Domingo 24 horas"
    },
    {
        id: 3,
        nombre: "Hospital General de Subzona No. 38 IMSS",
        ciudad: "Santa Rosalía",
        tipo: "IMSS",
        horario: "Lunes a Viernes 8:00 AM - 2:00 PM"
    },
    {
        id: 4,
        nombre: "Hospital General de Zona No. 1 IMSS",
        ciudad: "La Paz",
        tipo: "IMSS",
        horario: "Lunes a Viernes 7:00 AM - 1:00 PM"
    }
];

export function getItems() {
    return items;
}

export function getItemById(id) {
    return items.find(item => item.id == id);
}

export default items;