// Import BellaAI core module
import { BellaAI } from './core.js';
import { ChatInterface } from './chatInterface.js';

document.addEventListener('DOMContentLoaded', async function() {
    // --- Get all necessary DOM elements first ---
    const transcriptDiv = document.getElementById('transcript');
    const loadingScreen = document.getElementById('loading-screen');
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const micButton = document.getElementById('mic-button');


    // --- AI Core Initialization ---
    let bellaAI;
    let chatInterface;
    
    // First initialize chat interface (doesn't depend on AI)
    try {
        chatInterface = new ChatInterface();
        console.log('Chat interface initialized successfully');
        console.log('ChatInterface instance created:', chatInterface);
        console.log('Chat container element:', chatInterface.chatContainer);
        console.log('Chat container in DOM:', document.body.contains(chatInterface.chatContainer));
        
        // Auto show chat interface (for debugging)
        setTimeout(() => {
            console.log('Attempting to auto show chat interface...');
            chatInterface.show();
            console.log('Chat interface auto shown');
            console.log('Chat interface visibility:', chatInterface.getVisibility());
            console.log('Chat container class name:', chatInterface.chatContainer.className);
        }, 2000);
    } catch (error) {
        console.error('Chat interface initialization failed:', error);
    }
    
    // Then try to initialize AI core
    micButton.disabled = true;
    transcriptDiv.textContent = 'Awakening Bella\'s core...';
    try {
        bellaAI = await BellaAI.getInstance();
        console.log('Bella AI initialized successfully');
        
        // Set chat interface AI callback function
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                try {
                    chatInterface.showTypingIndicator();
                    const response = await bellaAI.think(message);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage('assistant', response);
                } catch (error) {
                    console.error('AI processing error:', error);
                    chatInterface.hideTypingIndicator();
                    chatInterface.addMessage('assistant', 'Sorry, I\'m having trouble processing that right now. Please try again.');
                }
            };
            
            // Set provider change callback
            chatInterface.onProviderChange = (provider) => {
                console.log('Provider changed to:', provider);
                if (provider === 'contextual') {
                    // Already using contextual responses by default
                    console.log('Using smart contextual responses');
                } else if (provider === 'local') {
                    console.log('Attempting to use local model (experimental)');
                    // Could enable local model here if needed
                } else {
                    // Cloud API provider
                    bellaAI.switchProvider(provider);
                }
            };
        }
        
        micButton.disabled = false;
        transcriptDiv.textContent = 'Bella is ready, please click the microphone to start conversation.';
    } catch (error) {
        console.error('Failed to initialize Bella AI:', error);
        transcriptDiv.textContent = 'AI model loading failed, but chat interface is still usable.';
        
        // Even if AI fails, provide basic chat functionality
        if (chatInterface) {
            chatInterface.onMessageSend = async (message) => {
                chatInterface.showTypingIndicator();
                setTimeout(() => {
                    chatInterface.hideTypingIndicator();
                    const fallbackResponses = [
                        'My AI core is still loading, please try again later...',
                        'Sorry, I can\'t think properly right now, but I\'ll keep learning!',
                        'My brain is still starting up, please give me some time...',
                        'System is updating, temporarily unable to provide intelligent responses.'
                    ];
                    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
                    chatInterface.addMessage('assistant', randomResponse);
                }, 1000);
            };
        }
        
        // Disable voice function, but keep interface usable
        micButton.disabled = true;
    }

    // --- Loading screen handling ---
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        // Hide it after the animation to prevent it from blocking interactions
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Show chat control panel
            const chatControlPanel = document.querySelector('.chat-control-panel');
            if (chatControlPanel) {
                chatControlPanel.classList.add('visible');
            }
        }, 500); // This time should match the transition time in CSS
    }, 1500); // Start fading out after 1.5 seconds

    let activeVideo = video1;
    let inactiveVideo = video2;

    // Video list
    const videoList = [
        'video-resources/3d-modeling-creation.mp4',
        'video-resources/elegant-swaying-chin-pose-smile.mp4',
        'video-resources/peace-sign-elegant-swaying.mp4',
        'video-resources/cheer-up-motivation.mp4',
        'video-resources/dancing.mp4',
        'video-resources/negative/angry-hands-on-hips.mp4'
    ];

    // --- Video crossfade playback functionality ---
    function switchVideo() {
        // 1. Select next video
        const currentVideoSrc = activeVideo.querySelector('source').getAttribute('src');
        let nextVideoSrc = currentVideoSrc;
        while (nextVideoSrc === currentVideoSrc) {
            const randomIndex = Math.floor(Math.random() * videoList.length);
            nextVideoSrc = videoList[randomIndex];
        }

        // 2. Set inactive video element source
        inactiveVideo.querySelector('source').setAttribute('src', nextVideoSrc);
        inactiveVideo.load();

        // 3. When inactive video can play, execute switch
        inactiveVideo.addEventListener('canplaythrough', function onCanPlayThrough() {
            // Ensure event only triggers once
            inactiveVideo.removeEventListener('canplaythrough', onCanPlayThrough);

            // 4. Play new video
            inactiveVideo.play().catch(error => {
                console.error("Video play failed:", error);
            });

            // 5. Switch active class to trigger CSS transition
            activeVideo.classList.remove('active');
            inactiveVideo.classList.add('active');

            // 6. Update roles
            [activeVideo, inactiveVideo] = [inactiveVideo, activeVideo];

            // Bind ended event for new activeVideo
            activeVideo.addEventListener('ended', switchVideo, { once: true });
        }, { once: true }); // Use { once: true } to ensure event is handled only once
    }

    // Initial startup
    activeVideo.addEventListener('ended', switchVideo, { once: true });
    
    // Chat control button events
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatTestBtn = document.getElementById('chat-test-btn');
    
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            if (chatInterface) {
                console.log('Chat button clicked');
                console.log('Chat interface status before click:', chatInterface.getVisibility());
                console.log('Chat container class name before click:', chatInterface.chatContainer.className);
                
                chatInterface.toggle();
                
                console.log('Chat interface status after click:', chatInterface.getVisibility());
                console.log('Chat container class name after click:', chatInterface.chatContainer.className);
                console.log('Chat interface toggled, current status:', chatInterface.getVisibility());
                
                // Update button status
                const isVisible = chatInterface.getVisibility();
                chatToggleBtn.innerHTML = isVisible ? 
                    '<i class="fas fa-times"></i><span>Close</span>' : 
                    '<i class="fas fa-comments"></i><span>Chat</span>';
                console.log('Button text updated to:', chatToggleBtn.innerHTML);
            }
        });
    }
    
    if (chatTestBtn) {
        chatTestBtn.addEventListener('click', () => {
            if (chatInterface) {
                const testMessages = [
                    'Hello! I\'m Bella, nice to meet you!',
                    'Chat interface is working normally, all functions are ready.',
                    'This is a test message to verify interface functionality.'
                ];
                const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
                chatInterface.addMessage('assistant', randomMessage);
                
                // If chat interface is not shown, auto show it
                if (!chatInterface.getVisibility()) {
                    chatInterface.show();
                    chatToggleBtn.innerHTML = '<i class="fas fa-times"></i><span>Close</span>';
                }
                
                console.log('Test message added:', randomMessage);
            }
        });
    }


    // --- Speech recognition core ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    // Check if browser supports speech recognition
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;  // Changed to false for better control
        recognition.lang = 'en-US';      // Set language to English
        recognition.interimResults = true; // Get interim results
        recognition.maxAlternatives = 1;   // Only get the best result
        
        // Check if we're on HTTPS or localhost (required for speech recognition)
        const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        if (!isSecureContext) {
            console.warn('Speech recognition requires HTTPS or localhost');
            micButton.disabled = true;
            transcriptDiv.textContent = 'Speech recognition requires secure connection (HTTPS)';
        }

        recognition.onstart = () => {
            console.log('Speech recognition started');
            const transcriptText = document.getElementById('transcript');
            transcriptText.textContent = 'Listening... Speak now!';
        };

        recognition.onresult = async (event) => {
            console.log('Speech recognition result received');
            const transcriptContainer = document.getElementById('transcript');
            let final_transcript = '';
            let interim_transcript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }

            // Update interim results
            const currentText = final_transcript || interim_transcript;
            transcriptContainer.textContent = `You: ${currentText}`;

            // Once we have a final result, process it with the AI
            if (final_transcript && bellaAI) {
                const userText = final_transcript.trim();
                console.log('Processing speech input:', userText);
                transcriptContainer.textContent = `You: ${userText}`;

                // If chat interface is open, also display in chat window
                if (chatInterface && chatInterface.getVisibility()) {
                    chatInterface.addMessage('user', userText);
                }

                try {
                    // Let Bella think
                    const thinkingText = document.createElement('p');
                    thinkingText.textContent = 'Bella is thinking...';
                    thinkingText.style.color = '#888';
                    thinkingText.style.fontStyle = 'italic';
                    transcriptContainer.appendChild(thinkingText);
                    
                    const response = await bellaAI.think(userText);
                    
                    transcriptContainer.removeChild(thinkingText);
                    const bellaText = document.createElement('p');
                    bellaText.textContent = `Bella: ${response}`;
                    bellaText.style.color = '#ff6b9d';
                    bellaText.style.fontWeight = 'bold';
                    bellaText.style.marginTop = '10px';
                    transcriptContainer.appendChild(bellaText);

                    // If chat interface is open, also display in chat window
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage('assistant', response);
                    }

                    // Auto-stop listening after processing response
                    if (isListening) {
                        isListening = false;
                        micButton.classList.remove('is-listening');
                        setTimeout(() => {
                            const transcriptContainer = document.querySelector('.transcript-container');
                            transcriptContainer.classList.remove('visible');
                        }, 3000); // Keep visible for 3 seconds to show response
                    }

                    // TTS functionality temporarily disabled, will be activated in next phase
                    // TODO: Activate speech synthesis functionality
                    // const audioData = await bellaAI.speak(response);
                    // const blob = new Blob([audioData], { type: 'audio/wav' });
                    // const audioUrl = URL.createObjectURL(blob);
                    // const audio = new Audio(audioUrl);
                    // audio.play();

                } catch (error) {
                    console.error('Bella AI processing error:', error);
                    const errorText = document.createElement('p');
                    const errorMsg = 'Bella encountered a problem while processing, but she\'s still learning...';
                    errorText.textContent = errorMsg;
                    errorText.style.color = '#ff9999';
                    transcriptContainer.appendChild(errorText);
                    
                    if (chatInterface && chatInterface.getVisibility()) {
                        chatInterface.addMessage('assistant', errorMsg);
                    }
                }
            }
        };

        recognition.onerror = async (event) => {
            console.error('Speech recognition error:', event.error, event);
            
            // Reset listening state on error
            if (isListening) {
                isListening = false;
                micButton.classList.remove('is-listening');
                const transcriptContainer = document.querySelector('.transcript-container');
                const transcriptText = document.getElementById('transcript');
                transcriptContainer.classList.remove('visible');
                
                // Show error message based on error type
                let errorMessage = '';
                switch(event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try again.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please allow microphone access and refresh the page.';
                        // Try to request permission again
                        try {
                            await navigator.mediaDevices.getUserMedia({ audio: true });
                            errorMessage = 'Microphone access granted. Please try again.';
                        } catch (permError) {
                            console.error('Permission denied:', permError);
                        }
                        break;
                    case 'network':
                        errorMessage = 'Network error. Please check your internet connection and try again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Audio capture failed. Please check your microphone.';
                        break;
                    case 'aborted':
                        errorMessage = 'Speech recognition was aborted.';
                        break;
                    default:
                        errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
                }
                
                transcriptText.textContent = errorMessage;
                
                setTimeout(() => {
                    transcriptContainer.classList.remove('visible');
                    transcriptText.textContent = 'Click the microphone to start speaking';
                }, 4000);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            // Reset button state when recognition ends
            if (isListening) {
                isListening = false;
                micButton.classList.remove('is-listening');
            }
        };

    } else {
        console.log('Your browser does not support speech recognition functionality.');
        // Disable microphone button if not supported
        micButton.disabled = true;
        micButton.title = 'Speech recognition not supported in this browser';
    }

    // --- Microphone button interaction ---
    let isListening = false;

    micButton.addEventListener('click', async function() {
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        // Check if we're in a secure context
        if (!window.isSecureContext && window.location.protocol !== 'http:' && window.location.hostname !== 'localhost') {
            alert('Speech recognition requires a secure connection (HTTPS) or localhost. Please access the site via HTTPS or localhost.');
            return;
        }

        if (!isListening) {
            // Request microphone permission explicitly
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('Microphone permission granted');
                // Stop the stream since we just needed permission
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                console.error('Microphone permission denied:', error);
                let errorMsg = 'Microphone access is required for voice input.';
                if (error.name === 'NotAllowedError') {
                    errorMsg += ' Please allow microphone access in your browser settings and try again.';
                } else if (error.name === 'NotFoundError') {
                    errorMsg += ' No microphone found. Please connect a microphone and try again.';
                } else {
                    errorMsg += ` Error: ${error.message}`;
                }
                alert(errorMsg);
                return;
            }

            // Start listening
            isListening = true;
            micButton.classList.add('is-listening');
            const transcriptContainer = document.querySelector('.transcript-container');
            const transcriptText = document.getElementById('transcript');

            transcriptText.textContent = 'Listening... Speak now!';
            transcriptContainer.classList.add('visible');
            
            try {
                // Add a small delay before starting recognition
                setTimeout(() => {
                    if (isListening) {
                        recognition.start();
                        console.log('Speech recognition started');
                    }
                }, 100);
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                isListening = false;
                micButton.classList.remove('is-listening');
                transcriptContainer.classList.remove('visible');
                transcriptText.textContent = 'Failed to start speech recognition. Please try again.';
            }
        } else {
            // Stop listening
            isListening = false;
            micButton.classList.remove('is-listening');
            const transcriptContainer = document.querySelector('.transcript-container');
            const transcriptText = document.getElementById('transcript');

            recognition.stop();
            transcriptContainer.classList.remove('visible');
            transcriptText.textContent = '';
            console.log('Speech recognition stopped by user');
        }
    });




});