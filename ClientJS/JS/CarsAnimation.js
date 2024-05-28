var w, h;
var parklock = false;
var parklist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var queueitems = 0;

function setupparkingmanager() {
    w = document.getElementById('parkingspace').offsetWidth;
    h = document.getElementById('parkingspace').offsetHeight;

    // creating Animations -- important part
    var anim = document.createElement('style');
    var rule1 = document.createTextNode('@-webkit-keyframes car-park {' +
        'from { transform: rotate(270deg) }' +
        '80% { transform: rotate(270deg) translate(0px,-' + w + 'px) }' +
        '90% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) }' +
        'to { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,-' + h * .25 + 'px)}' +
        '}');
    anim.appendChild(rule1);
    var rule2 = document.createTextNode('@-webkit-keyframes car-bottom {' +
        'from { transform: rotate(270deg) }' +
        '80% { transform: rotate(270deg) translate(0px,-' + w + 'px) }' +
        '90% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) }' +
        'to { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,' + h * .25 + 'px)}' +
        '}');
    anim.appendChild(rule2);
    var rule3 = document.createTextNode('@-webkit-keyframes car-exit-top {' +
        'from { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,-' + h * .25 + 'px) }' +
        '80% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,-' + h * .25 + 'px) translate(0px,' + h * .25 + 'px)}' +
        '90% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,-' + h * .25 + 'px) translate(0px,' + h * .25 + 'px) rotate(90deg)}' +
        'to { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,-' + h * .25 + 'px) translate(0px,' + h * .25 + 'px) rotate(90deg) translate(0px,-' + w + 'px)}' +
        '}');
    anim.appendChild(rule3);
    var rule4 = document.createTextNode('@-webkit-keyframes car-exit-bottom {' +
        'from { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,' + h * .25 + 'px) }' +
        '80% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,' + h * .25 + 'px) translate(0px,-' + h * .25 + 'px)}' +
        '90% { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,' + h * .25 + 'px) translate(0px,-' + h * .25 + 'px) rotate(90deg)}' +
        'to { transform: rotate(270deg) translate(0px,-' + w + 'px) rotate(90deg) translate(0px,' + h * .25 + 'px) translate(0px,-' + h * .25 + 'px) rotate(90deg) translate(0px,-' + w + 'px)}' +
        '}');
    anim.appendChild(rule4);
    document.getElementById('parkingspace').appendChild(anim);
}

function updatequeue() {
    for (i = 1; i <= 5; i++) {
        if (i <= queueitems) {
            document.getElementById('queue' + i.toString()).src = 'car.png';
        } else {
            document.getElementById('queue' + i.toString()).src = 'carfaded.png';
        }
    }
}

function addtoqueue() {
    var freeslotflag = 0;
    for (j = 0; j < 10; j++) {
        if (parklist[j] != 1) {
            freeslotflag = 1;
            alert("Free slots available");
            break
        }
    }
    if (freeslotflag != 1) {
        queueitems = queueitems + 1;
        if (queueitems > 5)
            alert("Queue Limit Reached")
        else
            updatequeue();
    }
}

function queuecheck(slot) {
    if (queueitems > 0) {
        queueitems = queueitems - 1;
        updatequeue();
        carenter(slot);
    }
}

function carexit(slot) {
    if (!parklock) {
        parklist[slot] = 0;
        console.log(parklist)
        parklock = true;
        document.getElementById('slot' + (slot + 1).toString()).style.background = 'rgb(27,118,19)';
        if (slot <= 4)
            document.getElementById('car' + (slot).toString()).style.animation = 'car-exit-top 2s both';
        else
            document.getElementById('car' + (slot).toString()).style.animation = 'car-exit-bottom 2s both';
        setTimeout(function () { document.getElementById('car' + (slot).toString()).remove(); parklock = false; queuecheck(slot) }, 2000)
    }
}

function generatenewcar(slot) {
    var space = document.getElementById('parkingspace');
    let img = document.createElement('img');
    img.src = 'car.png';
    img.className = 'new-car-origin';
    img.style.width = (w * .8) * .1 + 'px';
    img.id = 'car' + slot.toString();
    space.appendChild(img)
}


function carenter(slot) {
    if (!document.getElementById('car' + (slot).toString()) && !parklock) {
        parklist[slot] = 1;
        console.log(parklist)
        parklock = true;
        generatenewcar(slot);
        document.getElementById('slot' + (slot + 1).toString()).style.background = 'rgb(146,18,18)';
        if (slot != 4 && slot != 9)
            document.getElementById('car' + (slot).toString()).style.right = (-w + (w * .1) + (((5 - (slot + 1) % 5)) * ((w * .8) * .2)) + ((w * .8) * .05)) + 'px'
        else
            document.getElementById('car' + (slot).toString()).style.right = (-w + (w * .1) + ((w * .8) * .05)) + 'px';
        if (slot <= 4)
            document.getElementById('car' + (slot).toString()).style.animation = 'car-park 2s both';
        else
            document.getElementById('car' + (slot).toString()).style.animation = 'car-bottom 2s both';
        setTimeout(function () { parklock = false; }, 2000)
    }
    else {
        carexit(slot)
    }
}