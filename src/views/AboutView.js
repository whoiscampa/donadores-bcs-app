export function AboutView() {
    const container = document.createElement('div');
    container.className = 'about-view';
    container.innerHTML = `
        <h2>Acerca de Donadores BCS</h2>
        <p>Plataforma para facilitar la información sobre bancos de sangre en el estado de Baja California Sur.</p>
    `;
    return container;
}