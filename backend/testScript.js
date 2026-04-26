const testBids = [
  { bidderName: "Alice", bidAmount: 100, items: ["Car1", "Car2"] },
  { bidderName: "Bob", bidAmount: 80, items: ["Car1"] },
  { bidderName: "Charlie", bidAmount: 50, items: ["Car3"] }
];

async function run() {
  console.log("Clearing existing bids...");
  await fetch('http://localhost:5000/api/bids', { method: "DELETE" });

  console.log("Dispatching test combinatorial bids...");
  for(const bid of testBids) {
    await fetch('http://localhost:5000/api/bids', {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(bid)
    });
  }

  console.log("Fetching winners based on Greedy Density Heuristic...");
  const winnersResponse = await fetch('http://localhost:5000/api/winners');
  const winnersData = await winnersResponse.json();
  console.log("Winners result:\n", JSON.stringify(winnersData, null, 2));
}

run();
