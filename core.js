// core.js - Bella's Brain (v3)
// Bella's core AI logic, supporting a hybrid architecture of local models and cloud APIs

import { pipeline, env, AutoTokenizer, AutoModelForSpeechSeq2Seq } from './vendor/transformers.js';
import CloudAPIService from './cloudAPI.js';

// Local model configuration
env.allowLocalModels = true;
env.useBrowserCache = false;
env.allowRemoteModels = false;
env.backends.onnx.logLevel = 'verbose';
env.localModelPath = './models/';


class BellaAI {
    static instance = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = new BellaAI();
            await this.instance.init();
        }
        return this.instance;
    }

    constructor() {
        this.cloudAPI = new CloudAPIService();
        this.useCloudAPI = false; // Default to using local model
        this.currentMode = 'casual'; // Chat modes: casual, assistant, creative
    }

    async init() {
        console.log('Initializing Bella\'s core AI...');
        
        // Priority loading of LLM model (chat functionality)
        try {
            console.log('Loading LLM model...');
            this.llm = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
            console.log('LLM model loaded successfully.');
        } catch (error) {
            console.error('Failed to load LLM model:', error);
            // LLM loading failure doesn't block initialization
        }
        
        // Attempt to load ASR model (voice recognition)
        try {
            console.log('Loading ASR model...');
            const modelPath = 'Xenova/whisper-asr';
            const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
            const model = await AutoModelForSpeechSeq2Seq.from_pretrained(modelPath);
            this.asr = await pipeline('automatic-speech-recognition', model, { tokenizer });
            console.log('ASR model loaded successfully.');
        } catch (error) {
            console.warn('ASR model failed to load, voice recognition will be disabled:', error);
            // ASR loading failure doesn't affect chat functionality
            this.asr = null;
        }

        // TTS model temporarily disabled
        // try {
        //     console.log('Loading TTS model...');
        //     this.tts = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { quantized: false });
        //     console.log('TTS model loaded successfully.');
        // } catch (error) {
        //     console.warn('TTS model failed to load, voice synthesis will be disabled:', error);
        //     this.tts = null;
        // }

        console.log('Bella\'s core AI initialized successfully.');
    }

    async think(prompt) {
        try {
            // If cloud API is enabled and configured, use it as priority
            if (this.useCloudAPI && this.cloudAPI.isConfigured()) {
                return await this.thinkWithCloudAPI(prompt);
            }
            
            // For now, skip the local model and use contextual responses
            // because the local model is producing poor results
            console.log('Using contextual response system for better reliability');
            return this.getContextualResponse(prompt);
            
            // Temporarily disabled local model until we can fix the prompt engineering
            // return await this.thinkWithLocalModel(prompt);
            
        } catch (error) {
            console.error('Error during thinking process:', error);
            return this.getContextualResponse(prompt);
        }
    }

    // Get contextual response based on user input
    getContextualResponse(prompt) {
        const lowerPrompt = prompt.toLowerCase().trim();
        
        // Date/time related questions
        if (lowerPrompt.includes('date') || lowerPrompt.includes('today')) {
            const today = new Date();
            return `Today is ${today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}.`;
        }
        
        // Time related questions
        if (lowerPrompt.includes('time') || lowerPrompt.includes('clock')) {
            const now = new Date();
            return `It's currently ${now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })}.`;
        }
        
        // Combined date and time
        if (lowerPrompt.includes('date and time') || lowerPrompt.includes('current date and time')) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            return `Today is ${dateStr}, and it's currently ${timeStr}.`;
        }
        
        // Math calculations - improved
        if (this.isMathQuestion(lowerPrompt)) {
            return this.handleMathQuestion(prompt);
        }
        
        // Core functions and capabilities
        if (lowerPrompt.includes('core functions') || lowerPrompt.includes('what can you do') || 
            lowerPrompt.includes('how can you help') || lowerPrompt.includes('what are your capabilities')) {
            return "I can help you with various tasks! I can answer questions about the current date and time, perform basic math calculations, have conversations, provide general information, and assist with everyday questions. I'm designed to be a friendly AI companion. What would you like to know or discuss?";
        }
        
        // India Prime Minister (current knowledge)
        if (lowerPrompt.includes('prime minister') && lowerPrompt.includes('india')) {
            return "As of my last update, Narendra Modi is the Prime Minister of India. He has been in office since 2014. However, for the most current information, I'd recommend checking recent news sources.";
        }
        
        // Weather questions (mock response)
        if (lowerPrompt.includes('weather')) {
            return "I don't have access to current weather data, but you can check your local weather app or website for the most accurate information!";
        }
        
        // Greeting responses
        if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
            const greetings = [
                "Hello! I'm Bella, nice to meet you!",
                "Hi there! How can I help you today?",
                "Hey! Great to see you. What's on your mind?",
                "Hello! I'm here and ready to chat."
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        // How are you responses
        if (lowerPrompt.includes('how are you') || lowerPrompt.includes('how do you feel')) {
            const statusResponses = [
                "I'm doing well, thank you for asking! How are you?",
                "I'm great! Always excited to learn and chat.",
                "I'm feeling good and ready to help you with anything!",
                "I'm wonderful, thanks! What brings you here today?"
            ];
            return statusResponses[Math.floor(Math.random() * statusResponses.length)];
        }
        
        // Name related questions
        if (lowerPrompt.includes('your name') || lowerPrompt.includes('who are you')) {
            return "I'm Bella, your AI companion! I'm here to chat, help, and hopefully brighten your day.";
        }
        
        // Help with assistance
        if (lowerPrompt.includes('how can you assist') || lowerPrompt.includes('how can you help')) {
            return "I can assist you in several ways! I can answer questions about dates and times, help with basic math, provide information on various topics, have conversations, and just be a friendly companion. What would you like help with today?";
        }
        
        // Technology questions
        if (lowerPrompt.includes('ai') || lowerPrompt.includes('artificial intelligence')) {
            return "AI is fascinating! I'm an example of conversational AI designed to chat and help users. Is there something specific about AI you'd like to discuss?";
        }
        
        // Thanks/appreciation
        if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
            const thankResponses = [
                "You're very welcome! Happy to help.",
                "My pleasure! Is there anything else you'd like to know?",
                "You're welcome! I'm here whenever you need me.",
                "Glad I could help! Feel free to ask me anything else."
            ];
            return thankResponses[Math.floor(Math.random() * thankResponses.length)];
        }
        
        // Goodbye responses
        if (lowerPrompt.includes('bye') || lowerPrompt.includes('goodbye') || lowerPrompt.includes('see you')) {
            const goodbyes = [
                "Goodbye! It was great chatting with you!",
                "See you later! Take care!",
                "Bye! Hope to talk with you again soon!",
                "Farewell! Have a wonderful day!"
            ];
            return goodbyes[Math.floor(Math.random() * goodbyes.length)];
        }
        
        // Default fallback responses - more helpful
        const defaultResponses = [
            "I'd be happy to help! Could you be a bit more specific about what you're looking for?",
            "That's an interesting topic. What would you like to know about it specifically?",
            "I can help with questions about dates, times, basic math, and general conversation. What would you like to explore?",
            "Feel free to ask me about the current date and time, simple calculations, or just chat with me!",
            "I'm here to help! Try asking me about today's date, the time, or any other questions you have."
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Check if the question is math-related
    isMathQuestion(prompt) {
        const mathKeywords = ['plus', 'add', 'minus', 'subtract', 'multiply', 'times', 'divide', 'equals', 'what is'];
        const hasNumbers = /\d/.test(prompt);
        const hasMathOperators = /[\+\-\*\/\=]/.test(prompt);
        
        return hasNumbers && (hasMathOperators || mathKeywords.some(keyword => prompt.includes(keyword)));
    }

    // Handle basic math questions
    handleMathQuestion(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Extract numbers from the prompt
        const numbers = prompt.match(/\d+(\.\d+)?/g);
        
        if (!numbers || numbers.length < 2) {
            return "I can help with basic math! Please provide two numbers and an operation (like 5 + 3 or 10 times 2).";
        }
        
        const num1 = parseFloat(numbers[0]);
        const num2 = parseFloat(numbers[1]);
        
        // Determine operation
        if (lowerPrompt.includes('plus') || lowerPrompt.includes('add') || lowerPrompt.includes('+')) {
            const result = num1 + num2;
            return `${num1} plus ${num2} equals ${result}.`;
        } else if (lowerPrompt.includes('minus') || lowerPrompt.includes('subtract') || lowerPrompt.includes('-')) {
            const result = num1 - num2;
            return `${num1} minus ${num2} equals ${result}.`;
        } else if (lowerPrompt.includes('times') || lowerPrompt.includes('multiply') || lowerPrompt.includes('*') || lowerPrompt.includes('x')) {
            const result = num1 * num2;
            return `${num1} times ${num2} equals ${result}.`;
        } else if (lowerPrompt.includes('divide') || lowerPrompt.includes('/')) {
            if (num2 === 0) {
                return "I can't divide by zero! That would break the universe! 😅";
            }
            const result = num1 / num2;
            return `${num1} divided by ${num2} equals ${result}.`;
        } else {
            return `I see the numbers ${num1} and ${num2}. Could you specify the operation? For example: add, subtract, multiply, or divide.`;
        }
    }

    // Think using cloud API
    async thinkWithCloudAPI(prompt) {
        const enhancedPrompt = this.enhancePromptForMode(prompt);
        return await this.cloudAPI.chat(enhancedPrompt);
    }

    // Think using local model with optimized LLM parameters and processing
    async thinkWithLocalModel(prompt) {
        if (!this.llm) {
            return "I'm still learning how to think. Please wait a moment...";
        }
        
        // Simplified prompting for better results with smaller models
        const simplePrompt = this.createSimplePrompt(prompt);
        
        // Optimized LLM parameters for better responses
        const result = await this.llm(simplePrompt, {
            max_new_tokens: 100,      // Reduced for more focused responses
            temperature: 0.6,         // Lower temperature for consistency
            top_k: 40,               // Reduced top_k
            top_p: 0.9,              // Adjusted top_p
            do_sample: true,
            repetition_penalty: 1.15, // Prevent repetition
            pad_token_id: 1,         // Add pad token
        });
        
        // Enhanced text cleaning and processing
        let response = result[0].generated_text;
        
        // Remove the input prompt completely
        response = response.replace(simplePrompt, '').trim();
        
        // Remove any remaining prompt artifacts
        response = response.replace(/^(Answer:|Response:|Bella:|AI:)/i, '').trim();
        response = response.replace(/^[:\-\s]+/, '').trim();
        
        // Clean up any repeated text
        const sentences = response.split('.').filter(s => s.trim().length > 0);
        if (sentences.length > 1) {
            // Take only the first complete sentence for clarity
            response = sentences[0].trim() + '.';
        }
        
        // If response is empty or too short, provide backup responses
        if (!response || response.length < 5) {
            const backupResponses = [
                "That's an interesting question! Let me think about it.",
                "I understand what you're asking. Give me a moment to respond properly.",
                "Good question! I'm processing that information.",
                "I hear you. Let me organize my thoughts on this.",
                "Interesting! I need a moment to provide a thoughtful response."
            ];
            return backupResponses[Math.floor(Math.random() * backupResponses.length)];
        }
        
        // Ensure the response doesn't contain prompt fragments
        if (response.toLowerCase().includes('be concise') || 
            response.toLowerCase().includes('like siri') ||
            response.toLowerCase().includes('respond to')) {
            return "I'm still learning how to express myself clearly. Could you ask me something else?";
        }
        
        return response;
    }

    // Create simple, effective prompts for smaller models
    createSimplePrompt(userMessage) {
        // Much simpler prompting approach for better results
        const simplePrompts = {
            casual: `Question: ${userMessage}\nHelpful answer:`,
            assistant: `User needs help: ${userMessage}\nUseful response:`,
            creative: `Creative prompt: ${userMessage}\nImaginative response:`
        };
        
        return simplePrompts[this.currentMode] || simplePrompts.casual;
    }

    // Enhance prompts based on mode, using simpler prompting for local models
    enhancePromptForMode(prompt, isLocal = false) {
        if (isLocal) {
            // Use the simplified prompt method for local models
            return this.createSimplePrompt(prompt);
        }
        
        // For cloud APIs, use more sophisticated prompting
        const modePrompts = {
            casual: `You are Bella, a helpful AI assistant. Respond naturally and conversationally to: ${prompt}`,
            assistant: `You are Bella, a professional AI assistant. Provide helpful information for: ${prompt}`,
            creative: `You are Bella, a creative AI assistant. Use your imagination to respond to: ${prompt}`
        };
        
        return modePrompts[this.currentMode] || modePrompts.casual;
    }

    // Get error response
    getErrorResponse() {
        const errorResponses = [
            "I'm sorry, I'm having trouble processing that right now. Let me try to reorganize my thoughts...",
            "Hmm... I need to think about this a bit more. Please wait a moment.",
            "I seem to be having a bit of trouble with that. Give me a second to sort things out.",
            "Let me rephrase my thoughts. Just a moment please.",
            "I didn't quite catch that. Could you try asking in a different way?"
        ];
        
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    // Set chat mode
    setChatMode(mode) {
        if (['casual', 'assistant', 'creative'].includes(mode)) {
            this.currentMode = mode;
            return true;
        }
        return false;
    }

    // Enable/disable local model (for testing purposes)
    setUseLocalModel(useLocal) {
        this.useLocalModel = useLocal;
    }

    // Switch AI service provider
    switchProvider(provider) {
        if (provider === 'local') {
            this.useCloudAPI = false;
            return true;
        } else {
            const success = this.cloudAPI.switchProvider(provider);
            if (success) {
                this.useCloudAPI = true;
            }
            return success;
        }
    }

    // Set API key
    setAPIKey(provider, apiKey) {
        return this.cloudAPI.setAPIKey(provider, apiKey);
    }

    // Clear conversation history
    clearHistory() {
        this.cloudAPI.clearHistory();
    }

    // Get current configuration
    getCurrentConfig() {
        return {
            useCloudAPI: this.useCloudAPI,
            provider: this.useCloudAPI ? this.cloudAPI.getCurrentProvider() : { name: 'local', model: 'LaMini-Flan-T5-77M' },
            mode: this.currentMode,
            isConfigured: this.useCloudAPI ? this.cloudAPI.isConfigured() : true
        };
    }

    // Process audio input
    async listen(audioData) {
        if (!this.asr) {
            throw new Error('Speech recognition model not initialized');
        }
        const result = await this.asr(audioData);
        return result.text;
    }

    // Generate speech from text
    async speak(text) {
        if (!this.tts) {
            throw new Error('Speech synthesis model not initialized');
        }
        // We need speaker embeddings for SpeechT5
        const speaker_embeddings = 'models/Xenova/speecht5_tts/speaker_embeddings.bin';
        const result = await this.tts(text, {
            speaker_embeddings,
        });
        return result.audio;
    }

    // Get cloud API service instance (for external access)
    getCloudAPIService() {
        return this.cloudAPI;
    }
}

// ES6 module export
export { BellaAI };