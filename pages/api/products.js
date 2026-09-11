import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'products.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ error: 'Errore lettura prodotti' });
    }
  }

  if (req.method === 'POST') {
    try {
      const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const product = req.body;

      const newProduct = {
        id: Date.now(),
        title: product.title,
        price: Number(product.price),
        seller: product.seller || 'Utente RiverSpend',
        rating: 0,
        reviewsCount: 0,
        condition: product.condition || 'Nuovo',
        description: product.description || '',
        images: product.image ? [product.image] : []
      };

      products.push(newProduct);

      fs.writeFileSync(
        filePath,
        JSON.stringify(products, null, 2),
        'utf8'
      );

      return res.status(201).json(newProduct);
    } catch (error) {
      return res.status(500).json({ error: 'Errore salvataggio prodotto' });
    }
  }

  return res.status(405).json({ error: 'Metodo non consentito' });
}
