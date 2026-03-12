const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(url + '/rest/v1/products', {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    name: 'test from server',
    description: 'test desc',
    price: 150,
    category: 'bracelets',
    stock: 50,
    image: 'test.png',
    metadata: {}
  })
}).then(res => res.json()).then(console.log).catch(console.error);
