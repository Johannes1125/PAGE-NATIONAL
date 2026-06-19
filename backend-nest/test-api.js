async function main() {
  try {
    const res = await fetch('http://localhost:8000/public/posts');
    console.log('API Response Status:', res.status);
    const json = await res.json();
    console.log('API Response Body:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('API request failed:', err);
  }
}
main();
