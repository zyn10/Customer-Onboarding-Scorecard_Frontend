document.addEventListener("DOMContentLoaded", function () {
    const splashScreen = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");

    setTimeout(() => {
        splashScreen.classList.add("d-none");
        mainContent.classList.remove("d-none");
    }, 3000);

    const portalList = document.querySelector(".portal-list");
    const selectAllCheckbox = document.getElementById("select-all");
    const fetchDataButton = document.getElementById("fetch-data");
    const downloadExcelButton = document.getElementById("download-excel");
    const dataTableBody = document.getElementById("data-table-body");
    const loadingDialog = document.getElementById("loading-dialog");

    selectAllCheckbox.addEventListener("change", function () {
        const checkboxes = portalList.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    });

    const customerSiteData = [
        { customer: "BPIA", site: "" },
        { customer: "carclo", site: "Czech" },
        { customer: "carclo", site: "China" },
        { customer: "carclo", site: "India" },
        { customer: "carclo", site: "Mitcham" },
        { customer: "carclo", site: "Export" },
        { customer: "carclo", site: "Latrobe" },
        { customer: "WHS", site: "Birmingham" },
        { customer: "WHS", site: "Pickering" },
        { customer: "Desch", site: "uk" },
        { customer: "Desch", site: "Poland" },
        { customer: "rge", site: "Yate" },
        { customer: "rge", site: "Whittlesey" },
        { customer: "rge", site: "Baltic" },
        { customer: "southern", site: "Champion" },
        { customer: "KC", site: "" },
        { customer: "SKL", site: "Nairobi" },
        { customer: "MBC", site: "" },
        { customer: "Radnor", site: "" },
        { customer: "KNC", site: "" },
        { customer: "Mccolgans", site: "" },
        { customer: "stoneGate", site: "Gate" },
        { customer: "STL", site: "Tanzania" },
        { customer: "YPM", site: "" },
        { customer: "Delifrance", site: "" },
        { customer: "Quin", site: "" },
        { customer: "Aquascot", site: "" }
    ];

    customerSiteData.forEach((entry, index) => {
        const portalName = `${entry.customer} ${entry.site}`.toUpperCase(); 
        const portalItem = `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="portal-${index}">
                <label for="portal-${index}" class="form-check-label">${portalName}</label>
            </div>
        `;
        portalList.innerHTML += portalItem;
    });
    

    fetchDataButton.addEventListener("click", async () => {
        if (validateInputs()) {
            loadingDialog.classList.remove("d-none");
    
            const fromDate = document.getElementById("from-date").value;
            const toDate = document.getElementById("to-date").value;
            const selectedCheckboxes = Array.from(document.querySelectorAll(".portal-list input[type='checkbox']:checked"));
            const isAllSelected = selectAllCheckbox.checked;
    
            try {
                let data = [];
    
                if (isAllSelected) {
                    const response = await fetch(`http://localhost:302/clients?startDate=${fromDate}&endDate=${toDate}`);
                    if (!response.ok) throw new Error("Failed to fetch data for all clients");
                    data = await response.json();
                
                } else {
                    for (const checkbox of selectedCheckboxes) {
                        const clientName = checkbox.nextElementSibling.innerText.replace(/\s+/g, '');
                        const response = await fetch(`http://localhost:302/client?clientName=${clientName}&startDate=${fromDate}&endDate=${toDate}`);
                        if (!response.ok) throw new Error(`Failed to fetch data for ${clientName}`);
                        const clientData = await response.json();
                        data = data.concat(clientData);
                    }
                }
    
                populateTable(data);  
                downloadExcelButton.classList.remove("d-none");
            } catch (error) {
                alert(`Error: ${error.message}`);
            } finally {
                loadingDialog.classList.add("d-none");
            }
        }
    });
    
    function populateTable(data) {
    
        dataTableBody.innerHTML = data.map((item) => {
            const downtimeData = item.data || {};
    
            const poweredOff = downtimeData['Poweredoff Downtime Hours'] || 0;
            const unclassified = downtimeData['Unclassified Downtime Hours'] || 0;
            const unplanned = downtimeData['Unplanned Downtime Hours'] || 0;
    
            const uncategorizedPercentage = (unclassified + poweredOff) / unplanned * 100 || 0;
            const jobsOver150 = (unclassified + poweredOff) > 150 ? 1 : 0;
    
            return `
                <tr>
                    <td>${item.client}</td>
                    <td>${unclassified}</td>
                    <td>${poweredOff}</td>
                    <td>${unplanned}</td>
                    <td>${uncategorizedPercentage.toFixed(2)}%</td>
                    <td>${jobsOver150}</td>
                </tr>
            `;
        }).join(""); 
    }
    
    
    

    downloadExcelButton.addEventListener("click", () => {
        const startDate = document.getElementById("from-date").value;
        const endDate = document.getElementById("to-date").value;
        const fileName = `onboarding_data_from_${startDate}_to_${endDate}.xlsx`;

        const dataToExport = [
            ["Site Name", "Unclassified Time", "Powered Off", "Unplanned Downtime", "Percentage of Uncategorized", "Jobs over 150% Complete"],
            ...Array.from(dataTableBody.rows).map(row => Array.from(row.cells).map(cell => cell.innerText))
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Onboarding Data");
        XLSX.writeFile(wb, fileName);
    });

    function validateInputs() {
        const fromDate = document.getElementById("from-date").value;
        const toDate = document.getElementById("to-date").value;
        const isPortalSelected = Array.from(document.querySelectorAll('.portal-list input[type="checkbox"]')).some(checkbox => checkbox.checked);

        if (!isPortalSelected) {
            alert("Please select at least one portal.");
            return false;
        }

        if (!fromDate || !toDate) {
            alert("Please select both 'From' and 'To' dates.");
            return false;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            alert("'From' date must be earlier than 'To' date.");
            return false;
        }

        return true;
    }
});
