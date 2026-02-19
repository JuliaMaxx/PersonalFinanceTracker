const timepickerInput = document.getElementById('timepickerInput');
const timeInput = document.getElementById('timeInput');
const timepickerImg = document.getElementById('timepickerImg');
const timepicker = document.getElementById("timepicker");
const hoursContainer = document.getElementById('hours');
const minutesContainer = document.getElementById('minutes');
const amPmContainer = document.getElementById('amPm');
const am = document.getElementById('amOption');
const pm = document.getElementById('pmOption');

let h = "", m = "", amPm = "", formattedT = "";
let hour = "", minute = "", selectedPeriod = "";
const ITEM_HEIGHT = '2.1rem';
hasTimeBeenSelected = false;

timepickerInput.addEventListener('input', timeFormatter);
timepickerImg.addEventListener('click', openTimepicker);

am.addEventListener('click', () => {
    selectedPeriod = 'AM';
    updateAMPM();
});
pm.addEventListener('click', () => {
    selectedPeriod = 'PM';
    updateAMPM();
});
window.addEventListener('click', windowClick);
window.addEventListener('keypress', windowClick);

function windowClick(event) {
    if (!timepicker.contains(event.target)) {
        timepicker.classList.remove("expanded");
    }
}

function timeFormatter(event){
    let raw = event.target.value;
    if (raw.length <= 5){
        raw = raw.replace(/\D/g, "");
    }
    h = "";
    m = "";
    amPm = "";
    formattedT = "";

    switch (raw.length){
        case 1:
            if (raw >= 2) {
                h = `0${raw}`;
            } else if( raw >= 0 ) {
                h = raw;
            }
            break;
        case 2:
            if ((raw[0] == 1 && raw[1] <= 2) || (raw[0] == 0 && raw[1] >= 1)) {
                h = raw;
            }
            break;
        case 3:
            if (raw[2] >= 6) {
                m = `0${raw[2]}`;
            } else if(raw[2] < 6 && raw[2] >= 0) {
                m = raw[2]
            }
            if (raw[0] && raw[1]) h = `${raw[0]}${raw[1]}`;
            break;
        case 4:
            m = `${raw[2]}${raw[3]}`
            if (raw[0] && raw[1]) h = `${raw[0]}${raw[1]}`;
            break;
        default:
            if (raw[0] && raw[1]) h = `${raw[0]}${raw[1]}`;
            if (raw[3] && raw[4]) m = `${raw[3]}${raw[4]}`;
            if (/[a1]/i.test(raw.slice(6))){
                amPm = "AM";
            }if (/[p2]/i.test(raw.slice(6))){
                amPm = "PM";
            }
            break;
    }

    formattedT = 
    (h && m && amPm)? `${h}:${m} ${amPm}`:
    (h && m && m.length==1)? `${h}:${m}`:
    (h && m)? `${h}:${m} `:
    (h && h <= 1)? `${h}`:
    (h)? `${h}:`: '';

    event.target.value = formattedT;
    if (/^\d{2}\:\d{2} (AM|PM)$/.test(formattedT)){
        djangoFormated = formatAmPmToDjangoTime(formattedT);
        timeInput.value = djangoFormated;
    }
}

function formatAmPmToDjangoTime(timeStr) {
    timeStr = timeStr.trim().toUpperCase();
  
    const date = new Date(`1970-01-01 ${timeStr}`);

    if (isNaN(date.getTime())) {
      console.warn("Invalid time:", timeStr);
      return null;
    }
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${hours}:${minutes}`; 
}

function openTimepicker(event){
    event.stopPropagation();
    timepicker.classList.toggle("expanded");
    renderTime()
}

function renderTime() {
    if (!hasTimeBeenSelected) {
        hoursContainer.innerHTML = '';
        minutesContainer.innerHTML = '';
        for (i = 1; i <= 12; i++){
            const child = `<div>${i < 10 ? '0' + i : i}</div>`;
            hoursContainer.innerHTML += child;
        }
        for (i = 0; i <= 59; i++){
            const child = `<div>${i < 10 ? '0' + i : i}</div>`;
            minutesContainer.innerHTML += child;
        }
        scrollToInitialTime();
        setInitialAMPM();
    }
}

function updateTime() {
    hour = hoursContainer.getElementsByClassName("selected")[0]?.textContent || "00";
    minute = minutesContainer.getElementsByClassName("selected")[0]?.textContent || "00";
    time = `${hour}:${minute} ${selectedPeriod}`;
    timepickerInput.value = time;
    timeInput.value = formatAmPmToDjangoTime(time)
}

function getClosestElement(container) {
    const children = Array.from(container.children);
    const containerMiddle = container.getBoundingClientRect().top + container.offsetHeight / 2;
    let closest = null;
    let minDistance = Infinity;
  
    children.forEach(child => {
      const childMiddle = child.getBoundingClientRect().top + child.offsetHeight / 2;
      const distance = Math.abs(containerMiddle - childMiddle);
      if (distance < minDistance) {
        minDistance = distance;
        closest = child;
      }
    });
  
    children.forEach(c => c.classList.remove('selected'));
    if (closest) closest.classList.add('selected');

    hasTimeBeenSelected = true;
    updateTime();

    return closest?.textContent;
  }
  
  hoursContainer.addEventListener("scroll", () => {
    clearTimeout(hoursContainer._scrollTimeout);
    hoursContainer._scrollTimeout = setTimeout(() => {
      getClosestElement(hoursContainer);
    }, 100);
  });
  
  minutesContainer.addEventListener("scroll", () => {
    clearTimeout(minutesContainer._scrollTimeout);
    minutesContainer._scrollTimeout = setTimeout(() => {
      getClosestElement(minutesContainer);
    }, 100);
  });

function scrollToInitialTime() {
    const now = new Date();
    const currentHour = now.getHours() % 12 || 12;
    const currentMinute = now.getMinutes();

    scrollToValue(hoursContainer, currentHour);
    scrollToValue(minutesContainer, currentMinute);
}

function scrollToValue(container, value) {
    const formatted = value < 10 ? '0' + value : '' + value;
    const children = Array.from(container.children);
    
    // Find the <div> with the matching value
    const match = children.find(child => child.textContent === formatted);

    if (match) {
        match.scrollIntoView({ behavior: 'auto', block: 'center' });
        children.forEach(c => c.classList.remove('selected'));
        match.classList.add('selected');
        updateTime();
    }
}

function setInitialAMPM() {
    const now = new Date();
    const period = now.getHours() >= 12 ? 'PM' : 'AM';
    selectedPeriod = period;
    updateAMPM();
}

function updateAMPM() {
    if (selectedPeriod == 'AM'){
        am.classList.add("selected");
        pm.classList.remove("selected");
    } else {
        pm.classList.add("selected");
        am.classList.remove("selected");
    }
    updateTime();
}

function enableClickSelection(container) {
  container.addEventListener('click', (e) => {
    const item = e.target.closest('div');
    if (!item || !container.contains(item)) return;

    item.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // optional: update immediately (without waiting for scroll end)
    setTimeout(() => getClosestElement(container), 150);
  });
}

enableClickSelection(hoursContainer);
enableClickSelection(minutesContainer);