let settings = {
    lines: 20,
    amplitudeX: 150,
    amplitudeY: 60,
    hueStartColor: 200,
    saturationStartColor: 74,
    lightnessStartColor: 67,
    hueEndColor: 340,
    saturationEndColor: 90,
    lightnessEndColor: 14,
    smoothness: 4,
    offsetX: 0,
    fill: true,
    crazyness: false
};

let svg, winW, winH, Colors, Paths, overflow, startColor, endColor;

class Path {
    constructor(index){
        this.index = index;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = 0.02 + Math.random() * 0.03;
        this.el = document.createElementNS('http://www.w3.org/2000/svg','path');
        svg.appendChild(this.el);
    }
    updatePath(){
        const points = [];
        const step = settings.smoothness * 10;
        for(let x = -overflow; x <= winW + overflow; x += step){
            let y = (winH / settings.lines) * this.index;
            y += Math.sin((x / settings.amplitudeX) + this.phase) * settings.amplitudeY;
            if(settings.crazyness){
                y += Math.cos((x / settings.amplitudeX) - this.phase) * (settings.amplitudeY / 2);
            }
            points.push([x, y]);
        }
        let d = `M ${points[0][0]} ${points[0][1]}`;
        for(let i=1;i<points.length;i++){
            d += ` L ${points[i][0]} ${points[i][1]}`;
        }
        if(settings.fill){
            d += ` V ${winH + overflow} H ${-overflow} Z`;
            this.el.setAttribute('fill', Colors[this.index]);
            this.el.setAttribute('stroke', 'none');
        } else {
            this.el.setAttribute('fill', 'none');
            this.el.setAttribute('stroke', Colors[this.index]);
            this.el.setAttribute('stroke-width', '2');
        }
        this.el.setAttribute('d', d);
    }
    animate(){
        this.phase += this.speed;
        this.updatePath();
    }
}

function animate(){
    Paths.forEach(p => p.animate());
    requestAnimationFrame(animate);
}

function init(){
    if(!svg){
        svg = document.getElementById('svg');
        if(!svg) return;
    }
    svg.innerHTML = '';
    winW = window.innerWidth;
    winH = window.innerHeight;
    overflow = Math.max(settings.amplitudeX, settings.amplitudeY) + 50;

    startColor = chroma.hsl(settings.hueStartColor, settings.saturationStartColor/100, settings.lightnessStartColor/100);
    endColor = chroma.hsl(settings.hueEndColor, settings.saturationEndColor/100, settings.lightnessEndColor/100);
    Colors = chroma.scale([startColor, endColor]).mode('lch').colors(settings.lines);

    Paths = [];
    for(let i=0;i<settings.lines;i++){
        const p = new Path(i);
        Paths.push(p);
        p.updatePath();
    }
    requestAnimationFrame(animate);
}

function randomize() {
    settings = {
        // --- MODIFIED VALUES FOR A CALMER EFFECT ---
        lines: parseInt(5 + Math.random() * 15),      // Fewer lines (Max 20 instead of 50)
        amplitudeX: parseInt(150 + Math.random() * 100), // Less horizontal variation
        amplitudeY: parseInt(20 + Math.random() * 30), // Flatter waves
        // --- END OF MODIFICATIONS ---

        hueStartColor: parseInt(Math.random() * 360),
        saturationStartColor: 74,
        lightnessStartColor: 67,
        hueEndColor: parseInt(Math.random() * 360),
        saturationEndColor: 90,
        lightnessEndColor: 14,
        smoothness: 1 + parseInt(Math.random() * 9),
        offsetX: parseInt(-20 + Math.random() * 40),
        fill: Math.random() > 0.3,
        crazyness: false // Crazyness is disabled for a calmer effect
    };
    svg = document.getElementById('svg');
    if (!svg) return;
    winW = window.innerWidth;
    winH = window.innerHeight;
    init();
}

window.generateRandomBackground = randomize;

document.addEventListener('DOMContentLoaded', () => {
    window.generateRandomBackground();
    window.addEventListener('resize', () => {
        winW = window.innerWidth;
        winH = window.innerHeight;
        init();
    });
});
