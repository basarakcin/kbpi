window.onload = async function() {
    const infoContainer = document.getElementById('info');
    const logContainer = document.getElementById('logs');

    async function fetchInfoAndDisplay() {
        try {
            const response = await fetch('http://localhost:5000/info');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const infoData = (await response.text()).replace(/\^@/g, '');
            const preInfo = document.createElement('pre');
            preInfo.textContent = infoData;
            infoContainer.appendChild(preInfo);
        } catch (error) {
            console.error('Error fetching info:', error.message);
        }
    }

    function createTableFromLogs(data) {
        const table = document.createElement('table');
        const headerNames = ["Timestamp", "CmpId", "ClassId", "ErrorId", "InfoId", "InfoText"];
        
        // Creating table header
        const headerRow = document.createElement('tr');
        headerNames.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Parsing and appending rows
        data.split('\n').forEach(row => {
            if (row.startsWith(';') || row.includes('ClassId:')) return;

            const formattedRow = formatLogRow(row);
            const columns = formattedRow.split(',');
            if (columns.length >= 5) {
                const tr = createTableRowFromColumns(columns);
                table.appendChild(tr);
            }
        });

        return table;
    }

    function createTableRowFromColumns(columns) {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = col.trim();
            tr.appendChild(td);
        });

        // Styling rows based on ClassId
        const logClass = columns[2].trim();
        if (logClass.includes('LOG_')) {
            tr.className = logClass.toLowerCase().replace("log_", "log-");
        }
        return tr;
    }

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
            const table = createTableFromLogs(data);
            logContainer.innerHTML = '';  // Reset current logs before appending
            logContainer.appendChild(table);
        }
    
        // Fetch and display
        try {
            await fetchInfoAndDisplay();
            
            const response = await fetch('http://localhost:5000/current_logs');
            if (!response.ok) {
                throw new Error(`HTTP error fetching current logs! status: ${response.status}`);
            }
    
            const data = await response.text();
            handleLogData(data);
            
            // Listening for log updates
            const eventSource = new EventSource('http://localhost:5000/logs');
            eventSource.onopen = () => console.log('EventSource connection opened');
            eventSource.onmessage = event => {
                console.log('Received new logs:', event.data);
                handleLogData(event.data);
            };
            eventSource.onerror = error => {
                console.error('EventSource encountered an error:', error);
                if (error.target && error.target.readyState === EventSource.CLOSED) {
                    console.error('EventSource connection closed unexpectedly');
                }
            };
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
