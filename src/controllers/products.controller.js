const { productModel } = require("../dao/models/product.model");
const { cartModel } = require("../dao/models/cart.model");


exports.getAllProducts = async (req, res) => {
    try {
        let { limit, page, sort, category } = req.query
    
    
        limit = parseInt(limit, 10) || 10;
        page = parseInt(page, 10) || 1;
        sort = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};
    
        const query = category ? { category } : {};
    
        const options = {limit ,page ,sort};
    
        let products = await productModel.paginate(query, options);
    
        const totalPages = products.totalPages;
        const hasPrevPage = products.hasPrevPage;
        const hasNextPage = products.hasNextPage;
        const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&category=${category}` : null;
        const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&category=${category}` : null;
    
        console.log(products.docs)
        res.send({
          status: "success",
          payload: products.docs,
          totalPages,
          prevPage: page - 1,
          nextPage: page + 1,
          page,
          hasPrevPage,
          hasNextPage,
          prevLink,
          nextLink,
        });
    
      } catch (error) {
        res.status(500).json({ status: "error", error: "Error al obtener los productos" })
      }
  };
  
  exports.getProductList = async (req, res) => {
    let { limit, page, sort, category } = req.query;
  try {
    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 1;
    sort = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    const query = category ? { category } : {};

    const options = {limit ,page ,sort};

    const user = req.session.user;
    //const userID = req.session.user.user;
    const userCartID = req.session.user._id;
    
  
    const userCart = await cartModel.findOne({ user: userCartID });

    const cid = userCart._id.toString();
    const uid = userCart.user.toString();

    let products = await productModel.paginate(query, options);


    const pageNumbers = [];
    for (let i = 1; i <= products.totalPages; i++) {
      pageNumbers.push({ number: i, current: i === products.page });
    }
    let categories;
    try {
      const result = await productModel.distinct("category");
      categories = result;
      categories.push("Todas");
    } catch (error) {}

    res.render("productsList", {
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      pageNumbers: pageNumbers,
      categories: categories,
      user:user,
      userID:uid,
      userCartId: cid,
    });
  } catch (error) {
    res.render("productsList", {
      status: "error",
    });
  }
  };


  exports.getProductById = async (req, res) => {
    let id = req.params.id;
  try {
    const product = await productModel.findById(id);

    res.render("product", {
      payload: product,
    });
  } catch (error) {
    res.status({
      status: error,
    });
  }
  };

  
  exports.getProductsByCategory = async (req, res) => {
    try {
        const categories = await productModel.distinct("category");
        res.send({
          categories: categories,
        });
      } catch (error) {
        res.render("productsList", {
          status: error,
        });
      }
  };
  
    
  exports.postProduct = async (req, res) => {
    let { name, category, price, stock, image } = req.body

    if (!name || !category || !price || !stock || !image)
      res.send({ status: "error", error: "Missing parameters" })
  
    let result = await productModel.create({
      name,
      category,
      price,
      stock,
      image,
    })
  
    res.send({ result: "success", payload: result })
  };
  

  exports.putProduct = async (req, res) => {
    let { name, category, price, stock, image } = req.body
    if (!name || !category || !price || !stock || !image)
      res.send({ status: "error", error: "Missing parameters" })
  
    let result = await productModel.updateMany({
      name,
      category,
      price,
      stock,
      image,
    })
  
    res.send({ result: "success", payload: result })
  };
  
  exports.deleteProduct = async (req, res) => {
    let { name } = req.body

  if (!name) res.send({ status: "error", error: "Missing parameters" })

  let result = await productModel.find({ name: name }).deleteOne()
  console.log(result)
  res.send({ result: "success", payload: result })
  };
  