window.onload = async function() {
    let logs = '';
    let firstUpdate = true;
    let infoContainer = document.getElementById('info'); // Dedicated container for info
    let logContainer = document.getElementById('logs');  // Container for logs

     function formatLogRow(row) {
            const columns = row.split(',');
            const timestamp = columns[0];
            const cmpId = columns[1];
            const classId = columns[2];
            const errorId = columns[3];
            const infoId = columns[4];
            let infoText = columns.slice(5).join(','); // Rest of the row, as info might contain commas
        
            // Check for comment lines
            if (row.trim().startsWith(';')) {
                return row.replace(/^;/, '').trim();
            }
        
            // Reformat XML-like tags
            const match = infoText.match(/<(\w+)>([^<]+)<\/\1>/);
            if (match) {
                const tag = match[1];
                const content = match[2];
                infoText = tag + ": " + content;
            }
        
            return `${timestamp}, ${cmpId}, ${classId}, ${errorId}, ${infoId}, ${infoText}`;
        }


    function handleLogData(data) {
        if (!firstUpdate) {
            logs += '\n';  // append a newline character if not the first update
        } else {
            firstUpdate = false; // set firstUpdate to false after the first update
        }
        logs += data;
    
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        ["Timestamp", "CmpId", "ClassId", "ErrorId", "InfoId", "InfoText"].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        const rows = data.split('\n');
    
        rows.forEach(row => {
            if (row.startsWith(';') || row.includes('ClassId:')) return;
            const formattedRow = formatLogRow(row);
            const columns = formattedRow.split(',');
    
            if (columns.length >= 5) {
                const tr = document.createElement('tr');
                columns.forEach(col => {
                    const td = document.createElement('td');
                    td.textContent = col.trim();
                    tr.appendChild(td);
                });
    
                // Applying color based on ClassId
                if (columns[2].includes('LOG_INFO')) tr.className = 'log-info';
                else if (columns[2].includes('LOG_WARNING')) tr.className = 'log-warning';
                else if (columns[2].includes('LOG_ERROR')) tr.className = 'log-error';
                else if (columns[2].includes('LOG_EXCEPTION')) tr.className = 'log-exception';
                else if (columns[2].includes('LOG_DEBUG')) tr.className = 'log-debug';
                else if (columns[2].includes('LOG_PRINTF')) tr.className = 'log-printf';
                else if (columns[2].includes('LOG_COM')) tr.className = 'log-com';
    
                table.appendChild(tr);
            }
        });
    
        logContainer.innerHTML = ''; // Clear the current logs before appending new data
        logContainer.appendChild(table);
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
