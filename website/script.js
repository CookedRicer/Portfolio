let unitLength = 2; //1.4 for pkm
let currentPtn = JSON.parse(JSON.stringify(ptnBeetles));
let ptnIdx = 0;

let isZip = false;
let drawColorSet = colorSetDefault;
let brushSize = 2;

const strokeColor = 'rgba(64,64,64,0.05)';
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let canvasWidth = 252;
let canvasHeight = 168;
let imgBox = document.querySelector(".previewImg");
//Game Rules Var
let ruleLoneliness = 2;
let ruleOverpop = 3;
let ruleReproduction = 3;
//Draw/Erase mode
let isDrawMode = true;
//Dark Mode
let isDarkMode = false;
//Game Setting Btn Var
let brushSizeRange = document.querySelector('#brushSize');
let brushSizeBox = document.querySelector('.brushDot');
let zipBtn = document.querySelector('#zipBtn');
let baseContainer = document.querySelector('#baseOpt')
let clearBtn = document.querySelector(`#btnClear`);
let startBtn = document.querySelector(`#btnStart`)
let rangeObj = document.querySelector('#rangeObj');
let drawToggle = document.querySelectorAll(".drawToggle")
let resOpt = document.querySelectorAll('.optBtn');
let themeOpt = document.querySelectorAll('.colorBtn')
let frameRange = document.querySelector('#frameRange');
let btnA = document.querySelector('#btnA')
let setFrameRate = 20;
let patternLoaded = false;
let clrIdx = 0;
let swiClrBtnL = document.querySelector(".switchColorL");
let swiClrBtnR = document.querySelector(".switchColorR");
let clrTxtBlock = document.querySelector(".txtColor");
let clrBoxes = document.querySelectorAll(".colBox");

function setup() {
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector("#canvas"));
  /*Calculate the number of columns and rows */
  columns = floor(canvasWidth / unitLength);
  rows = floor(canvasHeight / unitLength);
  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }
  // Now both currentBoard and nextBoard are array of array of undefined values.
  randomGen();
}

function draw() {
  frameRate(setFrameRate);
  background(255);
  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      let lifeColor = Math.ceil(Math.min(currentBoard[i][j], 10) / 2);
      if (currentBoard[i][j] == 0) {
        fill(drawColorSet[0]);
      } else {
        let randomRange = 1 + ((Math.random() - Math.random()) * 0.5);
        fill(drawColorSet[lifeColor][0] * randomRange, drawColorSet[lifeColor][1] * randomRange, drawColorSet[lifeColor][2] * randomRange)
      }

      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

/**
* Initialize/reset the board state
*/
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
    }
  }
}

function randomGen() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // Lining the edges with 0s
      if (i == 0 || j == 0 || i == columns - 1 || j == rows - 1) currentBoard[i][j] = 0;
      // Filling the rest randomly
      else currentBoard[i][j] = floor(random(2));
      nextBoard[i][j] = 0;
    }
  }
}

function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          let neighborsVar;
          if (currentBoard[(x + i + columns) % columns][(y + j + rows) % rows] > 0) {
            neighborsVar = 1;
          } else {
            neighborsVar = 0
          }
          neighbors += neighborsVar;
        }
      }

      // Rules of Life
      if (currentBoard[x][y] >= 1 && neighbors < ruleLoneliness) {
        // Die of Loneliness
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] >= 1 && neighbors > ruleOverpop) {
        // Die of Overpopulation
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 0 && neighbors == ruleReproduction) {
        // New life due to Reproduction
        nextBoard[x][y] = 1;
      } else if (currentBoard[x][y] >= 1 && nextBoard[x][y] >= 1) {
        nextBoard[x][y] += 1;
      } else {
        // Stasis
        nextBoard[x][y] = currentBoard[x][y];
      }
    }
  }
  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

/*Mouse dragged*/
function mouseDragged() {
  /* If the mouse coordinate is outside the board*/
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);

  let brhScale = Math.floor(brushSize / 2);
  for (let i = x - brhScale; i < x + brhScale; i++) {
    for (let j = y - brhScale; j < y + brhScale; j++) {
      currentBoard[i][j] = Number(isDrawMode);
      fill(drawColorSet[currentBoard[i][j]]);
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

/**
 * When mouse is pressed
 */
function mousePressed() {
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  noLoop();
  mouseDragged();
}

/*When mouse is released*/
function mouseReleased() {
  //if want to continue after drag
  //loop();
}

/*Buttons Setup*/
window.onload = function () {
  window.addEventListener("resize", (e) => { init() });
  startBtn.addEventListener("click", (e) => (loop()));
  btnClear.addEventListener("click", (e) => (init(), loop()));
  for (let btn of drawToggle) {
    btn.addEventListener("click", (e) => {
      for (let itm of drawToggle) {
        itm.classList.remove('active');
      }
      btn.classList.add('active');
      isDrawMode = btn.getAttribute('value');
    })
  }

  for (let btns of resOpt) {
    btns.addEventListener('click', (e) => {
      for (let itm of resOpt) {
        itm.classList.remove("active");
      }
      e.target.classList.add("active");
      unitLength = Number(btns.getAttribute('value'));
      setup();
      loop();
    })
  }

  frameRange.addEventListener("input", (e) => {
    setFrameRate = frameRange.value;
    document.querySelector('#rangeLabel').innerHTML = `已選擇 ${setFrameRate}Hz`
    frameRate(Number(setFrameRate));
  })

  //Theme color btns
  for (let btns of themeOpt) {
    btns.addEventListener("click", (e) => {
      let theme = btns.getAttribute('value');
      console.log({ theme })
      changeTheme(theme);
    })
  }

  btnA.addEventListener("click", (e) => {
    printPtn(currentPtn);
  })

  brushSizeRange.addEventListener("input", (e) => {
    brushSize = brushSizeRange.value;
    brushSizeBox.style.width = `${brushSize * 3}px`;
    brushSizeBox.style.height = `${brushSize * 3}px`;
  })

  zipBtn.addEventListener('click', (e) => {
    if (isZip) {
      baseContainer.classList.remove('hideThis');
      zipBtn.innerHTML = `<i class="bi bi-caret-up-fill"></i>`
    } else {
      baseContainer.classList.add('hideThis');
      zipBtn.innerHTML = `<i class="bi bi-caret-down-fill"></i> `
    }
    isZip = !isZip;
  })

  swiClrBtnL.addEventListener('click', (e) => {
    colorSwitch(-1);
  })
  swiClrBtnR.addEventListener('click', (e) => {
    colorSwitch(1);
  })

  //Keyboard event listener
  document.addEventListener("keydown", (e) => {
    let codePressed = e.code;
    let keyPressed = e.key;
    switch (codePressed) {
      case 'KeyA':
        printPtn(currentPtn);
        break;
      case 'KeyS':
        startBtn.click();
        break;
      case 'KeyC':
        clearBtn.click();
        break;
      case 'KeyD':
        darkModeSwitch();
        break;
      case 'ArrowLeft':
        patternSwitch(-1);
        break;
      case 'ArrowRight':
        patternSwitch(1);
        break;
      default:
        console.log({ codePressed, keyPressed, msg: "is not set." })
    }
  })
}

function colorSwitch(val) {
  clrIdx += val;
  if (clrIdx >= colorSetList.length) {
    clrIdx = 0;
  }
  drawColorSet = colorSetList[clrIdx][0];
  clrTxtBlock.innerHTML = colorSetList[clrIdx][1];
  let idx = 0;
  for (let box of clrBoxes) {
    console.log(box)
    box.setAttribute('style', `background-color:rgb(${drawColorSet[idx + 1]})`)
    idx++;
  }
}

function patternSwitch(val) {
  ptnIdx += val;
  if (ptnIdx >= ptnList.length) {
    ptnIdx = 0;
  }
  currentPtn = ptnList[ptnIdx];
  imgBox.setAttribute("src", currentPtn["preview"])
}

//OLD method
/*Load Screen-size-pattern */
//Now only for the pokemon pattern
function loadPtnPkm() {
  currentBoard = JSON.parse(JSON.stringify(ptnPkm));
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      let lifeColor = currentBoard[i][j];
      fill(colorSetPkm[lifeColor])
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

//NEW method
//Print pttn at mouse position
function printPtn(patternObj) {
  //ret if mouse not in canvas
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  //assign print position 
  let loadPattern = JSON.parse(JSON.stringify(patternObj))
  let ptnWidth = loadPattern["width"];
  let ptnHeight = loadPattern["height"];
  let posiX = Math.floor(mouseX / unitLength);
  let posiY = Math.floor(mouseY / unitLength);
  let printCounter = 0;
  for (let i = posiX; i < posiX + ptnWidth; i++) {
    let printCounter = i - posiX;
    for (let j = posiY; j < posiY + ptnHeight; j++) {
      if (loadPattern["data"][printCounter]) {
        currentBoard[i][j] = loadPattern["data"][printCounter]
      };
      printCounter += ptnWidth;
      if (loadPattern["data"][printCounter]) {
        fill(drawColorSet[currentBoard[i][j]])
      };
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

function darkModeSwitch() {
  if (!isDarkMode) {
    document.querySelector("body").classList.add("active");
  } else {
    document.querySelector("body").classList.remove("active");
  }
  isDarkMode = !isDarkMode;
}

function changeTheme(myTheme) {
  for (let itm of Object.keys(themeList[myTheme])) {
    cssRoot.style.setProperty(itm, themeList[myTheme][itm]);
  }
}

//get css root var
let cssRoot = document.querySelector(':root');

//FN: Gameboy Theme Change 
let themeList = {
  'themeYellow': {
    "--gb-theme-body": "#FFD428",
    "--gb-theme-side-1": "#FFD91D",
    "--gb-theme-side-2": "#FFBF1D",
    "--gb-theme-side-3": "#FFCF28",
    "--gb-theme-side-4": "#FFE57D",
    "--gb-theme-light": "#FFEEA3",
    "--gb-theme-shadow": "#FFAB61",
    "--gb-spkr-dark": "#FF8D29",
    "--gb-txt-shahow": "rgba(0, 0, 0, 0.3)",
    "--gb-grey-0": "#AAA",
    "--gb-grey-1": "#888",
    "--gb-grey-2": "#444",
    "--gb-grey-3": "#383838",
    "--gb-grey-4": "#353535",
    "--spkr-shadow": "rgba(64, 64, 64, 0.5)"
  },

  'themeGreen': {
    "--gb-theme-body": "#00d289",
    "--gb-theme-side-1": "#40de9d",
    "--gb-theme-side-2": "#19964f",
    "--gb-theme-side-3": "#23703c",
    "--gb-theme-side-4": "#6af2aa",
    "--gb-theme-light": "hsl(145, 83%, 62%)",
    "--gb-theme-shadow": "#4ac79357",
    "--gb-spkr-dark": "#47ca8d",
    "--gb-txt-shahow": "rgba(0, 0, 0, 0.3)",
    "--gb-grey-0": "#AAA",
    "--gb-grey-1": "#888",
    "--gb-grey-2": "#444",
    "--gb-grey-3": "#383838",
    "--gb-grey-4": "#353535",
    "--spkr-shadow": "rgba(16, 16, 16, 0.5)"
  },

  'themeBlue': {
    "--gb-theme-body": "#04bbc8",
    "--gb-theme-side-1": "#40ccde",
    "--gb-theme-side-2": "#248c9a",
    "--gb-theme-side-3": "#49b9b9",
    "--gb-theme-side-4": "#75dff5",
    "--gb-theme-light": "#8ce5f3",
    "--gb-theme-shadow": "#297276",
    "--gb-spkr-dark": "#1c8597",
    "--gb-txt-shahow": "rgba(0, 0, 0, 0.3)",
    "--gb-grey-0": "#AAA",
    "--gb-grey-1": "#888",
    "--gb-grey-2": "#444",
    "--gb-grey-3": "#383838",
    "--gb-grey-4": "#353535",
    "--spkr-shadow": "rgba(16, 16, 16, 0.5)"
  }
}
