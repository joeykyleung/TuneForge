/*
  SET UP FOR DRAGGABLE NOTES
*/

var isMouseDown = false;
var isAddingNotes = false;

document.addEventListener('mousedown', () => isMouseDown = true);
document.addEventListener('mouseup', () => {
  isMouseDown = false;
  isAddingNotes = false;
});

/*
  SET UP MAKING NOTES
*/
// Map row numbers to piano notes
const rowNotes = {
  1: "C4",
  2: "D4",
  3: "E4",
  4: "F4",
  5: "G4",
  6: "A4",
  7: "B4",
};

const gridContainer = document.getElementById("grid-container");
const speedInput = document.getElementById("speed-input");

document.addEventListener("DOMContentLoaded", function () {
  // Create the grid
  for (let row = 1; row <= 7; row++) {
    for (let col = 0; col <= 16; col++) {
      if (col === 0) {
        const sideItem = document.createElement("div");
        sideItem.classList.add("side");
        sideItem.innerHTML = rowNotes[row];
        gridContainer.appendChild(sideItem);
        continue;
      }
      const gridItem = document.createElement("div");
      gridItem.classList.add("grid-item", "key", `row-${row}`);
      gridItem.setAttribute("data-row", row)
      gridItem.setAttribute("data-column", col); // Add a data attribute for the column

      addEventListeners(gridItem, row);

      gridContainer.appendChild(gridItem);
    }
  }
});

function addEventListeners(gridItem, row) {
  gridItem.addEventListener('mousedown', () => {
    isAddingNotes = true;
    if (!gridItem.classList.contains('clicked')) {
      gridItem.classList.add('clicked');
    } else {
      gridItem.classList.remove('clicked');
      isAddingNotes = false;
    }
  });
  gridItem.addEventListener('mouseup', () => {
    if(gridItem.classList.contains('clicked') && isAddingNotes === false) {
      gridItem.classList.remove('clicked');
    }
  });
  gridItem.addEventListener('mouseover', () => {
    console.log(`isMouseDown: ${isMouseDown}, isAddingNotes: ${isAddingNotes}`);
    if (isMouseDown && !gridItem.classList.contains('clicked')) {
      gridItem.classList.add('clicked');
      isAddingNotes = true;
      playSound(rowNotes[row]);
    }
  });
  gridItem.addEventListener('mouseout', () => {
    if (gridItem.classList.contains('clicked') && isMouseDown && !isAddingNotes) {
      gridItem.classList.remove('clicked')
    }
  });

}

/*
SET UP FOR PLAYING NOTES
*/
// Create the audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(note) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle"; // You can experiment with 'triangle' or 'square'
  oscillator.frequency.setValueAtTime(
    noteToFrequency(note),
    audioContext.currentTime
  );

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3); // Adjust duration as needed

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3); // Adjust duration as needed
}


// Helper function to convert note to frequency
function noteToFrequency(note) {
  const mapping = {
    "C4": 261.63,
    "D4": 293.66,
    "E4": 329.63,
    "F4": 349.23,
    "G4": 392,
    "A4": 440,
    "B4": 493.88,
  };
  return mapping[note];
}

var clickedNotes = Array.from({ length: 16 }, () => []);

// Play button event listener
const playButton = document.getElementById("play-button");
playButton.addEventListener("click", playSequence);

function getMood() {
  //send json (notes, speed) to backend
  getNotes();
  const data = {
    "notes": clickedNotes,
    "speed": parseFloat(speedInput.value),
  };

  console.log(data);
  fetch("/get_mood", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(json => {
    const mood = json["mood"];
    const shapes = document.getElementById("shape");
    const shape = shapes.querySelectorAll('span');
    shape.forEach(element => {
      console.log(element);
      if (mood === "sad") {
        element.style.background = "rgba(0, 105, 255, 0.1)";
      } else {
        element.style.background = "rgba(248, 214, 100, 0.1)";
      }
    });
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

function getNotes() {
  const clickedElements = document.getElementsByClassName("clicked");

  Array.from(clickedElements).forEach(element => {
    // Get the values of data-row and data-column attributes
    const row = element.getAttribute("data-row");
    const column = element.getAttribute("data-column");

    // Check if row and column are valid numbers
    if (!isNaN(row) && !isNaN(column)) {
      // Add the element to the corresponding position in clickedNotes
      freq = noteToFrequency(rowNotes[row]);
      clickedNotes[parseInt(column - 1, 10)].push(freq);
    }
  });
}

function playSequence() {
  getNotes();
  console.log(clickedNotes);
  getMood();
  const maxNotes = Math.max(...clickedNotes.map((column) => column.length));
  const sequenceDuration = 300 / speedInput.value; // Adjust the duration between columns

  for (let col = 0; col < clickedNotes.length; col++) {
    for (let noteIndex = 0; noteIndex < maxNotes; noteIndex++) {
      if (clickedNotes[col][noteIndex]) {
        const note = clickedNotes[col][noteIndex];
        const startTime =
          audioContext.currentTime + (col * sequenceDuration) / 1000;
        playSoundAtTime(note, startTime); // Pass speed value
      }
    }
  }
}

// Function to play sound at a specific time
function playSoundAtTime(note, startTime) {
  const duration = 0.3; // Default duration, you can adjust this if needed

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(note, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.7, startTime + 0.05);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/*
  FUNCTION FOR DOWNLOADING COMPILED NOTES
*/
const downloadButton = document.getElementById("download-button");
downloadButton.addEventListener("click", sendToBackend);

function sendToBackend() {
  //send json (notes, speed) to backend
  getNotes();
  const data = {
    "notes": clickedNotes,
    "speed": parseFloat(speedInput.value),
    "instrument": instrumentNum,
  };

  console.log(data);
  fetch("/download", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'outfile.wav'; // Specify the filename

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

/*
  FUNCTION FOR CLEARING NOTES
*/
const clearButton = document.getElementById("clear-button");
clearButton.addEventListener('click', () => {
  const gridItems = gridContainer.querySelectorAll('.grid-item');
  gridItems.forEach(item => {
    item.classList.remove('clicked');
  });
  clickedNotes = Array.from({ length: 16 }, () => []);
});

/*
  FUNCTION FOR DROPDOWN
*/
const instrumentMap = {
  1: "Acoustic Grand Piano",
  9: "Celesta",
  20: "Church Organ",
  25: "Nylon Acoustic Guitar",
  34: "Electric Bass (finger)",
  41: "Violin",
  49: "String Ensemble 1",
  57: "Trumpet",
  66: "Alto Sax",
  74: "Flute",
  81: "Square Lead",
  91: "Pad 3 (polysynth)",
  101: "FX 5 (brightness)",
  105: "Sitar",
  113: "Tinkle Bell",
  121: "Guitar Fret Noise"
};

const dropdown = document.getElementById("dropdown");
const instrumentButton = document.getElementById("instrumentButton");
var instrumentNum = 1;

// Iterate over the instrumentMap
for (const [programNumber, instrumentName] of Object.entries(instrumentMap)) {
  // Create a new list item
  const listItem = document.createElement("li");
  // Set its text content to the instrument name
  listItem.textContent = instrumentName;
  listItem.classList.add('dropdown-item');

  listItem.addEventListener('click', () => {
    instrumentButton.innerHTML = instrumentName;
    instrumentNum = programNumber;
  });

  // Append the list item to the dropdown
  dropdown.appendChild(listItem);
}
