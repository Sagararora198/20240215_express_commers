/* This task is to create a database using file handling in javascript 
 * it should perform all crud operations and try to immitate an actual database 
 * @author Sagar Arora 
*/



// the filehandling will be done through fs library  

import fs from "fs/promises"
import { readdirSync, statSync, rmdirSync, renameSync, rename } from 'fs'
import { error, log } from "console";

/** The main class where all the operation will be performed
 * 
 */
class Database {
    // variable will store the path of current database and table we are working on

    /** contains the database path
     * @private {String} path of the database
     */
    databasePath;

    /** contains the path of the table
     * @private {String}   path of the table
     * 
    */
    tablePath;

    // TODO:utility funnctions


    /**Get the present database path
     * 
     * @returns {Promise<String>} database path
     */
    async getDatabasePath() {
        return await this.databasePath
    }

    /**Get the present table path
     * 
     * @returns {Promise<String>} table path
     */
    async getTablePath() {
        return await this.tablePath
    }

    /** a validation function for database name
     * 
     * @param {String} nameOfDatabase name of database
     * @throws {Error} input is not a string
     * @throws {Error} string contains special characters
     */
    checkForName(nameOfDatabase) {
        // if wrong type of input is given
        if (typeof nameOfDatabase != 'string') {
            return new Error("Name should be a string")
        }
        // if string contain special characters
        const notAllowedCaracters = new RegExp('/^[a-zA-z0-9]+$/')
        if (notAllowedCaracters.test(nameOfDatabase) == false) {
            return new Error("The string should not contain any special sharacter")
        }

    }

    // TODO:create functions


    /** create a new database 
     * @param {String} nameOfDatabase name of database
     * @returns {Promise<{ success: boolean, message: string }>} A Promise that resolves to an object with success and message          properties.
     * @throws {Error} nameofDatabase is not valid
     * @throws {Error} database already exist
     * 
     */
    // create operation for database
    async createDatabase(nameOfDatabase) {


        // check if database already exist
        try {
            await fs.mkdir(nameOfDatabase)
            // console.log("Database Created successfully");
            return { 'success': true, 'message': 'Database Created successfully' }

        }
        catch (error) {
            if (error.code === 'EEXIST') {
                // console.log("Database already exist");
                return { 'success': false, 'message': 'Database already exist' }
            }
            else {
                // console.log("Error creating database",error.message);
                return { 'success': false, ',message': `Error creating database: ${error.message}` }
            }

        }



    }

    /** Use the database for CRUD operation
     * 
     * @param {nameOfDatabase} nameOfDatabase name of your database
     * 
     */
    async useDatabase(nameOfDatabase) {
        //check for validation
        this.checkForName(nameOfDatabase)
        this.databasePath = nameOfDatabase
        try {
            const result = await this.createDatabase(nameOfDatabase)
            if (result.success == true) {
                console.log("Database does not exist: " + result.message);
            }
            console.log("Using database: " + nameOfDatabase);
        }
        catch (error) {
            console.error(error.message);
        }
    }

    /**create new table
     * 
     * @param {string} nameOfTable name of table
     * @throws {Error} nameOfTable parameter not valid
     * @throws {Error} table already exist
     */
    // create operation for a table
    async createTable(nameOfTable) {
        // check for string validity
        this.checkForName(nameOfTable)


        //get the name of database 
        let currentDatabasePath = await this.getDatabasePath()



        // create path for new table
        let currentTablePath = `${currentDatabasePath}\\${nameOfTable}.json`

        // add the final path 
        this.tablePath = currentTablePath
       

        // check if table already exist
        try {
            await fs.access(currentTablePath)
            // console.log(`Table ${nameOfTable} already exist`);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                const fileContent = JSON.stringify({});
                await fs.writeFile(currentTablePath, fileContent);
                console.log("File created successfully");
            }


            else {
                console.log(error.message);
            }
        }

    }
    


        
  

    /** Crete record 
     * @param {String} contentOfRecord Record you want to enter in database 
     * @param {Number} uniqueKey represent to unique key for each record in table
     * 
     * @throws {Error} cannot append record in table
     */
    // create operation for a new record
    async createRecord(contentOfRecord, uniqueKey) {

        // get the path of the table
        const totalPath = await this.getTablePath()

        try {
            const data = JSON.parse(await fs.readFile(totalPath, 'utf-8'))
            
            // console.log(newRecord);
            // console.log(data);
            data[uniqueKey] = contentOfRecord
           
            
            await fs.writeFile(totalPath, JSON.stringify(data))
        }
        catch (err) {
            console.error(err);
        }

    }

    //TODO: read funtions


    /** read all tables in a database
     * 
     * @param {String} nameOfTable name of table 
     * @returns {Array} array of tables names in a database
     */
    readAllTables(databasename) {
        try {
            // Read the content of the current working directory
            const databasePath = `${databasename}`
            const Tables = readdirSync(databasePath)



            return Tables;
        } catch (error) {
            console.error('Error:', error.message);
            return [];
        }
    }

    /** Reads all the database name present synchronously
     * @throws {Error} cannot read the database
     */
    readDatabases() {
        try {
            // Read the content of the current working directory
            const DatabasesAndTables = readdirSync('./');

            // Filter out only the databases
            const Databases = DatabasesAndTables.filter(database => statSync(database).isDirectory());

            return Databases;
        } catch (error) {
            console.error('Error:', error.message);
            return [];
        }
    }

    /** Read particular record in a table
     * 
     * @param {Number} uniqueKey read the unique record
     * @param {String} tableName name of table whose record to be fetched
     * @returns {String} record
     * @throws {Error} unique key is not valid
     * @throws {Error} cannot read table record
     * @throws {Error} table does not exist
     */
    async readRecords(uniqueKey) {
        

        const pathOfTable = await this.getTablePath()
        

        try {
            const data = JSON.parse(await fs.readFile(pathOfTable, 'utf-8'))
            if(Object.prototype.hasOwnProperty.call(data, uniqueKey)){
                // console.log(data[uniqueKey]);
                return data[uniqueKey]
            }
        }
        catch (err) {
            console.error(err.message);
        }




    }

    /** Reads all record in a table
     * 
     * @param {String} tableName name of the table 
     * @returns {String} Record present in table
     * @throws {Error} table does not exost
     */
    async readAllRecords() {
        const pathOfTable = await this.getTablePath()


        try {
            const data = JSON.parse(await fs.readFile(pathOfTable, 'utf-8'))
            let listOfData = []
            for (const i in data) {
                if (Object.hasOwnProperty.call(data, i)) {
                    const element = data[i];
                    listOfData.push(element)
                    // console.log(element);
                    
                }
            }
            return listOfData

        }
        catch (err) {
            console.error(err.message);
        }


    }

    // TODO:update functions


    /** update record in a table using unique key
     * 
     * @param {Number} uniqueKey Record unique key
     * @param {String} tableName name of the table
     * @param {String} content content you want to insert insted of original
     * @throws {Error} unique key does not exist
     * @throws {Error} table does not exist
     */
    async updateRecord(uniqueKey,  content) {
        const pathOfTable = await this.getTablePath()
        try {
            const data = JSON.parse(await fs.readFile(pathOfTable, 'utf-8'))
            if (Object.prototype.hasOwnProperty.call(data, uniqueKey)) {
                data[uniqueKey] = { ...data[uniqueKey], ...content };
                await fs.writeFile(pathOfTable, JSON.stringify(data));
                console.log(`Record with key ${uniqueKey} updated successfully`);
            }
            else{
                console.log(`Record with key ${uniqueKey} not found`);
            }
        }

        catch (err) {
            console.error(err.message);
        }


    }
    /**Update database name
     * @param {String} newName new name for database
     * @param {String} oldName current name of database
     * @throws {Error} new name is not valid 
     */
    updateDatabase(oldName, newName) {
        this.checkForName(newName)
        try {
            renameSync(oldName, newName)
            console.log(`name updated successfully: Run use ${newName} to start operations`);
        }
        catch (err) {
            console.error(err.message);
        }
    }

    //TODO: delete functions


    /**delete a record in a table
     * 
     * @param {Number} uniqueKey Record unique key 
     * @param {String} tableName name of table
     * @throws {Error} table does not exist
     */
    async deleteRecord(uniqueKey) {

        const pathOfTable = await this.getTablePath()

        try {
            const data = JSON.parse(await fs.readFile(pathOfTable, 'utf-8'));
    
            // Check if the uniqueKey exists in the data object
            if (Object.prototype.hasOwnProperty.call(data, uniqueKey)) {
                // Delete the record with the specified uniqueKey
                delete data[uniqueKey];
    
                // Write the updated records back to the file
                await fs.writeFile(pathOfTable, JSON.stringify(data));
    
                console.log(`Record with key ${uniqueKey} deleted successfully`);
            } else {
                console.log(`Record with key ${uniqueKey} not found`);
            }
        } catch (err) {
            console.error(err.message);
        }




    }

    /** delete a table from database
     * 
     * @param {String} tableName name of the table
     */
    async deleteTable(tableName) {
        const pathOfTable = `${this.databasePath}/${tableName}.json`
        try {
            await fs.unlink(pathOfTable)
            console.log('table deleted successfully');
        }
        catch (err) {
            console.error(err.message);
        }

    }

    /** delete the database
     * @param {String} nameOfDatabase name of database
     * @throws {Error} database does not exist 
     */
    async deleteDatabase(nameOfDatabase) {
        if (this.readDatabases().includes(nameOfDatabase)) {
            await fs.rm(nameOfDatabase, { recursive: true, force: true })
            console.log(`Database ${nameOfDatabase} deleted successfully`);
        }
        else {
            return new Error(`${nameOfDatabase} does not exist`)
        }

    }


    /**Perform database operations for testing.
     
     * @returns {Promise<void>} A Promise that resolves when all operations are completed.
     */
    async performTestOperations() {
        try {
            // Create a new database
            await this.useDatabase("e_commerse");

            // Create a new table
            await this.createTable("ProductList");

            // Create records
            // await this.createRecord({ "name": 'sagar',"age":22,"location":"Hyderabad" }, 2);
            // await this.createRecord({ "name": 'pranay',"age":21,"location":"Hyderabad" }, 1);
            // await this.createRecord({ "name": 'asfdf',"age":35,"location":"Hyderabad" }, 3);

            // Update a record
            // await this.updateRecord(3,{ "age":25 });

            // Read all records
            console.log( await this.readAllRecords());

            // Read a specific record
            // await this.readRecords(2);

            // Delete a record
            // await this.deleteRecord(2);

            // Delete the table
            // await this.deleteTable('newTable');

            // Delete the database
            // await this.deleteDatabase("new");

            // Update the database name
            // await this.updateDatabase("new", "newww");

            // Log the list of databases
            // console.log(this.readDatabases());
        } catch (error) {
            console.error(error.message);
        }
    }
}








// let testObj = new Database()
// testObj.performTestOperations()



// let newObj = new Database()
// newObj.useDatabase("new")
    // .then(() => newObj.createTable("newTable"))

    // // console.log(newObj.readAllTables('new'));
    // .then(() => newObj.createRecord({ "name": 'sagar' }, 2))
    // .then(()=> newObj.createRecord({"name":"asdf"},3))
    // .then(()=> newObj.createRecord({"name":"vbnm"},4))
// .then(()=> newObj.updateRecord(2,{"name":"kunal"}))
// .then(()=>newObj.deleteRecord(2))
// .then(()=>newObj.deleteTable('newTable'))
// .then(()=>newObj.readAllRecords())
// .then(()=>newObj.readRecords(2))
// .then(()=>newObj.deleteTable('newTable'))
// .then(()=>newObj.deleteDatabase("new"))
// .then(()=>newObj.updateDatabase("new","newww"))


// console.log(newObj.readDatabases());

// newObj.useDatabase("Innovapptive")
// .then(()=> newObj.createTable("newJoinee"))
// .then(()=> newObj.createRecord("names of new joinee",1))
// .then(()=> newObj.createRecord("Sagar",2))
// .then(()=> newObj.createRecord("Atharv",3))
// .then(()=> newObj.createRecord("Pranay",4))
// .then(()=> newObj.updateRecord(4,"newJoinee","Pranay Jain"))
// .then(()=> newObj.readAllRecords("newJoinee"))
// .then(()=> newObj.readRecords(4,"newJoinee"))


// newObj.useDatabase("Test")
// .then(()=>newObj.createTable("testTable"))

export default Database