let myChart = null;

// Helper to build the API URL
function createQuery(obj) {
    return Object.entries(obj)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
}

// Fetch data from Open-Meteo
async function getWeatherData() {
    const weatherParams = {
        latitude: 49.2761,
        longitude: -123.1016,
        hourly: "temperature_2m,rain",
        current: "temperature_2m,rain",
        timezone: "America%2FLos_Angeles",
        forecast_days: 1
    };
    
    const weatherUrl = "https://api.open-meteo.com/v1/forecast?" + createQuery(weatherParams);
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
}

// Update the UI text
function setWeatherStatus(temperature, rain) {
    const tempStatus = temperature >= 25 ? "It's quite warm!" : "It's a bit chilly.";
    const rainStatus = rain > 0 ? "Bring an umbrella, it's raining." : "No rain in sight.";
    document.getElementById("weatherText").innerHTML = `${temperature}°C. ${tempStatus} ${rainStatus}`;
}

// Main function triggered by button
async function getWeather() {
    const loader = document.getElementById("loader");
    const button = document.getElementById("getWeatherButton");
    const weatherText = document.getElementById("weatherText");

    // Start Loading State
    loader.style.display = "block";
    button.style.display = "none";
    weatherText.innerText = "Syncing with satellites...";

    try {
        const data = await getWeatherData();
        
        // Update Text
        setWeatherStatus(data.current.temperature_2m, data.current.rain);
        
        // Prepare Graph Data
        const temps = data.hourly.temperature_2m;
        const labels = data.hourly.time.map(t => t.substring(11));

        // Clear old chart if it exists
        if (myChart) { myChart.destroy(); }
        
        const ctx = document.getElementById("temperatureChart").getContext("2d");
        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Temp (°C)",
                    data: temps,
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    fill: true,
                    tension: 0.4, // This gives the "liquid" curved line look
                    pointBackgroundColor: "white"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: 'white', font: { size: 14 } } }
                },
                scales: {
                    x: { ticks: { color: 'white' }, grid: { display: false } },
                    y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });

    } catch (error) {
        console.error(error);
        weatherText.innerText = "Failed to load weather. Check connection.";
    } finally {
        // End Loading State
        loader.style.display = "none";
        button.style.display = "inline-block";
    }
}
