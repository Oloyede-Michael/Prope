async function run() {
  try {
    const res = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          {
            __type(name: "Property") {
              fields {
                name
              }
            }
          }
        `
      })
    });
    const data = await res.json();
    console.log("FIELDS ON RUNNING SERVER:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to connect:", err);
  }
}

run();
