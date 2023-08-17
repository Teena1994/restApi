const sql = require('mssql');
const dbConfig = require('../config/dbConfig');
/*
1. Create sql query based on API req Params.
2. Filter documents from SQL and Calculate machine utilization
*/
exports.getMachineUtilization = async (req, res) => {
    try {
        let mandatoryParamsRes = await checkForMandatoryParameters(req);

        if (mandatoryParamsRes.missingMandatoryParams) {

            res.status(400).json({ success: false, message: mandatoryParamsRes.errMessage });

        } else {

            const machineName = req.query.machine,
                startDate = req.query.startDate,
                endDate = req.query.endDate,
                pageNumber = parseInt(req.query.pageNumber) || 1,
                pageSize = parseInt(req.query.pageSize) || 10,
                pagination = req.query.pagination;

            console.log(`Query details are: machineName: ${machineName}, 
                                        startDate: ${startDate}, 
                                        endDate: ${endDate},
                                        pagination: ${pagination},
                                        pageNumber: ${pageNumber},
                                        pageSize: ${pageSize}`);

            // Connect to the sql database
            await sql.connect(dbConfig);

            // Calculate the offset for pagination
            const offset = (pageNumber - 1) * pageSize;

            //Create the sql query based on conditions
            let query = await createSqlQuery(machineName, startDate, endDate, pagination, pageNumber, pageSize, offset);

            //Get response from sql based on query created
            const result = await sql.query(query, { machineName, startDate, endDate, offset, pageSize });

            if (result.recordset.length === 0) {

                res.status(200).json({ success: false, message: 'No records found for the given filters' });

            } else {

                const operationalDuration = result.recordset[0].operationalDuration,
                    nonOperationalDuration = result.recordset[0].nonOperationalDuration;

                // Calculate machine utilization
                const utilization = (operationalDuration / 3600) / ((operationalDuration / 3600) + (nonOperationalDuration / 3600));

                res.status(200).json({ success: true, machine: machineName, result: result.recordsets[0], utilization: utilization.toFixed(2) });

            }
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

//Check whether any mandatory parameters are missing while calling API
checkForMandatoryParameters = async function (req) {
    try {
        console.log('checking mandatory parameters.');

        var mandatoryParamsRes = { missingMandatoryParams: false, errMessage: '' };

        if ((req.query.pagination === undefined) && ((req.query.pageNumber !== undefined) || (req.query.pageSize !== undefined))) {
            mandatoryParamsRes.missingMandatoryParams = true;
            mandatoryParamsRes.errMessage = `Missing parameter 'pagination'!`
        }
        return mandatoryParamsRes;
    } catch (e) {
        throw e;
    }
}

//Create sql query based on API req params 
createSqlQuery = async function (machineName, startDate, endDate, pagination, pageNumber, pageSize, offset) {
    try {

        let conditionalClauses = `WHERE 1=1`;

        if (machineName) {
            conditionalClauses += ` AND machine_name = '${machineName}'`;
        }

        if (startDate && endDate) {
            conditionalClauses += ` AND start_time >= '${startDate}' AND end_time <= '${endDate}'`;
        }

        if (pagination) {
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

       // console.log(query);

        return query;
    } catch (e) {
        throw e;
    }
}