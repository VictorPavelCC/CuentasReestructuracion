const { Router } = require("express");
const { cartModel } = require("../models/cart.model");
const { productModel } = require("../models/product.model")
const router = Router();


//POST
router.post("/make", async (req, res) => {
  try {
    const newCart = new cartModel({ products: [] });
    await newCart.save();

    res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
})



//GET
router.get("/", async (req, res) => {
  try {
    let carts = await cartModel.find().populate("products.product");

    res.json({ status: "success", payload: carts });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los carritos" })
  }
});

router.get("/:cid", async (req, res) => {
  const id = req.params.cid;
    try {
      
      const cart = await cartModel.findById(id).populate("products.product")
     

      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }

      const resume = cart.products.map(async (p) => {
      const data = {};
      data.info = await productModel.findById(p.product);
      data.quantity = p.quantity;
      data.total = data.info.price * p.quantity;
      
      return data;
    });
    const products = await Promise.all(resume);
  
    let total = 0;
    
    for (const product of cart.products) {
      total += product.product.price * product.quantity;
    }

      res.render("carts", {
        status: "success",
        cartId: id,
        products,
        total: total,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

//PUT -  Actualizar el carrito 
router.put("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const productId = req.body.productId;
  console.log(cid)

  try {
    const product = await productModel.findById(productId);

    if (!product) res.status(404).json({ error: "No se encontro el producto" });

    if (!product.stock > 0)
      res.status(404).json({ error: "No hay stock disponible del producto" });

    const cart = await cartModel.findById(cid);
    console.log(cart)

    if (!cart) res.status(404).json({ error: "El carrito no existe" });

    const cartProduct = cart.products.find(
      (product) => product.product.toString() === productId
    );

    if (cartProduct) {
      cartProduct.quantity += 1;
      product.stock -= 1;
    } else {
      cart.products.push({ product: product._id });
    }

    
    await productModel.updateOne({ _id: productId }, product);

    await cartModel.updateOne({ _id: cid }, cart);

    res.status(200).json({ ok: "Producto agregado correctamente" });
  } catch (error) {
    console.log(error);
  }
});

// Actualizar la cantidad de un producto del carrito
router.put("/:cid/products/:pid", async (req, res) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      const cart = await cartModel.findById(cid);

      if (!quantity || quantity < 0) {
        return res.status(400).json({ error: "Cantidad inválida" });
      }
  
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
  
      const products = cart.products || [];
      const productUpdate = products.find((product) => product.product == pid);
  
      if (!productUpdate) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito" });
      }
  
      productUpdate.quantity = quantity;
      await cart.save();
  
      res.json({ message: "La cantidad del producto fue actualizada"  });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la cantidad de producto en el carrito" });
    }
});


//DELETE - Eliminar un producto específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
      const { cid, pid } = req.params;
      const quantity = req.body.quantity;
      const cart = await cartModel.findById(cid);

      if (!cart) {
          return res.status(404).json({ error: "Carrito no encontrado" });
      }

      const productIndex = cart.products.findIndex((item) => item.product.toString() === pid);

      if (productIndex === -1) {
          return res.status(404).json({ error: "Producto no encontrado en el carrito" });
      }

      const product = cart.products[productIndex];
      const productData = await productModel.findById(pid);

      if (quantity > product.quantity) {
          return res.status(400).json({ error: "La cantidad a eliminar es mayor que la cantidad en el carrito" });
      }

      //productData.stock += quantity; // Resta la cantidad eliminada del stock del producto en la base de datos
      await productData.save();

      product.quantity -= quantity; // Resta la cantidad eliminada del carrito
      if (product.quantity === 0) {
          cart.products.splice(productIndex, 1); // Si la cantidad en el carrito llega a cero, elimina el producto del carrito
      }

      await cart.save(); // Guarda el carrito actualizado

      res.json({ message: "Producto eliminado del carrito con éxito" });
  } catch (error) {
      res.status(500).json({ error: "Error al eliminar el producto del carrito" });
  }
});



// DELETE api/carts/:cid - Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await cartModel.findById(cid);
  
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
      
      cart.products.map(async (product) => {
        const item = await productModel.findById(product.product._id);
        item.stock += product.quantity;
        item.save();
      });

      cart.products = [];
      await cart.save();
  
      res.json({  message: "El Carrito ha sido vaciado" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar vaciar del carrito" });
    }
});






module.exports = router;