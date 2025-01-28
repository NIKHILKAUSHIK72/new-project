const depotDataUrls = {
    'noida': {
        stock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuFQgA8IkJFk4SXreMAjvy0ICZY3f1dYeiDIe5sxhp1EEaL5B-iSRzuzH-GSkBYclPapzOXIGyXKsc/pub?gid=18072645&single=true&output=csv&sheet=sheet8',
        dispatch: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuFQgA8IkJFk4SXreMAjvy0ICZY3f1dYeiDIe5sxhp1EEaL5B-iSRzuzH-GSkBYclPapzOXIGyXKsc/pub?gid=623094330&single=true&output=csv&sheet=sheet7',
        purchase: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuFQgA8IkJFk4SXreMAjvy0ICZY3f1dYeiDIe5sxhp1EEaL5B-iSRzuzH-GSkBYclPapzOXIGyXKsc/pub?gid=0&single=true&output=csv&sheet=orders'
    },
    'ghaziabad': {
        stock: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuFQgA8IkJFk4SXreMAjvy0ICZY3f1dYeiDIe5sxhp1EEaL5B-iSRzuzH-GSkBYclPapzOXIGyXKsc/pub?gid=18072645&single=true&output=csv&sheet=sheet8',
        dispatch: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvFtjgnm2hoAifaAxSmQeEgi2JBbVyfafZcgGA1AgGX04zOqoRM0ZDOjGdrDlLVkuPwDYMaGGY26i/pub?output=csv&sheet=dispatch',
        purchase: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVvFtjgnm2hoAifaAxSmQeEgi2JBbVyfafZcgGA1AgGX04zOqoRM0ZDOjGdrDlLVkuPwDYMaGGY26i/pub?output=csv&sheet=purchase'
    },
    // Add other depots similarly (pune, patna, etc.)
};

// Function to apply date filters
function applyDateFilter() {
    fetchDepotData();  // Re-fetch the data when date filter is applied
}

// Fetch data for the selected depot and apply date filters
function fetchDepotData() {
    const selectedDepot = document.getElementById("sheet-dropdown").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (selectedDepot === "select depo") {
        return; // Do nothing if no depot is selected
    }

    const urls = depotDataUrls[selectedDepot];

    // Fetch data for each sheet (stock, dispatch, purchase) for the selected depot
    Promise.all([
        fetch(urls.stock).then(response => response.text()),
        fetch(urls.dispatch).then(response => response.text()),
        fetch(urls.purchase).then(response => response.text())
    ])
    .then(dataArray => {
        const [stockData, dispatchData, purchaseData] = dataArray;
        processDepotData(stockData, dispatchData, purchaseData, startDate, endDate);
    })
    .catch(error => {
        console.error('Error fetching depot data:', error);
    });
}

// Process depot data (stock, dispatch, purchase) and filter by date
function processDepotData(stockData, dispatchData, purchaseData, startDate, endDate) {
    let totalStock = 0;
    let totalDispatch = 0;
    let totalPurchase = 0;

    // Parse CSV for Stock
    totalStock = parseCSVData(stockData, startDate, endDate);

    // Parse CSV for Dispatch
    totalDispatch = parseCSVData(dispatchData, startDate, endDate);

    // Parse CSV for Purchase
    totalPurchase = parseCSVData(purchaseData, startDate, endDate);

    // Update the stat cards based on depot data
    document.getElementById("total-stock").textContent = totalStock;
    document.getElementById("total-dispatch").textContent = totalDispatch;
    document.getElementById("total-purchase").textContent = totalPurchase;
}

// Parse CSV data and sum up values for stock, dispatch, or purchase
function parseCSVData(csvText, startDate, endDate) {
    const rows = csvText.split("\n");
    let total = 0;

    rows.slice(1).forEach(row => {
        const columns = row.split(",");
        if (columns.length < 2) return; // Skip invalid rows

        const date = columns[2]; // Assuming the first column is the date
        const value = parseInt(columns[3] || 0); // Assuming the second column contains the value

        const rowDate = new Date(date);
        const rowStartDate = new Date(startDate);
        const rowEndDate = new Date(endDate);

        // Check if rowDate is within the selected range
        if ((startDate && rowDate < rowStartDate) || (endDate && rowDate > rowEndDate)) {
            return; // Skip rows outside the date range
        }

        total += value;
    });

    return total;
}