document.addEventListener("DOMContentLoaded", function () {
  let splashScreen = document.getElementById("splash-screen");
  let mainContent = document.getElementById("main-content");

  setTimeout(() => {
    splashScreen.classList.add("d-none");
    mainContent.classList.remove("d-none");
  }, 3000);

  let portalList = document.querySelector(".portal-list");
  let selectAllCheckbox = document.getElementById("select-all");
  let fetchDataButton = document.getElementById("fetch-data");
  let downloadExcelButton = document.getElementById("download-excel");
  let dataTableBody = document.getElementById("data-table-body");
  let loadingDialog = document.getElementById("loading-dialog");

  selectAllCheckbox.addEventListener("change", function () {
    let checkboxes = portalList.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => (checkbox.checked = this.checked));
  });

  let customerSiteData = [
    { customer: "BPIA", site: " Ardeer" },
    { customer: "Carclo", site: " Czech" },
    { customer: "Carclo", site: " China" },
    { customer: "Carclo", site: " India" },
    { customer: "Carclo", site: " Mitcham" },
    { customer: "Carclo", site: " Export" },
    { customer: "Carclo", site: " Latrobe" },
    // { customer: "Carclo", site: " Tucson", },
    { customer: "WHS", site: " Birmingham" },
    { customer: "WHS", site: " Pickering" },
    { customer: "Desch", site: " UK" },
    { customer: "Desch", site: " Poland" },
    // { customer: "RGE", site: " Yate"  },
    { customer: "RGE", site: " Peterborough" },
    { customer: "RGE", site: " Baltic" },
    { customer: "Southern", site: " Champion" },
    // { customer: "Kernow", site: " KC"  },
    // { customer: "SKL", site: "Nairobi" },
    { customer: "MBC", site: "" },
    { customer: "Radnor", site: "" },
    { customer: "Kendal Nutricare", site: " KNC" },
    { customer: "Mccolgans", site: "" },
    { customer: "StoneGate", site: "" },
    // { customer: "STL", site: "Tanzania" },
    { customer: "YPM", site: "" },
    { customer: "Delifrance", site: "" },
    { customer: "Quin", site: "" },
    { customer: "Aquascot", site: "" },
    // { customer: "Xandor", site: "" }
  ];

  customerSiteData.forEach((entry, index) => {
    let portalName = `${entry.customer} ${entry.site}`;
    let portalItem = `
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

      let fromDate = document.getElementById("from-date").value;
      let toDate = document.getElementById("to-date").value;
      let selectedCheckboxes = Array.from(
        document.querySelectorAll(".portal-list input[type='checkbox']:checked")
      );
      let isAllSelected = selectAllCheckbox.checked;

      try {
        let data = [];

        if (isAllSelected) {
          let response = await fetch(
            `http://localhost:302/clients?startDate=${fromDate}&endDate=${toDate}`
          );
          if (!response.ok)
            throw new Error("Failed to fetch data for all clients");
          data = await response.json();
          console.log("data");
        } else {
          for (let checkbox of selectedCheckboxes) {
            let clientName = checkbox.nextElementSibling.innerText.replace();
            let response = await fetch(
              `http://localhost:302/client?clientName=${clientName}&startDate=${fromDate}&endDate=${toDate}`
            );
            if (!response.ok)
              throw new Error(`Failed to fetch data for ${clientName}`);
            let clientData = await response.json();
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
    dataTableBody.innerHTML = data
      .map((item) => {
        let downtimeData = item.data || {};

        let poweredOff = (
          downtimeData["Poweredoff Downtime Hours"] || 0
        ).toFixed(2);

        let unclassified = (
          downtimeData["Unclassified Downtime Hours"] || 0
        ).toFixed(2);
        let unplanned = Math.round(
          downtimeData["Unplanned Downtime Hours"] || 0
        );
        let jobsOver150 = Math.round(downtimeData["Over 150 Hours"] || 0);

        let uncategorizedPercentage;
        if (item.client == "Mccolgans" || item.client == "Desch UK") {
          uncategorizedPercentage = (unclassified / unplanned) * 100 || 0;
          poweredOff = 0;
        } else {
          uncategorizedPercentage =
            ((unclassified + poweredOff) / unplanned) * 100 || 0;
        }

        return `
                <tr>
                    <td>${item.client}</td>
                    <td>${unclassified}</td>
                    <td>${poweredOff}</td>
                    <td>${unplanned}</td>
                    <td>${uncategorizedPercentage.toFixed(1)}%</td>
                    <td>${jobsOver150}</td>
                </tr>
            `;
      })
      .join("");
  }

  downloadExcelButton.addEventListener("click", () => {
    let startDate = document.getElementById("from-date").value;
    let endDate = document.getElementById("to-date").value;
    let fileName = `onboarding_data_from_${startDate}_to_${endDate}.xlsx`;

    let dataToExport = [
      [
        "Site Name",
        "Unclassified Time",
        "Powered Off",
        "Unplanned Downtime",
        "Percentage of Uncategorized",
        "Jobs over 150% Complete",
      ],
      ...Array.from(dataTableBody.rows).map((row) =>
        Array.from(row.cells).map((cell) => cell.innerText)
      ),
    ];

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Onboarding Data");
    XLSX.writeFile(wb, fileName);
  });
  function validateInputs() {
    let fromDate = document.getElementById("from-date").value;
    let toDate = document.getElementById("to-date").value;
    let isAnyPortalChecked =
      document.querySelectorAll('.portal-list input[type="checkbox"]:checked')
        .length > 0;
    let selectAll = document.getElementById("select-all");

    if (!isAnyPortalChecked && !selectAll.checked) {
      alert("Please select at least one portal.");
      return false;
    }

    if (!fromDate || !toDate) {
      alert("Both dates must be selected.");
      return false;
    }

    let fromDateObj = new Date(fromDate);
    let toDateObj = new Date(toDate);
    let currentDate = new Date();

    if (fromDateObj > currentDate || toDateObj > currentDate) {
      alert("The selected dates cannot be in the future.");
      return false;
    }

    if (fromDateObj >= toDateObj) {
      alert('"From" date must be earlier than "To" date.');
      return false;
    }

    let timeDiff = toDateObj - fromDateObj;
    let dayDiff = timeDiff / (1000 * 3600 * 24);
    if (dayDiff > 7) {
      alert("The date range cannot be more than 7 days.");
      return false;
    }

    return true;
  }
});
