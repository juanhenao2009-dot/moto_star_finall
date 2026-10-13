/* Utilidades compartidas */
function openModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerText = message;
    document.getElementById('infoModal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}
function esc(t) {
    return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
