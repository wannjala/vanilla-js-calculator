(function () {
  let screen = document.querySelector(".display-screen");
  let buttons = document.querySelectorAll(".button");
  let clear = document.getElementById("button-C");
  let equal = document.getElementById("eq-button");
  let del = document.getElementById("del-button");
  let placeholder = document.querySelector(".placeholder");

  // Initialize the display
  screen.value = "0";
  let isNewNumber = true;
  const MAX_DISPLAY_LENGTH = 15; // Maximum number of characters on the display

  // Keyboard mapping object
  const keyboardMap = {
    0: "button-0",
    1: "button-1",
    2: "button-2",
    3: "button-3",
    4: "button-4",
    5: "button-5",
    6: "button-6",
    7: "button-7",
    8: "button-8",
    9: "button-9",
    ".": "dec-button",
    "+": "add-button",
    "-": "sub-button",
    "*": "mult-button",
    "/": "div-button",
    Enter: "eq-button",
    "=": "eq-button",
    Backspace: "del-button",
    Delete: "del-button",
    Escape: "button-C",
    c: "button-C",
    C: "button-C",
  };

  // Function to simulate button click
  function simulateButtonClick(buttonID) {
    const button = document.getElementById(buttonID);
    if (button) {
      button.click();
      // Add visual feedback to the button press
      button.classList.add("active");
      setTimeout(() => {
        button.classList.remove("active");
      }, 100);
    }
  }

  // Keyboard event handler
  function handleKeyboardInput(event) {
    // Prevent default behavior for keyboard events
    if (Object.keys(keyboardMap).includes(event.key)) {
      event.preventDefault();
    }

    // Handle numeric keypad input
    let key = event.key;
    if (event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
      // Convert NumPad decimal key to regular decimal key
      if (key === "Decimal") {
        key = ".";
      }
      // Convert NumPad Enter key to regular Enter key
      if (key === "Enter") {
        key = "Enter";
      }
    }

    const buttonID = keyboardMap[key];
    if (buttonID) {
      simulateButtonClick(buttonID);
    }
  }

  // Add keyboard event listener
  document.addEventListener("keydown", handleKeyboardInput);

  // Function to update placeholder visibility
  function updatePlaceholder() {
    if (screen.value === "0" && isNewNumber) {
      placeholder.classList.remove("hidden");
    } else {
      placeholder.classList.add("hidden");
    }
  }

  // function to check for invalid leading zeros
  function hasInvalidLeadingZero(value) {
    // Check for patterns like "00", "01", "000", "02", etc.
    return /^0\d+/.test(value);
  }

  // function to check for multiple decimal points in a number
  function hasMultipleDecimals(value) {
    let numbers = value.split(/[-+/*]/);
    return numbers.some((num) => (num.match(/\./g) || []).length > 1);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      let value = e.target.dataset.value;

      // Only handle numeric and operator inputs
      if (
        value !== undefined &&
        value !== "=" &&
        value !== "C" &&
        value !== "D"
      ) {
        // Check if the display is at max length
        if (screen.value.length >= MAX_DISPLAY_LENGTH) {
          return; // Don't add any more characters if at max length
        }
        // If it's a new number and not an operator, clear the display first
        if (isNewNumber && !isNaN(value)) {
          screen.value = value;
          isNewNumber = false;
        } else if (isNewNumber && isNaN(value)) {
          // If it's an operator and we're starting fresh, keep the previous result
          isNewNumber = false;
          screen.value += value;
        } else {
          // Check for decimal point
          if (value === ".") {
            // Get the current number being typed
            let currentNumber = screen.value.split(/[-+/*]/).pop();
            if (currentNumber.includes(".")) {
              return; // Don't add another decimal point
            }
          }
          screen.value += value;
        }
        updatePlaceholder();
      }
    });
  });

  clear.addEventListener("click", function (e) {
    screen.value = "0";
    isNewNumber = true;
    updatePlaceholder();
  });

  equal.addEventListener("click", function (e) {
    if (screen.value.trim() === "" || screen.value === "0") {
      screen.value = "0";
    } else {
      try {
        // Check for invalid leading zeros
        if (hasInvalidLeadingZero(screen.value)) {
          screen.value = "Syntax Error";
          isNewNumber = true;
          updatePlaceholder();
          return;
        }

        // Check for multiple decimal points in a number
        if (hasMultipleDecimals(screen.value)) {
          screen.value = "Syntax Error";
          isNewNumber = true;
          updatePlaceholder();
          return;
        }

        // Sanitize the input - only allow numbers and basic operators
        let sanitizedValue = screen.value.replace(/[^-()\d/*+.]/g, "");

        // Additional validation to prevent eval() abuse
        if (!/^[-\d/*+.()]+$/.test(sanitizedValue)) {
          throw new Error("Invalid characters");
        }

        let result = eval(sanitizedValue);

        // Handle division by zero and invalid operations
        if (!isFinite(result)) {
          screen.value = "Infinity";
        } else {
          // Round to 8 decimal places to prevent floating point issues
          result = parseFloat(result.toFixed(8));
          // Check if the result exceeds the display length
          if (result.toString().length > MAX_DISPLAY_LENGTH) {
            screen.value = "Error: Result too long";
          } else {
            screen.value = result;
          }
        }
        isNewNumber = true;
        updatePlaceholder();
      } catch (error) {
        screen.value = "Syntax Error";
        isNewNumber = true;
        updatePlaceholder();
      }
    }
  });

  del.addEventListener("click", function (e) {
    if (
      screen.value === "0" ||
      screen.value === "Error" ||
      screen.value.length === 1
    ) {
      screen.value = "0";
      isNewNumber = true;
    } else {
      screen.value = screen.value.toString().slice(0, -1);
    }
    updatePlaceholder();
  });
  // Update placeholder visibility
  updatePlaceholder();
})();
