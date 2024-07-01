// ==UserScript==
// @name         Trengo helper
// @namespace    http://tampermonkey.net/
// @version      2024-04-08
// @description  try to take over the world!
// @author       You
// @match        https://app.trengo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=trengo.com
// @updateURL    https://raw.githubusercontent.com/jesuskostov/trengo-helper/main/trengo-helper.user.js
// @downloadURL  https://raw.githubusercontent.com/jesuskostov/trengo-helper/main/trengo-helper.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const scriptUrl = 'https://raw.githubusercontent.com/jesuskostov/trengo-helper/main/trengo-helper.user.js';
    const version = '2024-07-01'; // Current version of your script

    function checkForUpdates() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: scriptUrl + '?_=' + new Date().getTime(), // Prevent caching
            onload: function(response) {
                if (response.status === 200) {
                    const remoteVersion = response.responseText.match(/@version\s+(\d+-\d+-\d+)/)[1];
                    if (remoteVersion && remoteVersion !== version) {
                        if (confirm(`A new version (${remoteVersion}) is available. Do you want to update?`)) {
                            GM_setValue('script_update', response.responseText);
                            location.reload();
                        }
                    } else {
                        alert('No updates available.');
                    }
                } else {
                    alert('Failed to check for updates.');
                }
            }
        });
    }

    function applyUpdate() {
        const newScript = GM_getValue('script_update', null);
        if (newScript) {
            GM_setValue('script_update', null);
            eval(newScript); // Evaluate and replace the current script with the new one
        }
    }

    function addUpdateButton() {
        const button = document.createElement('button');
        button.textContent = 'Check for Updates';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '1000';
        button.style.padding = '0.8rem';
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.fontSize = '1rem';
        button.style.transition = '200ms';

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#0056b3';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007bff';
        });

        button.addEventListener('click', checkForUpdates);

        document.body.appendChild(button);
    }

    applyUpdate();
    addUpdateButton();

    // Your script code here
    function simulateEvent(element, eventType) {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
    }

    function clickButton(selector) {
        const button = document.querySelector(selector);
        if (button) button.click();
    }

    function setTextInputValue(selector, value, pressEnter = false) {
        const input = document.querySelector(selector);
        if (input) {
            console.log(pressEnter)
            input.value = value;
            ['keydown', 'keypress', 'keyup', 'input'].forEach(eventType => simulateEvent(input, eventType));
        }
    }

    function pasteClipboardContent(selector) {
        navigator.clipboard.readText().then(text => {
            setTextInputValue(selector, text);
        }).catch(error => {
            console.error('Could not paste text from clipboard:', error);
        });
    }

    function removeText(selector, regex) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerText = element.innerText.replace(regex, '');
        }
    }

    async function pasteFromClipboardAndType(selector, callback) {
        try {
            const text = await navigator.clipboard.readText(); // Read text from clipboard
            const inputElement = document.querySelector(selector);
            if (!inputElement) return; // Exit if the element is not found

            inputElement.focus(); // Focus the input element
            inputElement.value = text; // Paste the clipboard content

            // Dispatch an 'input' event to ensure the input's event listeners are triggered
            const inputEvent = new Event('input', { bubbles: true });
            inputElement.dispatchEvent(inputEvent);

            // Dispatch a 'blur' event to mimic user moving away from the input
            const blurEvent = new Event('blur', { bubbles: true });
            inputElement.dispatchEvent(blurEvent);

            // Optionally, simulate pressing Enter
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true,
            });
            inputElement.dispatchEvent(enterEvent);

            if (typeof callback === "function") {
                callback(); // Execute callback after pasting text and pressing Enter
            }
        } catch (error) {
            console.error('Failed to read from clipboard:', error);
        }
    }

    function automateActions(portalName) {
        clickButton('a[data-test="main-navigation-inbox"]');
        clickButton('button[data-test="start-conversation-button"]');
        setTimeout(() => {
            clickButton('span[data-test="composer-from-channel-dropdown-toggle"]');
            setTimeout(() => {
                setTextInputValue('input[data-test="composer-select-channel-search-input"]', portalName);

                setTimeout(() => {
                    clickButton('li[data-test="composer-from-channel-dropdown-list-item"]');

                    clickButton('.material-icons.selector-conversation-quick-reply.cursor-pointer.text-grey-600');
                    setTimeout(() => {
                        setTextInputValue('.search-bar input', 'Vio vi');
                        setTimeout(() => {
                            clickButton('li[data-test="dropdown-list-item"]');
                            removeText('#isPasted', /Invio Visura\s*\n/);
                            setTextInputValue('#InputEmailSubject', 'Invio Visura', true);
                            setTimeout(() => {
                                clickButton('li[data-test="composer-to-recipient-dropdown-list-item"]');
                                pasteFromClipboardAndType('input[data-test="composer-to-recipient-remote-search-input"]', () => {
                                    console.log('Pasted from clipboard, blurred, and pressed Enter');
                                });
                            }, 1000);
                            pasteClipboardContent('input[data-test="composer-to-recipient-remote-search-input"]');

                            setTimeout(() => {
                                document.querySelector('.material-icons.mb-0.mt-2.cursor-pointer.text-grey-600').click()
                            }, 1500)

                        }, 500);
                    }, 500);

                }, 200)

            }, 200)
        }, 150);
    }

    function createActionButton() {
        // Array of portal names
        const portals = ["Dolcumento", "Visurita", "Prontovisure", "Web-aiuto", "Doculampo", "Prestovisure", "Amministraiuto"];
        // Array of colors for the buttons
        const colors = ["#b43efd", "#3a66ff", "#8bc34a", "#f44336", "#ffc10a", "#ffacac", "#06a9f4"];

        // Iterate over each portal name
        portals.forEach((portal, index) => {
            let button = document.createElement('button');
            button.innerHTML = portal; // Set button text to the portal name
            Object.assign(button.style, {
                position: 'fixed', bottom: `calc(${index * 60 }px + 15%)`, left: '-20px', zIndex: '1000',
                padding: '0.8rem 0.8rem 0.8rem 2rem', margin: '5px', backgroundColor: colors[index % colors.length], // Use a color from the array
                color: 'white', border: 'none', borderTopRightRadius: '50px', borderBottomRightRadius: '50px', cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                transition: '200ms'
            });

            // Define the hover style changes
            const hoverStyles = {
                left: '-10px', // Example: Adjust to a darker shade or any color
            };

            // Apply hover effect
            button.addEventListener('mouseenter', () => {
                Object.assign(button.style, hoverStyles);
            });

            // Revert to original styles on mouse leave
            button.addEventListener('mouseleave', () => {
                Object.assign(button.style, {
                    left: '-20px'
                    // Revert any other changed styles here
                });
            });

            // Add event listener for each button to call automateActions with the portal name
            button.addEventListener('click', () => automateActions(portal));

            // Append the button to the document body
            document.body.appendChild(button);
        });
    }

    createActionButton();
})();
