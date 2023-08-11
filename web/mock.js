function mockFetch() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.log';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(new Response(e.target.result));
                };
                reader.onerror = (e) => {
                    reject(new Error('Failed to read file'));
                };
                reader.readAsText(file);
            } else {
                reject(new Error('No file selected'));
            }
        };
        document.body.appendChild(input); // Add it to the body so it's in the DOM
        input.click();
        document.body.removeChild(input); // Clean up after ourselves
    });
}

function handleLogData(data) {
    const table = createTableFromLogs(data);
    const logContainer = document.getElementById('logs');
    logContainer.innerHTML = ''; // Reset current logs before appending
    logContainer.appendChild(table);
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
        if(index === 2 || index === 3 || index === 4) {
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




function formatLogRow(row) {
    const columns = row.split(',');
    const timestamp = columns.shift();
	const cmpId = columns.shift();
	const classId = columns.shift();
	const errorId = columns.shift();
	const infoId = columns.shift();
    let infoText = columns.join(','); // Rest of the row, as info might contain commas

    // General transformation for XML-like tags
    infoText = infoText.replace(/<(\w+)>([^<]+)<\/\1>/g, "$1: $2").replace(/\s*,\s*/g, ", ").trim();

    // Check for comment lines
    if (row.trim().startsWith(';')) {
        return row.replace(/^;/, '').trim();
    }

    return `${timestamp}, ${cmpId}, ${classId}, ${errorId}, ${infoId}, ${infoText}`;
}


document.getElementById('loadLogs').addEventListener('click', async function() {
    try {
        const response = await mockFetch();
        const data = await response.text();
        handleLogData(data);
    } catch (error) {
        console.error('Error:', error.message);
    }
});
