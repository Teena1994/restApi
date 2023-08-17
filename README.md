-------------------------------------------------------------------------------------------
API using Node.js and Express.js that interacts with a Microsoft SQL Server database and provides aggregated information for a specified metric. The API retrieve data from the SQL database, calculate the designated metric like machine utilization, and return the aggregated result.

----------------------------API SETUP----------------------------------------

    1. npm install
    2. Go to folder, node index.js

------------------------------API Documentation------------------------------

    METHOD : GET

    DESCRIPTION : Calculate machine utilization by machine name, date filter and pagination

    API EXAMPLE : http://localhost:3000/api/aggregate?machine=Moulding_Geiss2&startDate=2022-06-13&endDate=2023-08-17&pagination=true&pageNumber=1&pageSize=5

    PARAMS : 
        machine - Machine name. Eg: Moulding_Geiss2

        startDate: Date in format yyyy-mm-dd. Eg: 2022-06-13

        endDate: Date in format yyyy-mm-dd. Eg: 2023-08-17

        pagination: Boolean value which should be true if pagination is needed. If not passed will be considered as false and is mandatory if pageNumber or  pageSize is passed in the request.

        pageNumber : Number. By default will be considered as 1.

        pageSize: Number. By default will be considered as 10.

----------------------------------------------------------------------------------

Import Maverick.postman_collection.json in postman for testing API's

----------------------------------------------------------------------------------
