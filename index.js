const adBtn = document.querySelector('#footerAd');
const adBtns = document.querySelectorAll('.footerItm');
adBtn.addEventListener("click", (e) => {
    console.log("click");
    window.location.href = "gameOflife.html";
})

for(let btn of adBtns){
    btn.addEventListener("click", (e) => {
        console.log("click");
        window.location.href = "gameOflife.html";
    })
}