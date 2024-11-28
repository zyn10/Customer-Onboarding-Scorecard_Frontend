function validateInputs() {
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    const isAnyPortalChecked = document.querySelectorAll('.portal-list input[type="checkbox"]:checked').length > 0;
    const selectAll = document.getElementById('select-all');

    if (!isAnyPortalChecked && !selectAll.checked) {
        alert('Please select at least one portal.');
        return false;
    }

    if (!fromDate || !toDate) {
        alert('Both dates must be selected.');
        return false;
    }

    if (new Date(fromDate) >= new Date(toDate)) {
        alert('"From" date must be earlier than "To" date.');
        return false;
    }

    return confirm('Are you sure you want to fetch the data?');
}
