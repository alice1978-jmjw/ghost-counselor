const card = document.getElementById('tilt-card');

// Calculate tilt based on mouse position relative to the screen center
document.addEventListener('mousemove', (e) => {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Reset positioning when the mouse leaves the browser window
document.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s ease';
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
});

// Restore quick response time when mouse re-enters
document.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease-out';
});