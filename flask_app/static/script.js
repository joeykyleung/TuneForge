document.addEventListener("DOMContentLoaded", function () {
  const gridContainer = document.getElementById("grid-container");
  const speedInput = document.getElementById("speed-input");

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

  // Arrays to store clicked notes for each column
  // const clickedNotes = Array.from({ length: 16 }, () => []);

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
      gridItem.classList.add("grid-item", `row-${row}`);
      gridItem.setAttribute("data-row", row)
      gridItem.setAttribute("data-column", col); // Add a data attribute for the column
      gridItem.addEventListener("click", function () {
        toggleColorAndSound(gridItem, row);
      });
      gridContainer.appendChild(gridItem);
    }
  }

  // Toggle color on click and play sound
  function toggleColorAndSound(item, row) {
    const isClicked = item.classList.contains("clicked");
    // const columnIndex = parseInt(item.getAttribute("data-column"), 10) - 1;

    // if (!clickedNotes[columnIndex]) {
    //   clickedNotes[columnIndex] = [];
    // }

    if (!isClicked) {
      item.classList.add("clicked");
      playSound(rowNotes[row]);
      // Add the clicked note to the corresponding column in clickedNotes
      // clickedNotes[columnIndex].push(noteToFrequency(rowNotes[row]));
    } else {
      item.classList.remove("clicked");
      // Remove the clicked note from the corresponding column in clickedNotes
      // const noteIndex = clickedNotes[columnIndex].indexOf(rowNotes[row]);
      // if (noteIndex !== -1) {
      //   clickedNotes[columnIndex].splice(noteIndex, 1);
      // }
    }
  }

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

  // Play button event listener
  const playButton = document.getElementById("play-button");
  playButton.addEventListener("click", playSequence);

  function getNotes() {
    const clickedNotes = Array.from({ length: 16 }, () => []);
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
    return clickedNotes;
  }

  function playSequence() {
    clickedNotes = getNotes();
    console.log(clickedNotes);
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

    //send json (notes, speed) to backend
    const data = {
      "notes": clickedNotes,
      "speed": parseFloat(speedInput.value),
    };
    fetch("/jsonmidi", {
      method: "POST",
      body: data,
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then(response => response.json())
    .catch(error => console.log(error));

    //get callback link for midi file
    //play midi file
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
});
