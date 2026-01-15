let myChart = null;

function createQuery(obj) {
    let query_string = "";
    for (let [key, value] of Object.entries(obj)) {
        query_string += `${key}=${value}&`;
    }
    return query_string.substring(0, query_string.length - 1);
}

async function getWeatherData(){
    const weatherParams = {
        latitude: 49.2761,
        longitude: -123.1016,
        hourly: "temperature_2m,rain",
        current: "temperature_2m,rain",
        timezone: "America%2FLos_Angeles",
        forecast_days: 1
    };
    
    const weatherUrl = "https://api.open-meteo.com/v1/forecast?" + createQuery(weatherParams);
    const returnedData = await fetch(weatherUrl);
    const jsonData = await returnedData.json();
    return jsonData;
}

function setWeatherText(temperature, rain) {
    let temperatureText = temperature >= 30 ? "It is hot outside." : "It is cool outside.";
    let rainText = rain > 0 ? "It is raining." : "It is not raining.";
    document.getElementById("weatherText").innerHTML = temperatureText + " " + rainText;
}

async function getWeather() {
    const weatherData = await getWeatherData();
    
    const currentTemperature = weatherData.current.temperature_2m;
    const currentRain = weatherData.current.rain;
    setWeatherText(currentTemperature, currentRain);
    
    const temps = weatherData.hourly.temperature_2m;
    const tempLabels = weatherData.hourly.time;
    let betterLabels = tempLabels.map(label => label.substring(11));

    // If a chart already exists, destroy it before creating a new one
    if (myChart) {
        myChart.destroy();
    }
    
    const ctx = document.getElementById("temperatureChart").getContext("2d");
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels : betterLabels,
            datasets: [
                {
                    data: temps,
                    label: "Temperature (°C)",
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options : {
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: { ticks: { color: 'white' }, grid: { display: false } },
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
            }
        }
    });
}
