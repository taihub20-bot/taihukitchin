import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

// Initialize data.json if not exists
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    products: [],
    orders: [],
    users: [
      { id: "admin", email: "6901543900", password: "936581", role: "admin" }
    ]
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/products", (req, res) => {
    const data = getData();
    res.json(data.products);
  });

  app.post("/api/products", (req, res) => {
    // Admin check would go here in real app
    const data = getData();
    const newProduct = { ...req.body, id: Date.now().toString() };
    data.products.push(newProduct);
    saveData(data);
    res.json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const data = getData();
    const id = String(req.params.id);
    const index = data.products.findIndex((p: any) => String(p.id) === id);
    if (index !== -1) {
      data.products[index] = { ...data.products[index], ...req.body, id }; // Ensure ID stays same
      saveData(data);
      res.json(data.products[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const data = getData();
    const id = String(req.params.id);
    const index = data.products.findIndex((p: any) => String(p.id) === id);
    if (index !== -1) {
      data.products.splice(index, 1);
      saveData(data);
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Product not found with ID: " + id });
    }
  });

  app.get("/api/orders", (req, res) => {
    const data = getData();
    res.json(data.orders);
  });

  app.post("/api/orders", (req, res) => {
    const data = getData();
    const newOrder = { 
      ...req.body, 
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    data.orders.push(newOrder);
    
    // Update inventory
    newOrder.items.forEach((item: any) => {
      const product = data.products.find((p: any) => p.id === item.id);
      if (product) {
        product.inventory -= item.quantity;
      }
    });

    saveData(data);
    res.json(newOrder);
  });

  app.get("/api/orders/:id", (req, res) => {
    const data = getData();
    const order = data.orders.find((o: any) => o.id === req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.put("/api/orders/:id", (req, res) => {
    const data = getData();
    const index = data.orders.findIndex((o: any) => o.id === req.params.id);
    if (index !== -1) {
      data.orders[index] = { ...data.orders[index], ...req.body };
      saveData(data);
      res.json(data.orders[index]);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const data = getData();
    const user = data.users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      // Return simple user object (in real app, return JWT)
      res.json({ id: user.id, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
