window.onload = async function() {
    let logs = '';
    let firstUpdate = true;
    let infoContainer = document.getElementById('info'); // Dedicated container for info
    let logContainer = document.getElementById('logs');  // Container for logs

    // A helper function to handle the log data
    function handleLogData(data) {
        if (!firstUpdate) {
            logs += '\n';  // append a newline character if not the first update
        } else {
            firstUpdate = false; // set firstUpdate to false after the first update
        }
        logs += data;
        logContainer.innerHTML = ''; // Clear the current logs before appending new data
        let pre = document.createElement('pre');
        pre.textContent = logs;
        logContainer.appendChild(pre);
    }

    async function fetchInfoAndDisplay() {
        try {
            // Fetch the info from the backend
            let response = await fetch('http://localhost:5000/info');
            if (!response.ok) {
                let errorMessage = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, Message: ${errorMessage}`);
            }
            let infoData = await response.text();
            infoData = infoData.replace(/\^@/g, ''); // Only replace here for info
            let preInfo = document.createElement('pre');
            preInfo.textContent = infoData;
            // Insert the info directly to the info container
            infoContainer.appendChild(preInfo);
        } catch (error) {
            console.error('Error fetching info:', error.message);
        }
    }

    try {
        await fetchInfoAndDisplay();  // Fetch and display the info

        // Fetch current logs
        let response = await fetch('http://localhost:5000/current_logs');
        if (!response.ok) {
            let errorMessage = await response.text();
            throw new Error(`HTTP error fetching current logs! status: ${response.status}, Message: ${errorMessage}`);
        }
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
            if (error.target && error.target.readyState === EventSource.CLOSED) {
                console.error('EventSource connection closed unexpectedly');
            } else {
                console.error('Unexpected EventSource error:', error);
            }
        };
    } catch (error) {
        console.error('Error:', error.message);
    }
}
