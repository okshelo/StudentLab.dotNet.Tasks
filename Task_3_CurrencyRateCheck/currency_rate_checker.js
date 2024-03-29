const CURRENCIES_URL = "http://www.nbrb.by/api/exrates/currencies";
const CURRENCY_RATE_URL = "https://www.nbrb.by/API/ExRates/Rates/Dynamics";
let allCurrencies = [];

//function, which fetch availible currencies from api and fill select whit result
function loadAllCurrencies() {
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {

            if (this.readyState === 4) {
                if (this.status === 200) {
                    allCurrencies = JSON.parse(this.responseText);
                    allCurrencies = allCurrencies.filter(element => {
                        return ((Date.parse(element.Cur_DateEnd) > (new Date())) && (element.Cur_Periodicity == 0))
                    })
                    //fillCurrencySelect(allCurrencies);
                    resolve(allCurrencies);
                } else
                    reject("Error");
            }
        };

        request.open("GET", CURRENCIES_URL, true);
        request.send(null);
    });
}

//function, which creates Promise whith a request to receive the currency rate
function createLoadCurrencyRatePromise(currencyInfo, dateFrom, dateTo) {
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {

            if (this.readyState === 4) {
                if (this.status === 200) {
                    let currencyValues;
                    try {
                        currencyValues = JSON.parse(this.responseText);
                    } catch {
                        currencyValues = [];
                    }
                    resolve(currencyValues);
                } else
                    reject("Error");
            }
        };

        let currencyUrl = `${CURRENCY_RATE_URL}/${currencyInfo.Cur_ID}?startDate=${dateFrom}&endDate=${dateTo}`
        request.open("GET", currencyUrl, true);
        request.send(null);
    });
}

//function which fetchs and returns selected currency from users controls
function getSelectedCurrencies() {
    let selectedCurrencies = [];

    let selectElement = document.getElementById('selected-currency');
    for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].selected) {
            selectedCurrencies.push(allCurrencies[i]);
        }
    }

    return selectedCurrencies;
}

//function, which fetch currency rate from api and after it, fill table
function currenciesRateQuery() {

    let errorOutput = document.getElementById("errors-output");
    errorOutput.innerText = "";

    let dateRange;
    try {
        dateRange = processDate();
    } catch (e) {
        errorOutput.innerText = e;
        return;
    }

    from = dateRange.from;
    to = dateRange.to;
    let requested_currency = getSelectedCurrencies();

    let requests = requested_currency.map(currencyInfo => createLoadCurrencyRatePromise(currencyInfo, from, to));

    Promise.all(requests)
        .then((currencyRate) => {
            fillTableCallback(requested_currency, currencyRate, from, to);
        })
}

//function which fill table with currentCurrencies columns and rows with dates from 'from' to 'to'
function fillTableCallback(currentCurrencies, currencyRate, from, to) {

    let table = document.getElementById("currency-rate-table");
    table.innerHTML = "";


    let tableHeadersRow = document.createElement('tr');

    let tableHeader = document.createElement('th');
    tableHeader.innerText = "Date";
    tableHeadersRow.appendChild(tableHeader);
    for (let i = 0; i < currentCurrencies.length; i++) {
        tableHeader = document.createElement('th');
        tableHeader.innerText = currentCurrencies[i].Cur_Name;
        tableHeadersRow.appendChild(tableHeader);

    }

    table.appendChild(tableHeadersRow);


    if (currentCurrencies.length > 0) {

        let currDate = new Date(Date.parse(from));
        let targetDate = new Date(Date.parse(to));

        while (currDate <= targetDate) {
            let tableRow = document.createElement('tr');

            tabledata = document.createElement('td');
            tabledata.innerText = `${currDate.getFullYear()}-${currDate.getMonth() + 1}-${currDate.getDate()}`;
            tableRow.appendChild(tabledata);

            for (let i = 0; i < currentCurrencies.length; i++) {
                tabledata = document.createElement('td');
                try {
                    let tempCurrencyRate = currencyRate.filter(currencyArr => {
                        return ((currencyArr.length > 0) && (currencyArr[0].Cur_ID == currentCurrencies[i].Cur_ID));
                    });

                    if (tempCurrencyRate.length > 0) {
                        let temp = tempCurrencyRate[0].filter(createDateFilterFunction(currDate));
                        if (temp.length > 0)
                            tabledata.innerText = temp[0].Cur_OfficialRate;
                        else
                            tabledata.innerText = "none";
                    } else
                        tabledata.innerText = "none";

                } catch {
                    tabledata.innerText = "none";
                }
                tableRow.appendChild(tabledata);
            }

            table.appendChild(tableRow);

            currDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1);
        }
    }
}

//function which return filter function which return elements whith the same year,month and day
function createDateFilterFunction(currDate) {
    return function (element) {
        let targetDate = new Date(Date.parse(currDate));
        let currentDate = new Date(Date.parse(element.Date));
        if ((currentDate.getFullYear() == targetDate.getFullYear()) && (currentDate.getMonth() == targetDate.getMonth()) && (currentDate.getDate() == targetDate.getDate()))
            return true;
        else
            return false;
    }
};

//function which fetch and return dates from users controls
function processDate() {
    let fromDay = +(document.getElementById('from-date-day').value);
    let fromMonth = +(document.getElementById('from-date-month').value);
    let fromYear = +(document.getElementById('from-date-year').value);

    let toDay = +(document.getElementById('to-date-day').value);
    let toMonth = +(document.getElementById('to-date-month').value);
    let toYear = +(document.getElementById('to-date-year').value);

    let fromDate = new Date(fromYear, fromMonth - 1, fromDay, 0);
    let toDate = new Date(toYear, toMonth - 1, toDay, 0);

    if ((fromDate.getDate() != fromDay) || (fromDate.getFullYear() != fromYear) || (fromDate.getMonth() != (fromMonth - 1))) {
        throw "Invalid start day. This day does not exist.";
    }

    if ((toDate.getDate() != toDay) || (toDate.getFullYear() != toYear) || (toDate.getMonth() != (toMonth - 1))) {
        throw "Invalid start day. This day does not exist.";
    }

    if (fromDate > toDate) {
        throw "Invalid date range. Start date can not be greater than end date";
    }

    if ((fromDate > new Date()) || (new Date() < toDate)) {
        throw "Invalid date. I cant show future currency rate";
    }

    var oneDay = 1000 * 60 * 60 * 24;
    var date1_ms = toDate.getTime();
    var date2_ms = fromDate.getTime();
    var differenceMs = date1_ms - date2_ms;
    let differenceDay = Math.round(differenceMs / oneDay);
    if (differenceDay > 360) {
        throw "Invalid date range.  Date range can not be more than 360 days. ";
    }

    formatedFromDate = `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-${fromDate.getDate()}`
    formatedToDate = `${toDate.getFullYear()}-${toDate.getMonth() + 1}-${toDate.getDate()}`
    return {
        from: formatedFromDate,
        to: formatedToDate
    }
}


//---------------------------------DOM elements initialization----------------------------------

function fillCurrencySelect(currencies) {
    let currencySelect = document.getElementById('selected-currency');
    for (let i = 0; i < currencies.length; i++) {
        let optionElement = document.createElement('option');
        optionElement.innerHTML = String(currencies[i].Cur_QuotName);
        currencySelect.append(optionElement);
    }
}

function dateSelectInitialization(selectElement, dateType) {

    switch (dateType) {
        case "DAY":
            for (let i = 1; i < 32; i++) {
                let optionElement = document.createElement('option');
                optionElement.innerHTML = String(i);
                selectElement.append(optionElement);
            }
            break;
        case "MONTH":
            for (let i = 1; i < 13; i++) {
                let optionElement = document.createElement('option');
                optionElement.innerHTML = String(i);
                selectElement.append(optionElement);
            }
            break;
        case "YEAR":
            var now = new Date();
            for (let i = 2016; i <= now.getFullYear(); i++) {
                let optionElement = document.createElement('option');
                optionElement.innerHTML = String(i);
                selectElement.append(optionElement);
            }
            break;
    }
}

let button = document.getElementById("query-currency-rate-button");
button.disabled = true;

loadAllCurrencies().then((allCurr) => {fillCurrencySelect(allCurr); button.disabled = false;})

selectElement = document.getElementById('from-date-day');
dateSelectInitialization(selectElement, "DAY");

selectElement = document.getElementById('from-date-month');
dateSelectInitialization(selectElement, "MONTH");

selectElement = document.getElementById('from-date-year');
dateSelectInitialization(selectElement, "YEAR");

selectElement = document.getElementById('to-date-day');
dateSelectInitialization(selectElement, "DAY");

selectElement = document.getElementById('to-date-month');
dateSelectInitialization(selectElement, "MONTH");

selectElement = document.getElementById('to-date-year');
dateSelectInitialization(selectElement, "YEAR");

button.addEventListener('click', currenciesRateQuery); //currenciesRateQuery()