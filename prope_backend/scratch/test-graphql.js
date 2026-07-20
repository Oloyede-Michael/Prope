async function run() {
  const query = `
    query {
      getMonnifyConfig {
        apiKey
        contractCode
      }
    }
  `;
  try {
    const res = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("GraphQL response status:", res.status);
    console.log("GraphQL response body:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
