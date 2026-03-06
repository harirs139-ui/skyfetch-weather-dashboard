// API Configuration
const API_KEY = '94fd94d27434e88e5b8b3f1fd99efe3f'; // OpenWeatherMap API Key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');

/**
 * Part 2: Refactored to Async/Await
 * Fetches weather data for a given city using async/await syntax
 */
async function getWeather(city) {
    // Show loading state
    showLoading();
    
    // Disable search button to prevent multiple simultaneous requests
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        // Use await with axios to fetch data
        const response = await axios.get(url);
        
        // Log for debugging
        console.log('Weather data received:', response.data);
        
        // Display the weather data
        displayWeather(response.data);
        
    } catch (error) {
        // Handle different error types
        console.error('Error fetching weather:', error);
        
        if (error.response && error.response.status === 404) {
            showError(
                'City Not Found',
                `The city "${city}" was not found. Please check the spelling and try again.`
            );
        } else if (error.response) {
            showError(
                'Error',
                `An error occurred (Status: ${error.response.status}). Please try again later.`
            );
        } else {
            showError(
                'Network Error',
                'Unable to fetch data. Please check your internet connection and try again.'
            );
        }
    } finally {
        // Re-enable search button
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Search';
    }
}

/**
 * Part 2: Display Weather Data
 * Formats and displays weather information
 */
function displayWeather(data) {
    const { name, main, weather, wind, clouds } = data;
    
    const weatherHTML = `
        <div class="weather-card">
            <div class="city-name">${name}, ${data.sys.country}</div>
            <div class="temperature">${Math.round(main.temp)}°C</div>
            <div class="weather-description">${weather[0].description}</div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${Math.round(main.feels_like)}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${main.humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${wind.speed} m/s</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Cloudiness</div>
                    <div class="detail-value">${clouds.all}%</div>
                </div>
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = weatherHTML;
    
    // Focus back on input for better UX
    cityInput.focus();
}

/**
 * Part 2: Show Loading State
 * Displays a spinner while fetching data
 */
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <div class="loading-text">Fetching weather data...</div>
        </div>
    `;
    
    weatherDisplay.innerHTML = loadingHTML;
}

/**
 * Part 2: Show Error Message
 * Displays user-friendly error messages
 */
function showError(title, description) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-title">${title}</div>
            <div class="error-description">${description}</div>
        </div>
    `;
    
    weatherDisplay.innerHTML = errorHTML;
}

/**
 * Part 2: Show Welcome Message
 * Displays initial welcome message
 */
function showWelcome() {
    const welcomeHTML = `
        <div class="welcome-message">
            <div class="welcome-emoji">🌍</div>
            <div class="welcome-title">Welcome to SkyFetch</div>
            <div class="welcome-subtitle">
                Enter any city name in the search box above to get started!<br>
                <br>
                Try searching for: London, Paris, Tokyo, New York, or your own city!
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = welcomeHTML;
}

/**
 * Part 2: Validate City Input
 * Checks if input meets validation criteria
 */
function validateCity(city) {
    const trimmedCity = city.trim();
    
    if (!trimmedCity) {
        showError('Empty Input', 'Please enter a city name to search.');
        return null;
    }
    
    if (trimmedCity.length < 2) {
        showError('Input Too Short', 'Please enter at least 2 characters for a city name.');
        return null;
    }
    
    return trimmedCity;
}

/**
 * Part 2: Handle Search Action
 * Triggered by search button click or Enter key
 */
function handleSearch() {
    const city = validateCity(cityInput.value);
    
    if (city) {
        getWeather(city);
        cityInput.value = ''; // Clear input after search
    }
}

/**
 * Part 2: Event Listeners
 * Attach click and keyboard event handlers
 */

// Search button click event
searchBtn.addEventListener('click', handleSearch);

// Enter key support
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

/**
 * Part 2: Initialize App
 * Show welcome message on page load
 */
showWelcome();

console.log('🌤️ SkyFetch Weather Dashboard loaded successfully!');
