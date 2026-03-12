const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(url + '/rest/v1/products?name=eq.test%20only', {
  method: 'DELETE',
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
}).then(res => console.log('deleted test')).catch(console.error);
