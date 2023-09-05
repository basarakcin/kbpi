window.onload = async function() {
    document.getElementById("scrollToTop").addEventListener("click", function() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    });

    document.getElementById("scrollToBottom").addEventListener("click", function() {
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
    });

    window.addEventListener("scroll", function() {
        if (window.scrollY > 100) {
            document.getElementById("scrollToTop").style.display = "block";
        } else {
            document.getElementById("scrollToTop").style.display = "none";
        }
    });

    const infoContainer = document.getElementById('info');
    const logContainer = document.getElementById('logs');

    // Fetch the error database
    let errorDb = {};
    try {
        const response = await fetch('error-db.json');
        errorDb = await response.json();
    } catch (error) {
        console.error('Failed to fetch the error database:', error);
    }

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

    function isOlderThan24Hours(timestamp) {
        const oneDayInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const now = new Date();
        const logDate = new Date(timestamp);
        return now - logDate > oneDayInMillis;
    }
    
    function createTableFromLogs(data) {
        const table = document.createElement('table');

        // Creating top-level headers
        const topLevelHeaderRow = document.createElement('tr');
        const topLevelHeaders = ["Timestamp", "Ids", "InfoText"];

        topLevelHeaders.forEach(text => {
            const th = document.createElement('th');
            if (text === "Ids") {
                th.colSpan = 3;
            } else {
                th.rowSpan = 2;
            }
            th.textContent = text;
            topLevelHeaderRow.appendChild(th);
        });
        table.appendChild(topLevelHeaderRow);

        // Creating second-level headers
        const secondLevelHeaderRow = document.createElement('tr');
        const secondLevelHeaders = ["Cmp", "Class", "Error"];

        secondLevelHeaders.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            secondLevelHeaderRow.appendChild(th);
        });
        table.appendChild(secondLevelHeaderRow);

        // Parsing and appending rows
        data.split('\n').forEach(row => {
            if (row.startsWith(';') || row.includes('ClassId:')) return;
            const columns = row.split(',');

            // Extract the original timestamp
            const originalTimestamp = columns[0];
            
            // Check if log is older than 24 hours, if so, skip this log entry
            if (isOlderThan24Hours(originalTimestamp)) {
                return;
            }
    
            const formattedRow = formatLogRow(row);
            const columnsAfterFormat = formattedRow.split(',');
            if (columnsAfterFormat.length >= 4) {
                const tr = createTableRowFromColumns(columnsAfterFormat);
                table.appendChild(tr);
            }
        });

        return table;
    }

    const CLASS_ID_MAPPING = {
        '1': 'INFO',
        '2': 'WARNING',
        '4': 'ERROR',
        '8': 'EXCEPTION',
        '16': 'DEBUG',
        '32': 'PRINTF',
        '64': 'COM'
    };

    function shouldDisplayRow(classType) {
        const checkbox = document.querySelector(`input[value="${classType}"]`);
        return checkbox.checked;
    }
    
    function createTableRowFromColumns(columns) {
        const tr = document.createElement('tr');
    
        columns.forEach((col, index) => {
            const td = document.createElement('td');
            td.textContent = col.trim();
    
            if (index === 0 ) {
                td.classList.add('timestamp');
            }
            if (index === 1 ) {
                td.classList.add('cmp-id');
            }
            if (index === 2) {
                td.classList.add('class-id');
                const classType = CLASS_ID_MAPPING[col.trim()];
                if (classType) {
                    td.textContent = classType;
                    if (!shouldDisplayRow(classType)) {
                        tr.style.display = 'none';
                    }
                }
            }
            if (index === 3 ) {
                td.classList.add('error-id');
                const errorNumber = col.trim();
                if (errorDb && errorDb[errorNumber]) {
                    td.title = `[${errorNumber}] - ${errorDb[errorNumber].Name}: ${errorDb[errorNumber].Comment}`;
                }
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
    
        // Check if date and time are valid
        if (date === "Invalid Date" || time === "Invalid Date") {
            console.error("Invalid date detected:", row);
            return '';
        }
        
        const timestamp = `${date} ${time}`;
        const cmpId = columns.shift();
        const classId = columns.shift();
        const errorId = columns.shift(); // We'll not be using this as per the given format
        let infoText = columns.join(','); // Rest of the row, as info might contain commas
    
        const idRegex = /<id>([^<]+)<\/id>/;
        const extractedIdMatch = infoText.match(idRegex);
        const extractedId = extractedIdMatch ? extractedIdMatch[1].trim() : "";
    
        // General transformation for XML-like tags
        infoText = infoText.replace(/<(\w+)>([^<]+)<\/\1>/g, "$1: $2").replace(/\s*,\s*/g, ", ").trim();
    
        // Construct the new row
        return [timestamp, cmpId, classId, extractedId, infoText].join(', ');
    }



    async function handleLogData(data) {
    // Check if the data ends with a newline and remove it
    if (data.endsWith('\n')) {
        data = data.slice(0, -1);
    }

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

    // Moved this code block here to ensure the logs table is populated before event listeners are attached.
    document.querySelectorAll('#filterBoxes input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const classType = checkbox.value;
            document.querySelectorAll(`#logs table tr`).forEach(row => {
                const tdClass = [...row.children][2];
                if (tdClass.textContent === classType) {
                    row.style.display = checkbox.checked ? '' : 'none';
                }
            });
        });
    });
}
