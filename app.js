const open_weather_map_api_key = "dd90d5571646f76c75449e9e171633f8";
const pexels_api_key = "gEqMhHCLatGJ0PcwAOcVW6Rzi21XRK5446PpCNaXEjQkkXBMD4hNjhBY";
const body = document.querySelector("body");
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const input = document.querySelector(".input-group input");
const searchBtn = document.querySelector(".input-group i");
const error = document.querySelector(".error");
const infos = document.querySelector(".infos");
const city = document.querySelector(".city h4");
const celcius = document.querySelector(".celcius h1");
const desc = document.querySelector(".desc");
const wind = document.querySelector(".wind");
const humidity = document.querySelector(".humidity");
const descImg = document.querySelector(".desc-img");
const minmax = document.querySelector(".minmax");
const forecast = document.querySelector("#forecast");
const wf_cities = document.querySelector(".wf-cities");
const worldwide_cities = ["New York", "London", "Istanbul", "Berlin", "Paris", "Rome", "Barcelona", "Sydney"];
const wf_cities_imgs = [];

window.addEventListener("load", () => {
    getBgImageForWF();    
})

const getBackgroundImage = async (place) => {
    const res = await fetch(
        `https://api.pexels.com/v1/search?per_page=20&size=small&query=${place}`,
        {
        headers: {
            Authorization: pexels_api_key,
        },
        }
    );
    const responseJson = await res.json();
    if(responseJson.photos.length>0) {
        const number = getRandomNumber(responseJson.photos.length); 
        body.style.backgroundImage = `url("${responseJson.photos[number].src.original}")`
    }

}

const getBgImageForWF = async () => {
    for(let city of worldwide_cities) {
        const res = await fetch(
            `https://api.pexels.com/v1/search?per_page=20&size=small&query=${city}`,
            {
            headers: {
                Authorization: pexels_api_key,
            },
            }
        );
        const responseJson = await res.json();    
        const number = getRandomNumber(responseJson.photos.length);
        wf_cities_imgs.push({city: city, url: responseJson.photos[number].src.original})
    }

    getWorldwideForecast();
}

const getImageForWFCityItem = (place) => {
    for(let img of wf_cities_imgs) {
        if(img.city==place) {
            return img.url;
        }
    }
}

const getWorldwideForecast = async () => {
    wf_cities.innerHTML = "";
    for(let city of worldwide_cities) {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${open_weather_map_api_key}&units=metric`)
        const data = await response.json();

        let li = `
            <li class="wf-city-item wf-city-item-${worldwide_cities.indexOf(city)}" onclick="searchFromWF(this.children[0].children[0].children[0].innerHTML)" style="background-image: url('${getImageForWFCityItem(city)}');">
                <div class="wf-city-wrapper">
                    <div class="wf-city-left">
                        <p class="wf-city-name">${city}</p>
                        <p class="wf-city-temp">${Math.floor(data.main.temp)}°C</p>
                    </div>
                    <div class="wf-city-right">
                        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="" class="wf-city-icon">
                    </div>
                </div>
            </li>
        `;

        wf_cities.insertAdjacentHTML("beforeend", li)
    }
}

const searchFromWF = (place) => {
    input.value = place;
    searchBtn.click();
}

const getRandomNumber = (range) => {
    return Math.floor(Math.random() * range);
}

searchBtn.addEventListener("click", async function findCity() {
    try{
        infos.style.display = "block";
        error.style.display = "none";
        const searchedCity = input.value;
        input.value = "";
        forecast.innerHTML = "";
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${open_weather_map_api_key}&units=metric`);
        
        if(!response.ok) {
            body.style.backgroundImage = "url('https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg')"
            throw new Error("Please enter a valid city!!!");
        }
        getBackgroundImage(searchedCity);
        const data = await response.json();
        console.log(data)
        
        city.innerHTML = `${data.name} / ${data.sys.country}`;
        celcius.innerHTML = `${Math.round(data.main.temp)}°C`;
        descImg.setAttribute("src", `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
        desc.innerHTML = `${data.weather[0].main}`;
        wind.innerHTML = `<i class="fa-solid fa-wind"></i> ${Math.round(data.wind.speed*3.6)} km/hr`;
        humidity.innerHTML = `<i class="fa-solid fa-droplet"></i> ${data.main.humidity}%`;
        minmax.innerHTML = `${Math.round(data.main.temp_min)}°C / ${Math.round(data.main.temp_max)}°C`;
  
  
  
        const responsefc = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&appid=${open_weather_map_api_key}&units=metric`);
        const datafc = await responsefc.json();
        console.log(datafc.list);

        for(let item of datafc.list) {

            if(item.dt_txt.substring(11,13)=="15") {
                const month = months[parseInt(item.dt_txt.substring(5,7)) - 1];
                const day = item.dt_txt.substring(8,10);
                const year = item.dt_txt.substring(0,4);
                const html = `
                    <div class="day">
                        <div class="fc-info">
                            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="">
                            <div class="fc-temp">${Math.round(item.main.temp)}°C</div>
                            <div class="fc-desc">${item.weather[0].main}</div>
                        </div>
                        <div class="fc-date">${month} ${day}, ${year}</div>
                    </div>
                `;

                forecast.insertAdjacentHTML("beforeend", html);
            }

        }
    }
    catch(err) {
        infos.style.display = "none";
        error.style.display = "block";
        error.innerHTML = `${err.message}`;    
    }

});

input.addEventListener("keypress", (e) => {
    if(e.key == "Enter")
        searchBtn.click()
});