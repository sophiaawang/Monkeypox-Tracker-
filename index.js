let numberCases = 1;
let selectedCountry = $("#selected")[0].innerText;
let selectedCases = 0;
let csvArray;
let csvCountryArray;
let caseHistory = [];
let countryCaseHistory = [];
const jsonURL = "https://raw.githubusercontent.com/globaldothealth/monkeypox/main/latest.json";
const numCases = document.querySelector("#numCases");
let numMales = 0;
let numFemales = 0;


// GET WORLDWIDE DATA & HISTORY
const getData = async () => {
  let response = await fetch(jsonURL);
  let jsonData = await response.json();
  numberCases = jsonData.length;
  numCases.innerHTML = "Worldwide Cases: " + numberCases;
  getCSV();
  // For Demographics
  numMales = await jsonData.filter(element => element.Gender === "male").length;
  numFemales = await jsonData.filter(element => element.Gender === "female").length;
};
getData();



const getCSV = async () => {
  let response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/timeseries-confirmed.csv');
  let textData = await response.text();
  csvArray = CSVstring_to_Array(textData);
  let dateHistory = [];
  for (element of csvArray) {
    caseHistory.push(element.Cumulative_cases);
    dateHistory.push(element.Date);
  }
  let slicedArr = [];
  slicedArr = caseHistory.slice(-37, -1);
  slicedArr.push(numberCases);
  let slicedDate = [];
  slicedDate = dateHistory.slice(-37, -1);

  let len = slicedArr.length;
  const bars = document.querySelector("#bars");
  for (let i = 0; i < len; i++) {
    if (i % 18 === 0) {
      bars.innerHTML += `<tr id="bar-${i}"> <td style="--size: calc( ${slicedArr[i]} / ${slicedArr[len - 1]} ); --color: #9cbcc4ff;"> <span class="tooltip"> ${slicedArr[i]} </span> </td></tr>`;
      //<th scope="row"> ${slicedDate[i]} </th>
    } else {
      bars.innerHTML += `<tr id="bar-${i}"> <td style="--size: calc( ${slicedArr[i]} / ${slicedArr[len - 1]} ); --color: #9cbcc4ff;"> <span class="tooltip"> ${slicedArr[i]} </span> </td></tr>`;
    }
  }
};
// GET COUNTRY-SPECIFIC DATA & HISTORY
const getCountryData = async (selectedCountry) => {
  console.log(selectedCountry);
  let response = await fetch(jsonURL);
  let jsonData = await response.json();
  if (selectedCountry === "United Kingdom") {
    selectedCases = jsonData.filter(element => element.Country === "England").length;
    selectedCases += jsonData.filter(element => element.Country === "Northern Ireland").length;
    selectedCases += jsonData.filter(element => element.Country === "Scotland").length;
    selectedCases += jsonData.filter(element => element.Country === "Wales").length;
  }
  else {
    selectedCases = jsonData.filter(element => element.Country === selectedCountry).length;
  }
  console.log(`there are ${selectedCases} cases in ${selectedCountry}`);
  numCases.innerHTML = selectedCountry + " Cases: " + selectedCases;
  getCountryCSV($("#selected")[0].innerText);
  return selectedCases;
};

const getCountryCSV = async (selectedCountry) => {
  let response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/timeseries-country-confirmed.csv');
  let textData = await response.text();
  csvCountryArray = CSVstring_to_Array(textData);
  const result = csvCountryArray.filter(element => element.Country === selectedCountry);
  countryCaseHistory = [];
  for (element of result) {
    countryCaseHistory.push(element.Cumulative_cases);
  }
  let slicedArr;
  const bars = document.querySelector("#bars2");
  bars.innerHTML = "";
  if (countryCaseHistory.length < 36) {
    slicedArr = countryCaseHistory;
  } else {
    slicedArr = countryCaseHistory.slice(-36);
  }
  slicedArr.push(selectedCases);
  let len = slicedArr.length
  for (let i = 0; i < len; i++) {
    if (selectedCases === 0) {
      bars.innerHTML += `<tr id="bar-${i}"> <td style="--size: calc( ${slicedArr[i]} / ${slicedArr[i - 1]} ); --color: #9cbcc4ff;"> <span class="tooltip"> ${slicedArr[i]} </span> </td></tr>`;
    } else {
      bars.innerHTML += `<tr id="bar-${i}"> <td style="--size: calc( ${slicedArr[i]} / ${slicedArr[len - 1]} ); --color: #9cbcc4ff;"> <span class="tooltip"> ${slicedArr[i]} </span> </td></tr>`;
    }
  }
  const graphCaption = document.querySelector("#countrySpecificCaption");
  graphCaption.innerHTML = `${selectedCountry} Cases Over Time`;
};

// Converting CSV text to an Array
function CSVstring_to_Array(data, delimiter = ',') {
  const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
  const titleValues = data.slice(data.indexOf('\n') + 1).split('\n');
  const ansArray = titleValues.map(function(v) {
    const values = v.split(delimiter);
    const storeKeyValue = titles.reduce(
      function(obj, title, index) {
        obj[title] = values[index];
        return obj;
      }, {});
    return storeKeyValue;
  });
  return ansArray;
};

// DROPDOWN
$('.dropdown--scrollable .dropdown-menu, .hero .tab-content .dropdown .dropdown-menu').click(function(e) {
  e.stopPropagation();
});

$('.dropdown--scrollable .dropdown-menu__content').each(function() {
  $(this).slick({
    infinite: false,
    vertical: true,
    slidesToShow: $(this).data('items'),
    slidesToScroll: $(this).data('items-scroll'),
    dots: false,
    prevArrow: $(this).parent().find('a.up'),
    nextArrow: $(this).parent().find('a.down'),
    responsive: [{
      breakpoint: 15,
      settings: {
        variableWidth: true,
        slidesToShow: 5,
        slidesToScroll: 1
      }
    }]
  });
  var carousel = $(this);
  $(this).parents('.dropdown--scrollable').on('click', 'button', function() {
    carousel.slick('refresh');
  })

});

$('.dropdown--scrollable .dropdown-menu__content .dropdown-item').each(function() {
  $(this).click(function() {
    $('.dropdown--scrollable .dropdown-menu__content .dropdown-item').each(function() {
      if ($(this).hasClass('check')) {
        $(this).removeClass('check');
      }
    });
    $(this).addClass('check');
    $("#selected")[0].innerText = (this).textContent;
    $("#selected").append(`<i class="fa fa-chevron-down fa-xs ml-2" aria-hidden="true" title="English checked"></i>`);
    getCountryData($("#selected")[0].innerText);

  });
});

let options = document.querySelectorAll('.option');
let description = document.querySelector('#monkey-description');

let informationArray = [["About", `<b>Monkeypox: </b>is a rare disease caused by infection with the monkeypox virus. Monkeypox virus is part of the same family of viruses as variola virus, the virus that causes smallpox. Monkeypox symptoms are similar to smallpox symptoms, but milder, and monkeypox is rarely fatal. Monkeypox is not related to chickenpox.`], ["Signs", `<b>Symptoms of monkeypox can include:</b> Fever, Headache, Muscle aches and backache, Swollen lymph nodes, Chills, Exhaustion, Respiratory symptoms (e.g. sore throat, nasal congestion, or cough). A rash that may be located on other like the hands, feet, chest, face, or mouth. The rash will go through several stages, including scabs, before healing. The rash can look like pimples or blisters and may be painful or itchy.`
], ["How", "It’s possible for people to get monkeypox from infected animals, either by being scratched or bitten by the animal or by preparing or eating meat or using products from an infected animal. A person with monkeypox can spread it to others from the time symptoms start until the rash has fully healed and a fresh layer of skin has formed. The illness typically lasts 2-4 weeks."], ["Prevention", "CDC recommends vaccination for people who have been exposed to monkeypox and people who may be more likely to get monkeypox."], ["Treatment", "There are no treatments specifically for monkeypox virus infections. However, monkeypox and smallpox viruses are genetically similar, which means that antiviral drugs and vaccines developed to protect against smallpox may be used to prevent and treat monkeypox virus infections."]];

options.forEach((option) => {
  option.addEventListener("click", (e) => {
    for (let i = 0; i < informationArray.length; i++) {
      if (option.id === informationArray[i][0]) {
        description.innerHTML = informationArray[i][1];
      }
    }
  });
});



const about = document.querySelector("#About");
const signs = document.querySelector("#Signs");
const how = document.querySelector("#How");
const prevention = document.querySelector("#Prevention");
const treatment = document.querySelector("#Treatment");


var modal1 = document.querySelector("#modal-1");
var modal2 = document.querySelector("#modal-2");
var button1 = document.querySelector("#button1");
var button2 = document.querySelector("#button2");

var span = document.getElementsByClassName("close")[0];
var span2 = document.getElementsByClassName("close")[1];

button1.onclick = function() {
  modal1.style.display = "block";
}
button2.onclick = function() {
  modal2.style.display = "block";
}

span.onclick = function() {
  modal1.style.display = "none";
  modal2.style.display = "none";
}

span2.onclick = function() {
  modal2.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal1) {
    modal1.style.display = "none";
  } else if (event.target == modal2) {
    modal2.style.display = "none";
  }
}

const getCountryPoints = async () => {
  //Case and Country Data
  let response = await fetch(jsonURL);
  let jsonData = await response.json();
  let file = await fetch("countries.csv");
  let countryArray = CSVstring_to_Array(await file.text());
  let filteredArray = [];
  for (let i = 0; i < countryArray.length; i++) {
    let numberCases = jsonData.filter(element => element.Country === countryArray[i].country).length;
    if (numberCases !== 0) {
      countryArray[i].cases = numberCases;
      filteredArray.push(countryArray[i]);
    }
  }

  //Intializing map 
  require(["esri/config", "esri/Map", "esri/views/MapView", "esri/Graphic",
    "esri/layers/GraphicsLayer"], function(esriConfig, Map, MapView, Graphic, GraphicsLayer) {

      esriConfig.apiKey = "AAPK362150bce0cd40f680981596e87c60eb4N3YsbFiL4LLfECGh1GC3nWLZME3frMk4LK8BbcY5Q_jcHW3c6LV6QkBOiV1bQ58";

      const map = new Map({
        basemap: "arcgis-topographic" // Basemap layer service
      });

      const view = new MapView({
        map: map,
        center: [-95.712891, 37.09024], // Longitude, latitude
        zoom: 3, // Zoom level
        container: "viewDiv" // Div element
      });
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);

      const simpleMarkerSymbol = {
        type: "simple-marker",
        color: [226, 35, 30],  // Red
        outline: {
          color: [255, 255, 255], // White
          width: 1
        }
      };

      const attributes = {
        Name: "Graphic",
        Description: "I am a data point"
      }

      for (let j = 0; j < filteredArray.length; j++) {
        const point = { //Create a point
          type: "point",
          longitude: filteredArray[j].longitude,
          latitude: filteredArray[j].latitude
        };
        const popupTemplate = {
          title: `${filteredArray[j].country}: ${filteredArray[j].cases}`,
          content: "This is the number of cases in this country"
        }

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol,
          attributes: attributes,
          popupTemplate: popupTemplate
        });

        graphicsLayer.add(pointGraphic);
      }
    });

  console.log("test");
};

getCountryPoints();

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(doSomething);

function doSomething() {
  while (numMales === 0) {
  }
  drawChart();
}

function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['Gender', 'Number of Cases'],
    ['M', numMales],
    ['F', numFemales],
  ]);
  var options = {
    title: "Male/Female Cases",
    titleTextStyle: {
      color: "black",
      fontName: "Times New Roman",
      bold: false,
      fontSize: 15
    },
    legendTextStyle: {
      color: "black",
      fontName: "Times New Roman",
    },
    pieSliceTextStyle: {
      color: 'black',
      fontName: "Times New Roman"
    },

    slices: {
      0: { color: '#9CBCC4' },
      1: { color: '#3EA4BE' }
    }
  };
  var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
}