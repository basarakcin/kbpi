window.onload = async function() {
    let logs = '';
    let firstUpdate = true;
    let logContainer = document.getElementById('logs');

    // A helper function to handle the log data
    function handleLogData(data) {
        if (!firstUpdate) {
            logs += '\n';  // append a newline character if not the first update
        } else {
            firstUpdate = false; // set firstUpdate to false after the first update
        }
        logs += data.replace(/\^@/g, '');
        logContainer.innerHTML = ''; // Clear the current logs before appending new data
        let pre = document.createElement('pre');
        pre.textContent = logs;
        logContainer.appendChild(pre);
    }

    async function fetchInfoAndDisplay() {
        try {
            // Fetch the info from the backend
            let response = await fetch('http://localhost:5000/info');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            let infoData = await response.text();
            let preInfo = document.createElement('pre');
            preInfo.textContent = infoData;
            // Insert the info at the top of the log container
            logContainer.insertBefore(preInfo, logContainer.firstChild);
        } catch (error) {
            console.error('Error fetching info:', error.message);
        }
    }

    try {
        await fetchInfoAndDisplay();  // Fetch and display the info

        // Fetch current logs
        let response = await fetch('http://localhost:5000/current_logs');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let data = await response.text();
        handleLogData(data);
        console.log(data);

        // Listen for updates
        let eventSource = new EventSource('http://localhost:5000/logs');

        eventSource.onopen = function(event) {
            console.log('EventSource connection opened');
        };

        eventSource.onmessage = function(event) {
            console.log('Received new logs:', event.data);
            // Add new logs to the existing logs
            handleLogData(event.data);
        };

        eventSource.onerror = function(error) {
            console.error('EventSource encountered an error:', error);
        };
    } catch (error) {
        console.error('Error:', error.message);
    }
}
