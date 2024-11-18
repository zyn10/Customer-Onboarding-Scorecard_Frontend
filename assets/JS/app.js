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

    selectAllCheckbox.addEventListener("change", function () {
        const checkboxes = portalList.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
    });

    const customerSiteData = [
        { customer: "BPIA", site: "Ardeer" },
        { customer: "Carclo", site: "Czech" },
        { customer: "Carclo", site: "China" },
        { customer: "Carclo", site: "India" },
        { customer: "Carclo", site: "Mitcham" },
        { customer: "Carclo", site: "Export" },
        { customer: "Carclo", site: "Latrobe" },
        { customer: "WHS", site: "Birmingham" },
        { customer: "WHS", site: "Pickering" },
        { customer: "Desch", site: "UK" },
        { customer: "Desch", site: "Poland" },
        { customer: "RGE", site: "Yate" },
        { customer: "RGE", site: "Peterborough" },
        { customer: "RGE", site: "Baltic" },
        { customer: "Southern Champion", site: "" },
        { customer: "Kernow", site: "" },
        { customer: "SKL", site: "Nairobi" },
        { customer: "MBC", site: "" },
        { customer: "Radnor", site: "" },
        { customer: "Kendall Nutricare", site: "" },
        { customer: "McColgans", site: "" },
        { customer: "Stonegate", site: "" },
        { customer: "STL", site: "Tanzania" },
        { customer: "YPM", site: "" },
        { customer: "Delifrance", site: "" },
        { customer: "Quin", site: "" },
        { customer: "Aquascot", site: "" }
    ];

    // Dynamically populate portal list by concatenating customer and site names
    customerSiteData.forEach((entry, index) => {
        const portalName = `${entry.customer} ${entry.site}`;
        const portalItem = `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="portal-${index}">
                <label for="portal-${index}" class="form-check-label">${portalName}</label>
            </div>
        `;
        portalList.innerHTML += portalItem;
    });

    // Fetch data (stub implementation with updated data structure)
    fetchDataButton.addEventListener("click", () => {
        const stubData = [
            { siteName: "BPIA Ardeer", unclassified: 2281.13, poweredOff: 224.03, unplanned: 2337, uncategorizedPercentage: "107%", jobsOver150: 16 },
            { siteName: "Carclo Czech", unclassified: 5.89, poweredOff: 0.03, unplanned: 366, uncategorizedPercentage: "2%", jobsOver150: 0 },
            // Add more data here as needed
        ];

        dataTableBody.innerHTML = stubData.map(data => `
            <tr>
                <td>${data.siteName}</td>
                <td>${data.unclassified}</td>
                <td>${data.poweredOff}</td>
                <td>${data.unplanned}</td>
                <td>${data.uncategorizedPercentage}</td>
                <td>${data.jobsOver150}</td>
            </tr>
        `).join("");

        downloadExcelButton.classList.remove("d-none");
    });

    downloadExcelButton.addEventListener("click", () => {
        const startDate = document.getElementById("from-date").value;
        const endDate = document.getElementById("to-date").value;
        const fileName = `onboarding_data_from_${startDate}_to_${endDate}.xlsx`;

        const dataToExport = [
            ["Site Name", "Unclassified Time", "Powered Off", "Unplanned Downtime", "Percentage of Uncategorized", "Jobs over 150% Complete"],
            ...Array.from(dataTableBody.rows).map(row => Array.from(row.cells).map(cell => cell.innerText))
        ];

        // Create workbook and export
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Onboarding Data");
        XLSX.writeFile(wb, fileName);
    });
});
