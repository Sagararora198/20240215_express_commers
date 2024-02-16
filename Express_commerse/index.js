/** THe task is to create a backend for a e-commerse website having multiple 
 * API's to update,delete,read and write in database which we have create
 * before using file system
 * @author {Sagar Arora}
 * 
 */


// import the database which we created
import Database from "./jsonDatabase.js"

/** To create a new Database object(instance)
 * 
 * @returns {Database} Database object
 */
function createDatabaseObject(){
  return new Database()
}


// importing uuid for generating unique id's(keys)
import {v4 as uuidv4 } from 'uuid'

// import the express library for http requests
import express from "express"

// create a express app 
const app = express()

//declare the port 
const port = 3000

// middleware to convert body param to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// for testing the working of server 
app.get('/', (req, res) => {
  res.send('Hello World!')
})




// search for the the product using product name
app.get('/search',async (req,res)=> {
  // get the query params from req
   const productName = req.query.searchText
    // create a object of database 
    let database = createDatabaseObject()
    // call the database
    await database.useDatabase("e_commerse")
    // use the productList table
    await database.createTable("ProductList")
    // read all records from the database
    const data = await database.readAllRecords()
    // search for specific product using product name as search parameter
    const products = data.find(product=>product.product_name==productName)
    //send as json if found
    if(products){
    res.json(products)
    }
    else{
      res.send("Product not found")
    }
    
})

app.get('/product/:id',async(req,res)=>{
  // get the parameter
  const id = req.params.id
  // create object
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("ProductList")
  // get the product
  const data = await database.readRecords(id)
  // send the data as json if found
  if(data){

    res.json(data)
  }
  else{
    res.send("Product with key not found")
  }
})

// to buy product from the store
app.put('/checkout',async(req,res)=>{

  // console.log(req.body);
  //get the body params from the request
  const productKey = req.body.id
  const productQuantity = req.body.itemNumber
  // create a object of database
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use the product list table
  await database.createTable("ProductList")
  // get specific record with product key
  const data = await database.readRecords(productKey)
  // if product not found
  if(!data){
    res.send("cannot find the product")
    return
  }
  // if not in stock throw error
  if((data.product_stocks-productQuantity)<0){
    res.send(`only ${data.product_stocks} are available`)
    return
  }
  // update record
  await database.updateRecord(productKey,{"product_stocks":(data.product_stocks-productQuantity)})
  // get the updated record
  const newData = await database.readRecords(productKey)

  // use the order table to update your order
  await database.createTable("Orders")
  // create a record of your order in the order table
  await database.createRecord({
    product_name:data.product_name,
    product_quantity:productQuantity,
    product_key:productKey,
    status:"Placed"
  },uuidv4())


  // give the updated record as json
  res.json(newData)

})

// this is for merchant to list their product
app.post('/merchant/product' ,async(req,res)=>{
  // console.log(req.body);
  // get all body params from the req
  const productKey = req.body.productKey
  const productName = req.body.productName
  const productDesc = req.body.productDesc
  const productPrice = req.body.productPrice
  const productImg = req.body.productImg
  const productStocks = req.body.productStocks


  
  // create a object of database
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use product list talbe
  await database.createTable("ProductList")
  // if record with id already present in database the do not do anything
  const checkData = await database.readRecords(productKey)
  if(checkData){
    res.send("data already exist")
    return
  }

  // create record for the merchant on the table
  await database.createRecord({
    product_name:productName,
    product_desc:productDesc,
    product_price:productPrice,
    product_stocks:productStocks,
    product_img:productImg
  },productKey)
  // get the record from the table
  const data = await database.readRecords(productKey)
  // display the record
  res.json(data)
})



// this is for merchant to update their product 
app.put('/merchant/product',async(req,res)=>{
  // get all body params
  const bodyParams = req.body
  const {productKey,...restOfParams} = bodyParams
  // create object of database
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use product list table
  await database.createTable("ProductList")
  // update the record
  await database.updateRecord(productKey,restOfParams)
  // get the updated record
  const data = await database.readRecords(productKey)
  //send the updated record as json
  res.json(data)
})

//this is for merchant to delete their product 
app.delete('/merchant/product',async(req,res)=>{
  // get all body params
  const productKey = req.body.productKey
  // create a object of database
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  //use table Product list
  await database.createTable("ProductList")
  // delete the record
  await database.deleteRecord(productKey)
  // update the merchant with success message
  res.send("deleted successfully")

})


// to cancel a order after checkout
app.put('/order/cancel',async(req,res)=>{
  // console.log(req.body);
  // get all body params
  const orderKey = req.body.orderKey
  // create database object
  let database = createDatabaseObject()
  //use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("Orders")
  // read the record with orderkey
  const orderData = await database.readRecords(orderKey)
  // get the product key from the order data
  const product_key = orderData.product_key
  // get the quantity purchased from order table
  const product_quantity = orderData.product_quantity
  // delete record from order table
  await database.deleteRecord(orderKey)


  await database.useDatabase("e_commerse")
  await database.createTable("ProductList")
  const productData = await database.readRecords(product_key)
  await database.updateRecord(product_key,{product_stocks:(productData.product_stocks+product_quantity)})
  res.send("successful")

})

// to get orders list by order id
app.get('/orders',async(req,res)=>{
  // get the query param
  const orderId = req.query.id
  // create object
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("Orders")
  // read the record with id
  const data = await database.readRecords(orderId)
  // send the record as json
  res.json(data)
})


// to check status of purchased product
app.get('/status',async(req,res)=>{
  // get query params
  const order_id = req.query.id
  // create object
  let database = createDatabaseObject()
  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("Orders")
  // read the database
  const data = await database.readRecords(order_id)
  res.send(data.status)
})


// to listen our request on PORT
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})