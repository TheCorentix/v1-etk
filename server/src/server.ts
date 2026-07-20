import app from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("==================================");
  console.log("🚀 ETNIKO Backend Started");
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log("==================================");
});