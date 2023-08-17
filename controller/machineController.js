const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
/*
1. Get list of usa state details from mongo db collection 'state_details'.
2. Filter specific state name from the above array to get the coordinate details
*/
exports.getMachineUtilization = async (req, res) => {
    try {

        console.log('Calculating machine utilization!');

        const machineName = req.query.machine,
              startDate = req.query.startDate,
              endDate = req.query.endDate,
              pageNumber = parseInt(req.query.pageNumber) || 1,
              pageSize = parseInt(req.query.page_size) || 10,
              pagination = req.query.pagination;

        console.log(`Query details are: machineName: ${machineName}, 
                                        startDate: ${startDate}, 
                                        endDate: ${endDate},
                                        pagination: ${pagination},
                                        pageNumber: ${pageNumber},
                                        pageSize: ${pageSize}`);

        // Connect to the database
        await sql.connect(dbConfig);

        // Calculate the offset for pagination
        const offset = (pageNumber - 1) * pageSize;

        let conditionalClauses = `WHERE 1=1`;

        if (machineName) {
            conditionalClauses += ` AND machine_name = '${machineName}'`;
        }
      
        if (startDate && endDate) {
            conditionalClauses += ` AND start_time >= '${startDate}' AND end_time <= '${endDate}'`;
        }
        
        if(pagination){
            conditionalClauses += `
            GROUP BY
                machine_name
            ORDER BY
                operationalDuration DESC
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
        }
        
        // Query for operational and non-operational durations
        const query = `
        SELECT SUM(CASE WHEN status = 'operational' THEN duration ELSE 0 END) AS operationalDuration,
               SUM(CASE WHEN status = 'non_operational' THEN duration ELSE 0 END) AS nonOperationalDuration
        FROM state_change ${conditionalClauses} `;

        //console.log(query);

        const result = await sql.query(query, {
            machineName,
            startDate,
            endDate,
            offset,
            pageSize
        });

        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'No records found for the given filters' });
        } else {
        const operationalDuration = result.recordset[0].operationalDuration;
        const nonOperationalDuration = result.recordset[0].nonOperationalDuration;
    
        // Calculate machine utilization
        const utilization = (operationalDuration / 3600) / ((operationalDuration / 3600) + (nonOperationalDuration / 3600));
    
        res.status(200).json({ machine: machineName, result: result.recordsets[0], utilization: utilization.toFixed(2) });
       
    }

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

