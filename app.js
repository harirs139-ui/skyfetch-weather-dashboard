/**
 * Part 3: Weather Dashboard - OOP with Prototypal Inheritance
 * Organized structure with forecast feature
 */

/**
 * WeatherApp Constructor
 * Initializes the weather application and sets up DOM references
 */
function WeatherApp(apiKey) {
    // Store API configuration
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    
    // Store DOM element references (cache them for performance)
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');
    
    // Initialize the app
    this.init();
}

/**
 * Initialize event listeners and display welcome message
 */
WeatherApp.prototype.init = function() {
    // Add click event listener to search button with proper context binding
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    
    // Add Enter key support for quick search
    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });
    
    // Show welcome message on page load
    this.showWelcome();
    
    console.log('🌤️ SkyFetch Weather Dashboard initialized with OOP structure!');
};

/**
 * Display welcome message
 */
WeatherApp.prototype.showWelcome = function() {
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
    
    this.weatherDisplay.innerHTML = welcomeHTML;
};

/**
 * Handle search action triggered by button click or Enter key
 */
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();
    
    // Validate input
    if (!city) {
        this.showError('Empty Input', 'Please enter a city name to search.');
        return;
    }
    
    if (city.length < 2) {
        this.showError('Input Too Short', 'Please enter at least 2 characters.');
        return;
    }
    
    // Fetch weather data for the city
    this.getWeather(city);
    
    // Clear input field
    this.cityInput.value = '';
};

/**
 * Show loading state with spinner
 */
WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <div class="loading-text">Fetching weather data...</div>
        </div>
    `;
    
    this.weatherDisplay.innerHTML = loadingHTML;
};

/**
 * Show error message
 */
WeatherApp.prototype.showError = function(title, description) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-title">${title}</div>
            <div class="error-description">${description}</div>
        </div>
    `;
    
    this.weatherDisplay.innerHTML = errorHTML;
};

/**
 * Fetch current weather data for a city
 */
WeatherApp.prototype.getWeather = async function(city) {
    // Show loading state
    this.showLoading();
    
    // Disable search button to prevent multiple simultaneous requests
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';
    
    // Build API URLs
    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        // Use Promise.all() to fetch both current weather and forecast simultaneously
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);
        
        console.log('Weather data received:', currentWeather.data);
        console.log('Forecast data received:', forecastData);
        
        // Display current weather
        this.displayWeather(currentWeather.data);
        
        // Display 5-day forecast
        this.displayForecast(forecastData);
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        
        // Show appropriate error message based on error type
        if (error.response && error.response.status === 404) {
            this.showError(
                'City Not Found',
                `The city "${city}" was not found. Please check the spelling and try again.`
            );
        } else if (error.response) {
            this.showError(
                'Error',
                `An error occurred (Status: ${error.response.status}). Please try again later.`
            );
        } else {
            this.showError(
                'Network Error',
                'Unable to fetch data. Please check your internet connection and try again.'
            );
        }
    } finally {
        // Re-enable search button
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

/**
 * Fetch forecast data for a city
 */
WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

/**
 * Display current weather
 */
WeatherApp.prototype.displayWeather = function(data) {
    const { name, main, weather, wind, clouds, sys } = data;
    
    const weatherHTML = `
        <div class="weather-card">
            <div class="city-name">${name}, ${sys.country}</div>
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
    
    this.weatherDisplay.innerHTML = weatherHTML;
    
    // Focus back on input for better UX
    this.cityInput.focus();
};

/**
 * Process forecast data to get one entry per day (at noon)
 * Filters the 40 forecast items (3-hour intervals) to get 5 days at 12:00:00
 */
WeatherApp.prototype.processForecastData = function(data) {
    // Filter to get only forecasts at 12:00:00 (noon)
    const dailyForecasts = data.list.filter((item) => {
        return item.dt_txt.includes('12:00:00');
    });
    
    // Return only the first 5 days (5-day forecast)
    return dailyForecasts.slice(0, 5);
};

/**
 * Display 5-day forecast
 */
WeatherApp.prototype.displayForecast = function(data) {
    // Process the forecast data to get 5 days
    const dailyForecasts = this.processForecastData(data);
    
    // Create HTML for each forecast day
    const forecastHTML = dailyForecasts.map((day) => {
        // Convert Unix timestamp to date
        const date = new Date(day.dt * 1000);
        
        // Format day name (Mon, Tue, etc.)
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Extract weather data
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        
        return `
            <div class="forecast-card">
                <div class="forecast-day">${dayName}</div>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-description">${description}</div>
            </div>
        `;
    }).join('');
    
    // Create forecast section HTML
    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
    
    // Append forecast to weather display (don't replace!)
    this.weatherDisplay.innerHTML += forecastSection;
};

/**
 * Initialize the WeatherApp with API key
 */
const app = new WeatherApp('94fd94d27434e88e5b8b3f1fd99efe3f');
