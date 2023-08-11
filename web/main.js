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

        // Creating top-level headers
        const topLevelHeaderRow = document.createElement('tr');
        const topLevelHeaders = ["Timestamp", "Ids", "InfoText"];

        topLevelHeaders.forEach(text => {
            const th = document.createElement('th');

            // Span across multiple columns for "Ids"
            if (text === "Ids") {
                th.colSpan = 4;
            } else {
                th.rowSpan = 2; // Make 'Timestamp' and 'InfoText' span two rows
            }

            th.textContent = text;
            topLevelHeaderRow.appendChild(th);
        });
        table.appendChild(topLevelHeaderRow);

        // Creating second-level headers
        const secondLevelHeaderRow = document.createElement('tr');
        const secondLevelHeaders = ["Cmp", "Class", "Error", "Info"];

        secondLevelHeaders.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            secondLevelHeaderRow.appendChild(th);
        });
        table.appendChild(secondLevelHeaderRow);

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

        // Handling special case of InfoText
        const infoTextParts = columns.slice(5);
        columns = columns.slice(0, 5).concat(infoTextParts.join(','));

        columns.forEach((col, index) => {
            const td = document.createElement('td');
            td.textContent = col.trim();

            // Add 'narrow-cell' class to the specific columns: ClassId, ErrorId, InfoId
            if (index === 2 || index === 3 || index === 4) {
                td.classList.add('center-text');
            }

            tr.appendChild(td);
        });

        // Styling rows based on ClassId
        const logClass = columns[2].trim();
        if (logClass.includes('LOG_')) {
            tr.className = logClass.toLowerCase().replace("log_", "log-");
        }

        return tr;
    }

    function convertToLocalTime(isoString) {
        const date = new Date(isoString);
        const optionsDate = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        const optionsTime = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return [
            date.toLocaleDateString(undefined, optionsDate).replace(/\//g, '.'), // replaces slashes with hyphens
            date.toLocaleTimeString(undefined, optionsTime)
        ];
    }

    function formatLogRow(row) {
        // If it's a comment line, return immediately.
        if (row.trim().startsWith(';')) {
            return row.replace(/^;/, '').trim();
        }

        let columns = row.split(',');

        const [date, time] = convertToLocalTime(columns.shift());
        const timestamp = `${date} ${time}`;
        const cmpId = columns.shift();
        const classId = columns.shift();
        const errorId = columns.shift();
        const infoId = columns.shift();
        let infoText = columns.join(','); // Rest of the row, as info might contain commas

        // General transformation for XML-like tags
        infoText = infoText.replace(/<(\w+)>([^<]+)<\/\1>/g, "$1: $2").replace(/\s*,\s*/g, ", ").trim();

        // Construct the new row
        return [timestamp, cmpId, classId, errorId, infoId, infoText].join(', ');
    }


    function handleLogData(data) {
        const table = createTableFromLogs(data);
        logContainer.innerHTML = ''; // Reset current logs before appending
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
