const addBtn = document.getElementById('add')
const main = document.getElementById('main')
const arList = document.getElementById('arList')
const notif = document.getElementById('notification');
let notifAllowed = true
const mode = document.getElementById('mode')
let currentTheme = 'light'

let mouseDown

document.body.onmousedown = function () {
    mouseDown = 1;
}
document.body.onmouseup = function () {
    mouseDown = 0;
}
document.body.onmouseleave = function () {
    mouseDown = 0;
}

//helper function
const getCSSVal = (input) => {
    let [temp] = input.match(/[+-]?\d+\.?\d*/g).map(Number)
    return temp
}

//array of areas
const AREAS = [];

//area counter
let AREA_counter = 1;

addBtn.addEventListener('click', createOp)
window.addEventListener('DOMContentLoaded', () => {
    main.addEventListener('mousemove', areaMovement);
})

// create new option in select element list (UI)
function createOp(e, saved = false) {
    let initialW = 100;
    let initialH = 100;
    let initialBorders = 2;

    let imageSize = main.getBoundingClientRect();
    let newArea = document.createElement('div');
    newArea.id = saved ? `area${saved.id}` : `area${AREA_counter}`;
    newArea.className = 'area active';

    //place it in the middle of the picture
    newArea.style.width = saved ? saved.width : `${initialW}px`
    newArea.style.height = saved ? saved.height : `${initialH}px`
    newArea.style.top = saved ? saved.top : `${imageSize.height/2 - initialH/2 - initialBorders}px`
    newArea.style.right = saved ? saved.right : `${imageSize.width/2 - initialW/2 - initialBorders}px`
    newArea.style.bottom = saved ? saved.bottom : `${imageSize.height/2 - initialH/2 - initialBorders}px`
    newArea.style.left = saved ? saved.left : `${imageSize.width/2 - initialW/2 - initialBorders}px`

    newArea.innerHTML = `
    <div class="areaControls">
        <span class="areaTitle tooltip">
            <span class="areaName">
                ${
                    saved ? saved.name : `Area&nbsp;${AREA_counter}`
                }
            </span>
            <span class="tooltiptext">
                <ul class = "tooltiplist">
                    <li class = "listoption">
                        size: 
                        <span class="float-val">
                            <span class="W">
                                ${getCSSVal(newArea.style.width)}
                            </span>
                            <i class="fas fa-times"></i>
                            <span class="H">
                                ${getCSSVal(newArea.style.height)}
                            </span>
                            px
                        </span>
                    </li>
                    <li class = "listoption">
                        top: <span class="float-val">
                                <b class="top-val">${getCSSVal(newArea.style.top)}</b> px
                            </span>
                    </li>
                    <li class = "listoption">
                        right: <span class="float-val">
                            <b class="right-val">${getCSSVal(newArea.style.right)}</b> px
                        </span>
                    </li>
                    <li class = "listoption">
                        bottom: <span class="float-val">
                            <b class="bottom-val">${getCSSVal(newArea.style.bottom)}</b> px
                        </span>
                    </li>
                    <li class = "listoption">
                        left: <span class="float-val">
                            <b class="left-val">${getCSSVal(newArea.style.left)}</b> px
                        </span>
                    </li>
                </ul>
            </span>
        </span>
        <div class="up" onmousedown=resize(event)></div>
        <div class="up-right" onmousedown=resize(event)></div>
        <div class="right" onmousedown=resize(event)></div>
        <div class="down-right" onmousedown=resize(event)></div>
        <div class="down" onmousedown=resize(event)></div>
        <div class="down-left" onmousedown=resize(event)></div>
        <div class="left" onmousedown=resize(event)></div>
        <div class="up-left" onmousedown=resize(event)></div>
    </div>`;



    //add event listeners for mouse movement
    newArea.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('area')) {
            e.target.classList.add('beingMoved', 'active');

            [...arList.children].forEach(node => {
                if (`area${node.id}` !== e.target.id) {
                    document.getElementById(node.id).classList.remove('yellowBG');
                    document.getElementById(`area${node.id}`).classList.remove('active');
                } else {
                    document.getElementById(node.id).classList.add('yellowBG');
                }
            })

            console.log('%cMOUSEDOWN EVENT', 'color:red');
            console.log('\tcurrent area:', e.target.id)
            console.log('\tcurrent cursor:', e.offsetX, e.offsetY)
        }
    });

    document.body.addEventListener('mouseup', (e) => {
        if (document.querySelector('.beingMoved')) {
            document.querySelector('.beingMoved').classList.remove('beingMoved');
        }
        console.log('%cMOUSEUP EVENT', 'color:green');
    });

    newArea.addEventListener('mouseleave', (e) => {
        if (!mouseDown) {
            e.target.classList.remove('beingMoved');
        }
    });

    //deactivate all the areas
    AREAS.forEach(ar => {
        ar.classList.remove('active');
    })

    //append new area to the list
    AREAS.push(newArea);

    //append to the dom
    main.appendChild(newArea);

    //creating the DOM list element
    let op = document.createElement('div');
    op.id = saved ? saved.id : `${AREA_counter}`;
    op.className = 'entry yellowBG';
    op.innerHTML = `<input type='text' class='name' maxlength="8" oninput="handleNameChange(this)" value='${saved ? saved.name : `Area ${AREA_counter}`}'/>   
                    <button class='delete' title='delete' onclick=removeArea(this)><i class="fas fa-times"></i></button>`;
    op.addEventListener('click', function () {
        selectArea(this)
    });

    //make other elements in the list unselected (remove yellow bg)
    [...arList.children].forEach(listEl => {
        listEl.classList.remove('yellowBG');
    })

    //appending to DOM
    arList.appendChild(op);

    //counting the list items
    AREA_counter = saved ? saved.id + 1 : AREA_counter + 1;
}

//handling namechange
function handleNameChange(t) {
    let correspondingArea = document.getElementById(`area${t.parentElement.id}`);
    correspondingArea.querySelector('.areaName').innerHTML = t.value;
}

//clearing the view
function clearView() {
    main.innerHTML = ''
    arList.innerHTML = ''
    AREA_counter = 1
    AREAS.length = 0
}

document.getElementById('refresh').addEventListener('click', () => {
    clearView()
    showNotification('Areas cleared!')
})

function getActualState() {
    let data = []
    main.querySelectorAll('.area').forEach(area => {
        let areaStyle = window.getComputedStyle(area, null)
        let areaData = {
            id: getCSSVal(area.id),
            name: area.querySelector('.areaName').innerText,
            top: areaStyle.getPropertyValue("top"),
            right: areaStyle.getPropertyValue("right"),
            bottom: areaStyle.getPropertyValue("bottom"),
            left: areaStyle.getPropertyValue("left"),
            width: areaStyle.getPropertyValue("width"),
            height: areaStyle.getPropertyValue("height")
        }
        data.push(areaData)
    })
    return data
}
//save parameters to localstorage
document.getElementById('save').addEventListener('click', () => {
    localStorage.setItem('Area-Selection-Tool-Data', JSON.stringify(getActualState()));
    localStorage.setItem('Area-Selection-Tool-Image', main.style.backgroundImage);
    showNotification('Session saved!')
})

//restore parameters from localstorage
document.getElementById('restore').addEventListener('click', () => {
    //clear the view first
    clearView()

    let data = JSON.parse(localStorage.getItem('Area-Selection-Tool-Data'));
    if (data) {
        data.forEach(area => {
            createOp(null, area);
        })
    }
    main.style.backgroundImage = localStorage.getItem('Area-Selection-Tool-Image');
    showNotification('Session restored!')
})

//exporting data from localstorage to clipboard
document.getElementById('export').addEventListener('click', () => {
    let data = getActualState()
    if (data) {
        navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
            showNotification('Data copied to clipboard!');
        }, (err) => {
            console.log('%cError copying data to clipboard', 'color:red');
        })
    }
})

//change color mode
mode.addEventListener('click', () => {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
    } else {
        currentTheme = 'light';
    }

    mode.querySelector('i').classList.toggle('fa-moon');
    mode.querySelector('i').classList.toggle('fa-sun');
    document.body.setAttribute('data-theme', currentTheme);
})

//upload background image
document.getElementById('upload').addEventListener('click', () => {
    document.getElementById('file').click();
})

document.getElementById('file').addEventListener('change', (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onloadend = function (e) {
        main.style.backgroundImage = `url(${e.target.result})`;
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {}
}, true)


//show notification
const showNotification = (msg) => {
    if (notifAllowed) {
        notifAllowed = false;
        notif.classList.add('show');
        notif.querySelector('.message').innerHTML = msg;
        setTimeout(() => {
            notif.classList.remove('show');
            notifAllowed = true;
        }, 2000);
    }
}

//deleting area
function removeArea(e) {
    document.getElementById(`area${e.parentNode.id}`).remove()
    e.parentNode.remove()
}

//selecting area
function selectArea(e) {
    if (!e.parentNode) {
        return false
    } else {
        [...e.parentNode.children].forEach(node => {
            if (node.id !== e.id) {
                node.classList.remove('yellowBG')
                document.getElementById(`area${node.id}`).classList.remove('active');
            } else {
                if (node.classList.contains('yellowBG')) {
                    node.classList.remove('yellowBG')
                    document.getElementById(`area${node.id}`).classList.remove('active');
                } else {
                    node.classList.add('yellowBG')
                    document.getElementById(`area${node.id}`).classList.add('active');
                }
            }
        });
    }
}

const areaMovement = (e) => {
    let movable = document.querySelector('.beingMoved')
    if (mouseDown && movable && e.target.id === movable.id) {
        // get position of the image to compute areas positions relative to it
        let rectImage = main.getBoundingClientRect();
        let rectAreas = movable.getBoundingClientRect();

        console.log('%cMOUSEHOVER EVENT', 'color:blue');
        console.log('\tcurrent area', movable.id)
        console.log('\tcurrent cursor:', e.offsetX, e.offsetY)
        console.log('\tcurrent movement:', e.movementX, e.movementY);

        //check if any of inset parameters were left unset after resizing and compute them again in such case
        if (movable.style.top === 'unset') {
            movable.style.top = `${rectImage.height - rectAreas.height - getCSSVal(movable.style.bottom)}px`
        }
        if (movable.style.bottom === 'unset') {
            movable.style.bottom = `${rectImage.height - rectAreas.height - getCSSVal(movable.style.top)}px`
        }
        if (movable.style.left === 'unset') {
            movable.style.left = `${rectImage.width - rectAreas.width - getCSSVal(movable.style.right)}px`
        }
        if (movable.style.right === 'unset') {
            movable.style.right = `${rectImage.width - rectAreas.width - getCSSVal(movable.style.left)}px`
        }

        //get existing insets and update them
        console.log(movable.style.top)
        movable.style.top = `${getCSSVal(movable.style.top) + e.movementY}px`
        console.log(movable.style.top)
        movable.style.bottom = `${getCSSVal(movable.style.bottom) - e.movementY}px`
        movable.style.left = `${getCSSVal(movable.style.left) + e.movementX}px`
        movable.style.right = `${getCSSVal(movable.style.right) - e.movementX}px`

        //update tooltip info
        movable.querySelector('.top-val').innerHTML = `${getCSSVal(movable.style.top)}`
        movable.querySelector('.right-val').innerHTML = `${getCSSVal(movable.style.right)}`
        movable.querySelector('.bottom-val').innerHTML = `${getCSSVal(movable.style.bottom)}`
        movable.querySelector('.left-val').innerHTML = `${getCSSVal(movable.style.left)}`
    }
}

//resize area functions
function resize(e) {
    currentArea = e.target.parentNode.parentNode

    let pic = currentArea.parentNode

    xOffset = e.clientX
    yOffset = e.clientY
    heightInit = currentArea.clientHeight
    widthInit = currentArea.clientWidth

    currentArea.classList.add('active');
    [...arList.children].forEach(node => {
        if (`area${node.id}` !== currentArea.id) {
            document.getElementById(node.id).classList.remove('yellowBG');
            document.getElementById(`area${node.id}`).classList.remove('active');
        } else {
            document.getElementById(node.id).classList.add('yellowBG');
        }
    })

    switch (e.target.className) {
        case 'up':
            pic.addEventListener('mousemove', resizeUp)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeUp)
            })
            break;
        case 'down':
            pic.addEventListener('mousemove', resizeDown)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeDown)
            })
            break;
        case 'left':
            pic.addEventListener('mousemove', resizeLeft)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeLeft)
            })
            break;
        case 'right':
            pic.addEventListener('mousemove', resizeRight)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeRight)
            })
            break;
        case 'up-right':
            pic.addEventListener('mousemove', resizeUp)
            pic.addEventListener('mousemove', resizeRight)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeUp)
                pic.removeEventListener('mousemove', resizeRight)
            })
            break;
        case 'up-left':
            pic.addEventListener('mousemove', resizeUp)
            pic.addEventListener('mousemove', resizeLeft)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeUp)
                pic.removeEventListener('mousemove', resizeLeft)
            })
            break;
        case 'down-right':
            pic.addEventListener('mousemove', resizeDown)
            pic.addEventListener('mousemove', resizeRight)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeDown)
                pic.removeEventListener('mousemove', resizeRight)
            })
            break;
        case 'down-left':
            pic.addEventListener('mousemove', resizeDown)
            pic.addEventListener('mousemove', resizeLeft)

            document.body.addEventListener('mouseup', function () {
                pic.removeEventListener('mousemove', resizeDown)
                pic.removeEventListener('mousemove', resizeLeft)
            })
            break;
        default:
            console.log(e.target.className)
            break;
    }
}

function resizeUp(e) {
    let areaSize = document.querySelector('.area.active').getBoundingClientRect()
    let picSize = main.getBoundingClientRect()

    console.log('%cRESIZE UP', 'color:orange');
    console.log(`
        new cursor Y: ${e.clientY}
        initial cursor Y: ${yOffset}
        height of current tree: ${currentArea.clientHeight}`)

    currentArea.style.height = `${-e.clientY + yOffset + heightInit}px`

    if (currentArea.style.bottom === 'unset') {
        currentArea.style.bottom = `${picSize.height - getCSSVal(currentArea.style.top) - areaSize.height}px`
    }
    currentArea.style.top = 'unset'

    //update tooltip text
    currentArea.querySelector('.top-val').innerHTML = `${getCSSVal(window.getComputedStyle(currentArea, null).getPropertyValue("top"))}`
    currentArea.querySelector('.H').innerHTML = `${getCSSVal(currentArea.style.height)}`
}

function resizeDown(e) {
    let areaSize = document.querySelector('.area.active').getBoundingClientRect()
    let picSize = main.getBoundingClientRect()

    console.log('%cRESIZE DOWN', 'color:orange');
    console.log(`
        new cursor Y: ${e.clientY}
        initial cursor Y: ${yOffset}
        height of current tree: ${currentArea.clientHeight}`)

    currentArea.style.height = `${e.clientY - yOffset + heightInit}px`

    if (currentArea.style.top === 'unset') {
        currentArea.style.top = `${picSize.height - getCSSVal(currentArea.style.bottom) - areaSize.height}px`
    }
    currentArea.style.bottom = 'unset'

    //update tooltip text
    currentArea.querySelector('.bottom-val').innerHTML = `${getCSSVal(window.getComputedStyle(currentArea, null).getPropertyValue("bottom"))}`
    currentArea.querySelector('.H').innerHTML = `${getCSSVal(currentArea.style.height)}`
}

function resizeLeft(e) {
    let areaSize = document.querySelector('.area.active').getBoundingClientRect()
    let picSize = main.getBoundingClientRect()

    console.log('%cRESIZE LEFT', 'color:orange');
    console.log(`
        new cursor X: ${e.clientX}
        initial cursor X: ${xOffset}
        width of current tree: ${currentArea.clientWidth}`)

    currentArea.style.width = `${-e.clientX + xOffset + widthInit}px`

    if (currentArea.style.right === 'unset') {
        currentArea.style.right = `${picSize.width - getCSSVal(currentArea.style.left) - areaSize.width}px`
    }
    currentArea.style.left = 'unset'

    //update tooltip text
    currentArea.querySelector('.left-val').innerHTML = `${getCSSVal(window.getComputedStyle(currentArea, null).getPropertyValue("left"))}`
    currentArea.querySelector('.W').innerHTML = `${getCSSVal(currentArea.style.width)}`
}

function resizeRight(e) {
    let areaSize = document.querySelector('.area.active').getBoundingClientRect()
    let picSize = main.getBoundingClientRect()

    console.log('%cRESIZE RIGHT', 'color:orange');
    console.log(`
        new cursor X: ${e.clientX}
        initial cursor X: ${xOffset}
        width of current tree: ${currentArea.clientWidth}`)

    currentArea.style.width = `${e.clientX - xOffset + widthInit}px`

    if (currentArea.style.left === 'unset') {
        currentArea.style.left = `${picSize.width - getCSSVal(currentArea.style.right) - areaSize.width}px`
    }
    currentArea.style.right = 'unset'

    //update tooltip text
    currentArea.querySelector('.right-val').innerHTML = `${getCSSVal(window.getComputedStyle(currentArea, null).getPropertyValue("right"))}`
    currentArea.querySelector('.W').innerHTML = `${getCSSVal(currentArea.style.width)}`
}