function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var content = document.getElementById("content");
    if (sidebar.style.width === '250px') {
        sidebar.style.width = '0';
        content.classList.remove('active');
    } else {
        sidebar.style.width = '250px';
        content.classList.add('active');
    }
}