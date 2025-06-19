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
    checkboxes.forEach((checkbox) => (checkbox.checked = this.checked));
  });

  fetch("http://localhost:302/client-names")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch client names");
      return response.json();
    })
    .then((clientNames) => {
      clientNames.forEach((portalName, index) => {
        const portalItem = `
          <div class="form-check">
              <input type="checkbox" class="form-check-input" id="portal-${index}">
              <label for="portal-${index}" class="form-check-label">${portalName}</label>
          </div>
        `;
        portalList.innerHTML += portalItem;
      });
    })
    .catch((error) => {
      console.error("Error loading client names:", error);
      alert("Unable to load client names.");
    });

  fetchDataButton.addEventListener("click", async () => {
    if (validateInputs()) {
      loadingDialog.classList.remove("d-none");

      const fromDate = document.getElementById("from-date").value;
      const toDate = document.getElementById("to-date").value;
      const selectedCheckboxes = Array.from(
        document.querySelectorAll(".portal-list input[type='checkbox']:checked")
      );
      const isAllSelected = selectAllCheckbox.checked;

      try {
        let data = [];

        if (isAllSelected) {
          const response = await fetch(
            `http://localhost:302/clients?startDate=${fromDate}&endDate=${toDate}`
          );
          if (!response.ok)
            throw new Error("Failed to fetch data for all clients");
          data = await response.json();
        } else {
          for (const checkbox of selectedCheckboxes) {
            const clientName = checkbox.nextElementSibling.innerText;
            const response = await fetch(
              `http://localhost:302/client?clientName=${clientName}&startDate=${fromDate}&endDate=${toDate}`
            );
            if (!response.ok)
              throw new Error(`Failed to fetch data for ${clientName}`);
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
    dataTableBody.innerHTML = data
      .map((item) => {
        const downtimeData = item.data || {};
        let alltime = parseFloat(downtimeData["All Time Hours"] || 0);
        let poweredOff = parseFloat(
          downtimeData["Poweredoff Downtime Hours"] || 0
        );
        let unclassified = parseFloat(
          downtimeData["Unclassified Downtime Hours"] || 0
        );
        let noncategorised = parseFloat(
          downtimeData["Non-Categorised Downtime Hours"] || 0
        );
        let totalDowntimeHours = parseFloat(
          downtimeData["Total Downtime Hours"] || 0
        );
        const unplanned = Math.round(
          downtimeData["Unplanned Downtime Hours"] || 0
        );
        const jobsOver150 = parseFloat(downtimeData["Over 150 Hours"] || 0);

        let uncategorizedPercentage = (
          (noncategorised / totalDowntimeHours) * 100 || 0
        ).toFixed(2);

        return `
          <tr>
              <td>${item.client}</td>
              <td>${alltime.toFixed(2)}</td>
              <td>${totalDowntimeHours.toFixed(2)}</td>
              <td>${noncategorised.toFixed(2)}</td>
              <td>${unclassified.toFixed(2)}</td>
              <td>${poweredOff.toFixed(2)}</td>
              <td>${unplanned.toFixed(2)}</td>
              <td>${uncategorizedPercentage}%</td>
              <td>${jobsOver150.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");
  }

  downloadExcelButton.addEventListener("click", () => {
    const startDate = document.getElementById("from-date").value;
    const endDate = document.getElementById("to-date").value;
    const fileName = `onboarding_data_from_${startDate}_to_${endDate}.xlsx`;

    const dataToExport = [
      [
        "From Date",
        "To Date",
        "Site Name",
        "All Time Hours",
        "Total Downtime Hours",
        "Non-Categorised Downtime Hours",
        "Unclassified Time",
        "Powered Off",
        "Unplanned Downtime",
        "Percentage of Uncategorized",
        "Jobs over 150% Complete",
      ],
      ...Array.from(dataTableBody.rows).map((row) => {
        const rowData = Array.from(row.cells).map((cell) => cell.innerText);
        return [startDate, endDate, ...rowData];
      }),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Onboarding Data");
    XLSX.writeFile(wb, fileName);
  });

  // ✅ Input validation
  function validateInputs() {
    const fromDate = document.getElementById("from-date").value;
    const toDate = document.getElementById("to-date").value;
    const isAnyPortalChecked =
      document.querySelectorAll('.portal-list input[type="checkbox"]:checked')
        .length > 0;
    const selectAll = document.getElementById("select-all");

    if (!isAnyPortalChecked && !selectAll.checked) {
      alert("Please select at least one portal.");
      return false;
    }

    if (!fromDate || !toDate) {
      alert("Both dates must be selected.");
      return false;
    }

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
    const currentDate = new Date();

    if (fromDateObj > currentDate || toDateObj > currentDate) {
      alert("The selected dates cannot be in the future.");
      return false;
    }

    if (fromDateObj >= toDateObj) {
      alert('"From" date must be earlier than "To" date.');
      return false;
    }

    const timeDiff = toDateObj - fromDateObj;
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    if (dayDiff > 7) {
      alert("The date range cannot be more than 7 days.");
      return false;
    }

    return true;
  }
});
